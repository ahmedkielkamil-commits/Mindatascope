{{ config(materialized='table') }}

with stages as (
    select 1 as stage_number union all
    select 2 union all select 3 union all select 4 union all
    select 5 union all select 6
),

stage_tasks as (
    select
        cast(substring(pt.stage, 7) as unsigned) as stage_number,
        pt.status,
        pt.visible
    from {{ source('mindscope', 'parent_tasks') }} as pt
),

stage_agg as (
    select
        s.stage_number,
        concat('Stage ', s.stage_number) as stage_label,
        count(st.stage_number) as total_tasks,
        coalesce(sum(case when st.status = 'completed' then 1 else 0 end), 0) as completed_tasks,
        coalesce(sum(case when st.status = 'in_progress' then 1 else 0 end), 0) as in_progress_tasks,
        coalesce(sum(case when st.status = 'pending' then 1 else 0 end), 0) as pending_tasks,
        coalesce(sum(case when st.visible = true then 1 else 0 end), 0) as visible_tasks,
        coalesce(sum(case when st.visible = false then 1 else 0 end), 0) as hidden_tasks,
        coalesce(sum(
            case when st.visible = true and st.status = 'completed' then 1 else 0 end
        ), 0) as completed_visible_tasks,
        coalesce(sum(
            case when st.visible = true and st.status = 'in_progress' then 1 else 0 end
        ), 0) as in_progress_visible_tasks,
        coalesce(sum(
            case when st.visible = true and st.status = 'pending' then 1 else 0 end
        ), 0) as pending_visible_tasks
    from stages as s
    left join stage_tasks as st on s.stage_number = st.stage_number
    group by s.stage_number
),

with_rates as (
    select
        stage_number,
        stage_label,
        total_tasks,
        completed_tasks,
        in_progress_tasks,
        pending_tasks,
        visible_tasks,
        hidden_tasks,
        completed_visible_tasks,
        in_progress_visible_tasks,
        pending_visible_tasks,
        case
            when total_tasks = 0 then null
            else (completed_tasks / total_tasks) * 100
        end as completion_rate,
        case
            when total_tasks = 0 then null
            else (in_progress_tasks / total_tasks) * 100
        end as in_progress_rate,
        case
            when total_tasks = 0 then null
            else (pending_tasks / total_tasks) * 100
        end as pending_rate,
        case
            when visible_tasks = 0 then null
            else (completed_visible_tasks / visible_tasks) * 100
        end as completion_rate_of_visible,
        case
            when visible_tasks = 0 then null
            else (in_progress_visible_tasks / visible_tasks) * 100
        end as in_progress_rate_of_visible,
        case
            when visible_tasks = 0 then null
            else (pending_visible_tasks / visible_tasks) * 100
        end as pending_rate_of_visible
    from stage_agg
),

with_prior as (
    select
        *,
        lag(completion_rate_of_visible) over (order by stage_number) as prior_stage_completion_rate
    from with_rates
)

select
    stage_number,
    stage_label,
    total_tasks,
    completed_tasks,
    in_progress_tasks,
    pending_tasks,
    completion_rate,
    in_progress_rate,
    pending_rate,
    visible_tasks,
    hidden_tasks,
    completion_rate_of_visible,
    in_progress_rate_of_visible,
    pending_rate_of_visible,
    prior_stage_completion_rate,
    case
        when prior_stage_completion_rate is null then false
        when completion_rate_of_visible is null then false
        when prior_stage_completion_rate - completion_rate_of_visible > 20 then true
        else false
    end as disengagement_signal,
    case
        when prior_stage_completion_rate is null then null
        when completion_rate_of_visible is null then null
        else prior_stage_completion_rate - completion_rate_of_visible
    end as disengagement_magnitude
from with_prior
order by stage_number
