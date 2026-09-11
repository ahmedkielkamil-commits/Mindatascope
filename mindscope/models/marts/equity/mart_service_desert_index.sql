{{ config(materialized='table') }}

with demand as (
    select
        zip_code,
        count(*) as total_recommendations,
        sum(case when severity = 'critical' then 1 else 0 end) as critical_recommendations,
        (count(*) * 1.0) + (sum(case when severity = 'critical' then 1 else 0 end) * 0.5) as demand_score
    from {{ source('mindscope', 'recommendation_events') }}
    group by zip_code
),

demand_normalized as (
    select
        zip_code,
        total_recommendations,
        critical_recommendations,
        demand_score,
        case
            when max(demand_score) over () = 0 then null
            else demand_score / max(demand_score) over ()
        end as demand_score_normalized
    from demand
),

supply as (
    select
        zip_code,
        sum(case when tier = 'recommended' then 1 else 0 end) as recommended_facilities_found,
        count(distinct submission_id) as total_searches,
        case
            when count(distinct submission_id) = 0 then null
            else sum(case when tier = 'recommended' then 1 else 0 end) / count(distinct submission_id)
        end as avg_recommended_per_search
    from {{ source('mindscope', 'facility_search_events') }}
    group by zip_code
),

supply_scored as (
    select
        zip_code,
        recommended_facilities_found,
        total_searches,
        avg_recommended_per_search,
        case
            when avg_recommended_per_search is null then null
            else 1 - least(avg_recommended_per_search / 3.0, 1.0)
        end as supply_score
    from supply
),

followthrough as (
    select
        zip_code,
        followthrough_rate,
        followthrough_tier,
        total_care_plans,
        case
            when followthrough_rate is null then null
            else 1 - (followthrough_rate / 100.0)
        end as followthrough_gap_score
    from {{ ref('mart_referral_followthrough_by_zip') }}
),

all_zips as (
    select zip_code from demand_normalized
    union
    select zip_code from supply_scored
    union
    select zip_code from followthrough
),

combined as (
    select
        z.zip_code,
        d.total_recommendations,
        d.critical_recommendations,
        d.demand_score,
        d.demand_score_normalized,
        s.recommended_facilities_found,
        s.total_searches,
        s.avg_recommended_per_search,
        s.supply_score,
        f.followthrough_rate,
        f.followthrough_gap_score,
        f.followthrough_tier,
        f.total_care_plans,
        round(
            (d.demand_score_normalized * 0.40)
            + (s.supply_score * 0.35)
            + (f.followthrough_gap_score * 0.25),
            3
        ) as service_desert_index
    from all_zips as z
    left join demand_normalized as d
        on z.zip_code = d.zip_code
    left join supply_scored as s
        on z.zip_code = s.zip_code
    left join followthrough as f
        on z.zip_code = f.zip_code
)

select
    zip_code,
    coalesce(total_recommendations, 0) as total_recommendations,
    coalesce(critical_recommendations, 0) as critical_recommendations,
    demand_score,
    demand_score_normalized,
    coalesce(recommended_facilities_found, 0) as recommended_facilities_found,
    coalesce(total_searches, 0) as total_searches,
    avg_recommended_per_search,
    supply_score,
    followthrough_rate,
    followthrough_gap_score,
    service_desert_index,
    followthrough_tier,
    coalesce(total_care_plans, 0) as total_care_plans,
    case
        when demand_score_normalized is null
            or supply_score is null
            or followthrough_gap_score is null
            then 'insufficient_data'
        when service_desert_index >= 0.75 then 'severe_desert'
        when service_desert_index >= 0.50 then 'significant_desert'
        when service_desert_index >= 0.25 then 'moderate_gap'
        else 'adequately_served'
    end as desert_tier
from combined
