{{ config(materialized='table') }}

with stages as (
    select 1 as stage_number union all
    select 2 union all select 3 union all select 4 union all
    select 5 union all select 6
),

task_stages as (
    select
        pt.roadmapid,
        cast(substring(pt.stage, 7) as unsigned) as stage_number,
        pt.status,
        pt.met_at,
        rm.created_at as roadmap_created_at
    from {{ source('mindscope', 'parent_tasks') }} as pt
    inner join {{ source('mindscope', 'roadmap') }} as rm
        on pt.roadmapid = rm.roadmapid
),

stage_completion as (
    select
        roadmapid,
        stage_number,
        count(*) as task_count,
        sum(case when status = 'completed' then 1 else 0 end) as completed_count,
        max(met_at) as stage_completed_at
    from task_stages
    group by roadmapid, stage_number
),

fully_completed_stages as (
    select
        roadmapid,
        stage_number,
        stage_completed_at
    from stage_completion
    where task_count = completed_count
      and stage_completed_at is not null
),

stage_durations as (
    select
        fc.roadmapid,
        fc.stage_number,
        fc.stage_completed_at,
        case
            when fc.stage_number = 1 then rm.created_at
            else (
                select max(ps.stage_completed_at)
                from fully_completed_stages as ps
                where ps.roadmapid = fc.roadmapid
                  and ps.stage_number = fc.stage_number - 1
            )
        end as stage_start_at
    from fully_completed_stages as fc
    inner join {{ source('mindscope', 'roadmap') }} as rm
        on fc.roadmapid = rm.roadmapid
),

duration_days as (
    select
        roadmapid,
        stage_number,
        datediff(stage_completed_at, stage_start_at) as days_in_stage
    from stage_durations
    where stage_start_at is not null
),

roadmaps_in as (
    select
        stage_number,
        count(distinct roadmapid) as roadmaps_in_stage
    from task_stages
    group by stage_number
),

duration_agg as (
    select
        stage_number,
        count(distinct roadmapid) as roadmaps_completed_stage,
        avg(days_in_stage) as avg_days_in_stage,
        min(days_in_stage) as fastest_completion_days,
        max(days_in_stage) as slowest_completion_days
    from duration_days
    group by stage_number
),

stage_stats as (
    select
        s.stage_number,
        concat('Stage ', s.stage_number) as stage_label,
        coalesce(ri.roadmaps_in_stage, 0) as roadmaps_in_stage,
        coalesce(da.roadmaps_completed_stage, 0) as roadmaps_completed_stage,
        da.avg_days_in_stage,
        da.fastest_completion_days,
        da.slowest_completion_days
    from stages as s
    left join roadmaps_in as ri on s.stage_number = ri.stage_number
    left join duration_agg as da on s.stage_number = da.stage_number
),

/*
  MySQL lacks a native MEDIAN function. This approximates median as the average
  of the middle one or two values via ROW_NUMBER.
*/
ranked_durations as (
    select
        stage_number,
        days_in_stage,
        row_number() over (
            partition by stage_number
            order by days_in_stage
        ) as row_num,
        count(*) over (partition by stage_number) as stage_count
    from duration_days
),

median_approx as (
    select
        stage_number,
        avg(days_in_stage) as median_days_in_stage
    from ranked_durations
    where row_num in (
        floor((stage_count + 1) / 2),
        ceil((stage_count + 1) / 2)
    )
    group by stage_number
),

overall_avg as (
    select avg(days_in_stage) as overall_avg_days
    from duration_days
)

select
    ss.stage_number,
    ss.stage_label,
    ss.roadmaps_in_stage,
    ss.roadmaps_completed_stage,
    case
        when ss.roadmaps_completed_stage = 0 then null
        else ss.avg_days_in_stage
    end as avg_days_in_stage,
    case
        when ss.roadmaps_completed_stage = 0 then null
        else ma.median_days_in_stage
    end as median_days_in_stage,
    case
        when ss.roadmaps_completed_stage = 0 then null
        else ss.fastest_completion_days
    end as fastest_completion_days,
    case
        when ss.roadmaps_completed_stage = 0 then null
        else ss.slowest_completion_days
    end as slowest_completion_days,
    case
        when ss.roadmaps_completed_stage = 0 then false
        when ss.avg_days_in_stage > oa.overall_avg_days * 1.5 then true
        else false
    end as stages_significantly_longer
from stage_stats as ss
left join median_approx as ma on ss.stage_number = ma.stage_number
cross join overall_avg as oa
order by ss.stage_number
