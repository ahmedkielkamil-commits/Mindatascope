{{ config(materialized='table') }}

/*
  Grouped by exact behavioral marker description. Fuzzy grouping by semantic
  similarity would require application-level processing — future enhancement.
*/

with marker_stats as (
    select
        bc.behavior_checkid,
        bc.description,
        bc.stage as stage_number,
        bc.status,
        rm.created_at as roadmap_created_at,
        bc.met_at,
        case
            when bc.status = 'met' and bc.met_at is not null
                then datediff(bc.met_at, rm.created_at)
        end as days_to_met
    from {{ source('mindscope', 'behavior_checks') }} as bc
    inner join {{ source('mindscope', 'parent_tasks') }} as pt
        on bc.parent_taskid = pt.parent_taskid
    inner join {{ source('mindscope', 'roadmap') }} as rm
        on pt.roadmapid = rm.roadmapid
),

aggregated as (
    select
        min(behavior_checkid) as behavior_checkid,
        description,
        stage_number,
        concat('Stage ', stage_number) as stage_label,
        count(*) as total_count,
        sum(case when status = 'met' then 1 else 0 end) as met_count,
        sum(case when status = 'not_met' then 1 else 0 end) as not_met_count,
        sum(case when status = 'in_progress' then 1 else 0 end) as in_progress_count,
        avg(days_to_met) as avg_days_to_met
    from marker_stats
    group by description, stage_number
)

select
    behavior_checkid,
    description,
    stage_number,
    stage_label,
    case
        when met_count = total_count then 'met'
        when not_met_count = total_count then 'not_met'
        when in_progress_count > 0 then 'in_progress'
        else 'not_met'
    end as status,
    total_count,
    met_count,
    not_met_count,
    in_progress_count,
    (met_count / total_count) * 100 as met_rate,
    case
        when (met_count / total_count) < 0.25 then 'very_hard'
        when (met_count / total_count) < 0.50 then 'hard'
        when (met_count / total_count) < 0.75 then 'moderate'
        else 'achievable'
    end as difficulty_tier,
    avg_days_to_met
from aggregated
order by met_rate asc
