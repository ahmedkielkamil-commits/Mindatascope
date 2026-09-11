{{ config(materialized='table') }}

with status_counts as (
    select
        therapy_type,
        status,
        count(*) as status_count
    from {{ source('mindscope', 'referrals') }}
    group by therapy_type, status
),

therapy_totals as (
    select
        therapy_type,
        sum(status_count) as total_for_therapy_type
    from status_counts
    group by therapy_type
),

completion_rates as (
    select
        sc.therapy_type,
        sum(case when sc.status = 'completed' then sc.status_count else 0 end)
            / tt.total_for_therapy_type * 100 as completion_rate
    from status_counts as sc
    inner join therapy_totals as tt on sc.therapy_type = tt.therapy_type
    group by sc.therapy_type, tt.total_for_therapy_type
),

avg_complete as (
    select
        therapy_type,
        avg(days_to_first_action) as avg_days_to_complete
    from {{ ref('mart_referral_followthrough_timing') }}
    where final_status = 'completed'
      and days_to_first_action is not null
    group by therapy_type
)

select
    sc.therapy_type,
    sc.status,
    sc.status_count,
    tt.total_for_therapy_type,
    (sc.status_count / tt.total_for_therapy_type) * 100 as status_rate,
    cr.completion_rate,
    ac.avg_days_to_complete
from status_counts as sc
inner join therapy_totals as tt on sc.therapy_type = tt.therapy_type
inner join completion_rates as cr on sc.therapy_type = cr.therapy_type
left join avg_complete as ac on sc.therapy_type = ac.therapy_type
order by
    sc.therapy_type asc,
    field(sc.status, 'pending', 'scheduled', 'checked_in', 'completed', 'missed')
