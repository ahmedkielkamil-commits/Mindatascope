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
        pt.status
    from {{ source('mindscope', 'parent_tasks') }} as pt
),

roadmap_highest_completed as (
    select
        roadmapid,
        max(case when status = 'completed' then stage_number end) as highest_completed_stage
    from task_stages
    group by roadmapid
),

stage_fully_completed as (
    select
        roadmapid,
        stage_number
    from task_stages
    group by roadmapid, stage_number
    having count(*) = sum(case when status = 'completed' then 1 else 0 end)
       and count(*) > 0
),

highest_at_stage as (
    select
        highest_completed_stage as stage_number,
        roadmapid
    from roadmap_highest_completed
    where highest_completed_stage is not null
),

highest_counts as (
    select
        stage_number,
        count(distinct roadmapid) as students_highest_stage_here
    from highest_at_stage
    group by stage_number
),

completed_counts as (
    select
        stage_number,
        count(distinct roadmapid) as students_completed_this_stage
    from stage_fully_completed
    group by stage_number
),

stalled_counts as (
    select
        ha.stage_number,
        count(distinct ha.roadmapid) as students_stalled_here
    from highest_at_stage as ha
    left join stage_fully_completed as sf
        on ha.roadmapid = sf.roadmapid
        and ha.stage_number = sf.stage_number
    where sf.roadmapid is null
    group by ha.stage_number
),

stage_metrics as (
    select
        s.stage_number,
        concat('Stage ', s.stage_number) as stage_label,
        coalesce(h.students_highest_stage_here, 0) as students_highest_stage_here,
        coalesce(c.students_completed_this_stage, 0) as students_completed_this_stage,
        coalesce(st.students_stalled_here, 0) as students_stalled_here
    from stages as s
    left join highest_counts as h on s.stage_number = h.stage_number
    left join completed_counts as c on s.stage_number = c.stage_number
    left join stalled_counts as st on s.stage_number = st.stage_number
),

with_rates as (
    select
        stage_number,
        stage_label,
        students_highest_stage_here,
        students_completed_this_stage,
        students_stalled_here,
        case
            when students_highest_stage_here = 0 then null
            else (
                (students_highest_stage_here - students_stalled_here)
                / students_highest_stage_here
            ) * 100
        end as completion_rate_this_stage
    from stage_metrics
)

select
    stage_number,
    stage_label,
    students_highest_stage_here,
    students_completed_this_stage,
    students_stalled_here,
    completion_rate_this_stage,
    sum(students_highest_stage_here) over (
        order by stage_number
        rows between unbounded preceding and current row
    ) as cumulative_students_reached
from with_rates
order by stage_number
