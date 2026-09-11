{{ config(materialized='table') }}

/*
  Snapshot simplification: uses each referral's current status at query time.
  A status history table would enable true point-in-time longitudinal tracking.
*/

with snapshot_30 as (
    select
        '30_days' as snapshot_label,
        1 as snapshot_order,
        r.therapy_type,
        r.status,
        count(*) as referral_count
    from {{ source('mindscope', 'referrals') }} as r
    inner join {{ source('mindscope', 'roadmap') }} as rm
        on r.roadmapid = rm.roadmapid
    where rm.created_at <= date_sub(current_date(), interval 30 day)
    group by r.therapy_type, r.status
),

snapshot_60 as (
    select
        '60_days' as snapshot_label,
        2 as snapshot_order,
        r.therapy_type,
        r.status,
        count(*) as referral_count
    from {{ source('mindscope', 'referrals') }} as r
    inner join {{ source('mindscope', 'roadmap') }} as rm
        on r.roadmapid = rm.roadmapid
    where rm.created_at <= date_sub(current_date(), interval 60 day)
    group by r.therapy_type, r.status
),

snapshot_90 as (
    select
        '90_days' as snapshot_label,
        3 as snapshot_order,
        r.therapy_type,
        r.status,
        count(*) as referral_count
    from {{ source('mindscope', 'referrals') }} as r
    inner join {{ source('mindscope', 'roadmap') }} as rm
        on r.roadmapid = rm.roadmapid
    where rm.created_at <= date_sub(current_date(), interval 90 day)
    group by r.therapy_type, r.status
),

combined as (
    select * from snapshot_30
    union all
    select * from snapshot_60
    union all
    select * from snapshot_90
),

snapshot_totals as (
    select
        snapshot_label,
        snapshot_order,
        therapy_type,
        sum(referral_count) as total_at_snapshot
    from combined
    group by snapshot_label, snapshot_order, therapy_type
)

select
    c.snapshot_label,
    c.snapshot_order,
    c.therapy_type,
    c.status,
    c.referral_count,
    st.total_at_snapshot,
    (c.referral_count / st.total_at_snapshot) * 100 as status_percentage
from combined as c
inner join snapshot_totals as st
    on c.snapshot_label = st.snapshot_label
    and c.therapy_type = st.therapy_type
order by c.snapshot_order, c.therapy_type, field(c.status, 'pending', 'scheduled', 'checked_in', 'completed', 'missed')
