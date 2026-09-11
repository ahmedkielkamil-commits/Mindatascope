{{ config(materialized='table') }}

with therapy_stats as (
    select
        intervention as therapy_type,
        therapy_category,
        count(*) as total_recommendations,
        sum(case when was_gap = true then 1 else 0 end) as total_gaps,
        sum(case when was_gap = false then 1 else 0 end) as total_already_receiving,
        avg(gap_score) as avg_severity_score,
        sum(case when severity = 'critical' then 1 else 0 end) as critical_count,
        sum(case when severity = 'high' then 1 else 0 end) as high_count,
        sum(case when severity = 'moderate' then 1 else 0 end) as moderate_count,
        count(distinct zip_code) as zip_codes_affected
    from {{ source('mindscope', 'recommendation_events') }}
    group by intervention, therapy_category
),

zip_ranked as (
    select
        intervention as therapy_type,
        zip_code,
        row_number() over (
            partition by intervention
            order by count(*) desc, zip_code
        ) as zip_rank
    from {{ source('mindscope', 'recommendation_events') }}
    group by intervention, zip_code
),

most_common_zip as (
    select
        therapy_type,
        zip_code as most_common_zip
    from zip_ranked
    where zip_rank = 1
)

select
    ts.therapy_type,
    ts.therapy_category,
    ts.total_recommendations,
    ts.total_gaps,
    ts.total_already_receiving,
    (ts.total_gaps / ts.total_recommendations) * 100 as gap_rate,
    ts.avg_severity_score,
    ts.critical_count,
    ts.high_count,
    ts.moderate_count,
    ts.zip_codes_affected,
    mcz.most_common_zip
from therapy_stats as ts
left join most_common_zip as mcz on ts.therapy_type = mcz.therapy_type
order by ts.total_recommendations desc
