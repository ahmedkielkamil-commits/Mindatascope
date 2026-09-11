{{ config(materialized='table') }}

with referral_base as (
    select
        st.zipcode as zip_code,
        r.referralid,
        r.roadmapid,
        r.status
    from {{ source('mindscope', 'students') }} as st
    inner join {{ source('mindscope', 'roadmap') }} as rm
        on st.studentid = rm.studentid
    inner join {{ source('mindscope', 'referrals') }} as r
        on rm.roadmapid = r.roadmapid
),

zip_referrals as (
    select
        zip_code,
        count(*) as total_referrals,
        sum(case when status != 'pending' then 1 else 0 end) as referrals_actioned,
        sum(case when status = 'completed' then 1 else 0 end) as referrals_completed,
        sum(case when status = 'missed' then 1 else 0 end) as referrals_missed,
        sum(case when status = 'pending' then 1 else 0 end) as referrals_pending
    from referral_base
    group by zip_code
),

zip_students as (
    select
        st.zipcode as zip_code,
        count(distinct st.studentid) as students_in_zip,
        count(distinct rm.roadmapid) as total_care_plans
    from {{ source('mindscope', 'students') }} as st
    left join {{ source('mindscope', 'roadmap') }} as rm
        on st.studentid = rm.studentid
    group by st.zipcode
)

select
    zr.zip_code,
    zr.total_referrals,
    zr.referrals_actioned,
    zr.referrals_completed,
    zr.referrals_missed,
    zr.referrals_pending,
    case
        when zr.total_referrals = 0 then null
        else (zr.referrals_actioned / zr.total_referrals) * 100
    end as followthrough_rate,
    case
        when zr.total_referrals = 0 then null
        else (zr.referrals_completed / zr.total_referrals) * 100
    end as completion_rate,
    case
        when zr.total_referrals = 0 then null
        else (zr.referrals_missed / zr.total_referrals) * 100
    end as miss_rate,
    case
        when zr.total_referrals = 0 then null
        else (zr.referrals_pending / zr.total_referrals) * 100
    end as pending_rate,
    coalesce(zs.total_care_plans, 0) as total_care_plans,
    coalesce(zs.students_in_zip, 0) as students_in_zip,
    case
        when zr.total_referrals = 0 then 'no_data'
        when (zr.referrals_actioned / zr.total_referrals) >= 0.70 then 'strong'
        when (zr.referrals_actioned / zr.total_referrals) >= 0.40 then 'moderate'
        when (zr.referrals_actioned / zr.total_referrals) >= 0.10 then 'weak'
        else 'critical'
    end as followthrough_tier
from zip_referrals as zr
left join zip_students as zs
    on zr.zip_code = zs.zip_code
