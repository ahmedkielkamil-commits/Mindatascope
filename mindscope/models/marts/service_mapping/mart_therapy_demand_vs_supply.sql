{{ config(materialized='table') }}

with zip_therapy_keys as (
    select zip_code, intervention as therapy_type
    from {{ source('mindscope', 'recommendation_events') }}
    union
    select zip_code, therapy_type
    from {{ source('mindscope', 'facility_search_events') }}
),

demand as (
    select
        zip_code,
        intervention as therapy_type,
        count(case when was_gap = true then 1 end) as times_recommended
    from {{ source('mindscope', 'recommendation_events') }}
    group by zip_code, intervention
),

supply as (
    select
        zip_code,
        therapy_type,
        count(distinct submission_id) as total_searches,
        sum(case when tier = 'recommended' then 1 else 0 end) as facilities_found_recommended,
        sum(case when tier = 'possible' then 1 else 0 end) as facilities_found_possible,
        sum(case when tier = 'excluded' then 1 else 0 end) as facilities_found_excluded,
        avg(case when tier = 'recommended' then total_score end) as avg_top_score
    from {{ source('mindscope', 'facility_search_events') }}
    group by zip_code, therapy_type
),

combined as (
    select
        k.zip_code,
        k.therapy_type,
        coalesce(d.times_recommended, 0) as times_recommended,
        coalesce(s.total_searches, 0) as total_searches,
        coalesce(s.facilities_found_recommended, 0) as facilities_found_recommended,
        coalesce(s.facilities_found_possible, 0) as facilities_found_possible,
        coalesce(s.facilities_found_excluded, 0) as facilities_found_excluded,
        s.avg_top_score,
        case
            when coalesce(d.times_recommended, 0) = 0 then null
            when coalesce(s.facilities_found_recommended, 0) = 0 then 0.0
            else least(
                1.0,
                s.facilities_found_recommended / d.times_recommended
            )
        end as supply_coverage_rate
    from zip_therapy_keys as k
    left join demand as d
        on k.zip_code = d.zip_code
        and k.therapy_type = d.therapy_type
    left join supply as s
        on k.zip_code = s.zip_code
        and k.therapy_type = s.therapy_type
)

select
    zip_code,
    therapy_type,
    times_recommended,
    total_searches,
    facilities_found_recommended,
    facilities_found_possible,
    facilities_found_excluded,
    avg_top_score,
    supply_coverage_rate,
    case
        when times_recommended = 0 then 'no_demand'
        when supply_coverage_rate = 0 and times_recommended >= 3 then 'critical'
        when supply_coverage_rate < 0.5 and times_recommended >= 2 then 'high'
        when supply_coverage_rate < 1.0 and times_recommended >= 1 then 'moderate'
        when supply_coverage_rate >= 1.0 then 'covered'
    end as gap_severity
from combined
