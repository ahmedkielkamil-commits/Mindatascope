{{ config(materialized='table') }}

with stage_1 as (
    select count(*) as stage_count
    from {{ source('mindscope', 'questionnaire_submissions') }}
),

stage_2 as (
    select count(*) as stage_count
    from {{ source('mindscope', 'roadmap') }}
),

stage_3 as (
    select count(distinct roadmapid) as stage_count
    from {{ source('mindscope', 'referrals') }}
    where status != 'pending'
),

stage_4 as (
    select count(distinct parentid) as stage_count
    from {{ source('mindscope', 'appointment') }}
    where status = 'confirmed'
),

stage_counts as (
    select 1 as stage_order, 'Questionnaires Submitted' as stage_name, stage_1.stage_count
    from stage_1
    union all
    select 2, 'Care Plans Generated', stage_2.stage_count from stage_2
    union all
    select 3, 'Referral Contacted', stage_3.stage_count from stage_3
    union all
    select 4, 'First Appointment Scheduled', stage_4.stage_count from stage_4
),

with_prior as (
    select
        stage_name,
        stage_order,
        stage_count,
        lag(stage_count) over (order by stage_order) as prior_stage_count
    from stage_counts
)

select
    stage_name,
    stage_order,
    stage_count,
    case
        when stage_order = 1 then null
        else prior_stage_count - stage_count
    end as drop_off_from_prior,
    case
        when stage_order = 1 then null
        else ((prior_stage_count - stage_count) / prior_stage_count) * 100
    end as drop_off_rate
from with_prior
order by stage_order
