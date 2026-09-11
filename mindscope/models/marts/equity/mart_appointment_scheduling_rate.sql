{{ config(materialized='table') }}

with roadmap_activity as (
    select
        rm.roadmapid,
        st.zipcode as zip_code,
        st.parentid,
        rm.created_at as roadmap_created_at,
        max(case when r.status != 'pending' then 1 else 0 end) as has_referral_action,
        max(case when a.status = 'confirmed' then 1 else 0 end) as has_confirmed_appointment,
        max(case when a.status = 'pending' then 1 else 0 end) as has_pending_appointment,
        max(case when a.status = 'cancelled' then 1 else 0 end) as has_cancelled_appointment,
        max(case when a.appointmentid is not null then 1 else 0 end) as has_any_appointment,
        min(
            case
                when a.status = 'confirmed' then datediff(a.start, rm.created_at)
            end
        ) as days_referral_to_appointment
    from {{ source('mindscope', 'roadmap') }} as rm
    inner join {{ source('mindscope', 'students') }} as st
        on rm.studentid = st.studentid
    left join {{ source('mindscope', 'referrals') }} as r
        on rm.roadmapid = r.roadmapid
    left join {{ source('mindscope', 'appointment') }} as a
        on st.parentid = a.parentid
    group by rm.roadmapid, st.zipcode, st.parentid, rm.created_at
),

actioned as (
    select *
    from roadmap_activity
    where has_referral_action = 1
),

gap_families as (
    select *
    from actioned
    where has_confirmed_appointment = 0
),

overall_metrics as (
    select
        cast('overall' as char(16)) as grouping_type,
        cast(null as char(10) charset utf8mb4) collate utf8mb4_unicode_ci as zip_code,
        count(distinct roadmapid) as care_plans_with_any_action,
        count(distinct case when has_confirmed_appointment = 1 then roadmapid end)
            as care_plans_with_confirmed_appointment,
        count(distinct case
            when has_confirmed_appointment = 0 then roadmapid
        end) as scheduling_gap_count,
        count(distinct case
            when has_confirmed_appointment = 0 and has_pending_appointment = 1 then roadmapid
        end) as gap_families_with_pending_appointment,
        count(distinct case
            when has_confirmed_appointment = 0 and has_cancelled_appointment = 1 then roadmapid
        end) as gap_families_with_cancelled_appointment,
        count(distinct case
            when has_confirmed_appointment = 0 and has_any_appointment = 0 then roadmapid
        end) as gap_families_with_no_appointment_at_all,
        avg(
            case
                when has_confirmed_appointment = 1 then days_referral_to_appointment
            end
        ) as avg_days_referral_to_appointment
    from actioned
),

zip_metrics as (
    select
        cast('by_zip' as char(16)) as grouping_type,
        cast(zip_code as char(10) charset utf8mb4) collate utf8mb4_unicode_ci as zip_code,
        count(distinct roadmapid) as care_plans_with_any_action,
        count(distinct case when has_confirmed_appointment = 1 then roadmapid end)
            as care_plans_with_confirmed_appointment,
        count(distinct case
            when has_confirmed_appointment = 0 then roadmapid
        end) as scheduling_gap_count,
        count(distinct case
            when has_confirmed_appointment = 0 and has_pending_appointment = 1 then roadmapid
        end) as gap_families_with_pending_appointment,
        count(distinct case
            when has_confirmed_appointment = 0 and has_cancelled_appointment = 1 then roadmapid
        end) as gap_families_with_cancelled_appointment,
        count(distinct case
            when has_confirmed_appointment = 0 and has_any_appointment = 0 then roadmapid
        end) as gap_families_with_no_appointment_at_all,
        avg(
            case
                when has_confirmed_appointment = 1 then days_referral_to_appointment
            end
        ) as avg_days_referral_to_appointment
    from actioned
    group by zip_code
),

combined as (
    select * from overall_metrics
    union all
    select * from zip_metrics
)

select
    grouping_type,
    zip_code,
    care_plans_with_any_action,
    care_plans_with_confirmed_appointment,
    case
        when care_plans_with_any_action = 0 then null
        else (care_plans_with_confirmed_appointment / care_plans_with_any_action) * 100
    end as scheduling_rate,
    scheduling_gap_count,
    case
        when care_plans_with_any_action = 0 then null
        else 1 - (care_plans_with_confirmed_appointment / care_plans_with_any_action)
    end as scheduling_gap_rate,
    gap_families_with_pending_appointment,
    gap_families_with_cancelled_appointment,
    gap_families_with_no_appointment_at_all,
    avg_days_referral_to_appointment
from combined
