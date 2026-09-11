{{ config(materialized='table') }}

/*
  Referral-level timing detail. Flask aggregates by days_bucket for the histogram.
  Detail rows (referralid, therapy_type, days_to_first_action) are also used by
  mart_referral_status_by_therapy via ref() for avg_days_to_complete.
*/

with referral_actions as (
    select
        r.referralid,
        r.roadmapid,
        r.therapy_type,
        r.status as final_status,
        rm.created_at as roadmap_created_at,
        case
            when r.status = 'pending' then null
            when r.met_at is not null then datediff(r.met_at, rm.created_at)
            -- Placeholder until status_changed_at exists on referrals
            else 14
        end as days_to_first_action
    from {{ source('mindscope', 'referrals') }} as r
    inner join {{ source('mindscope', 'roadmap') }} as rm
        on r.roadmapid = rm.roadmapid
)

select
    referralid,
    roadmapid,
    therapy_type,
    days_to_first_action,
    case
        when days_to_first_action is null then 'not_yet_actioned'
        when days_to_first_action <= 7 then '0-7 days'
        when days_to_first_action <= 14 then '8-14 days'
        when days_to_first_action <= 30 then '15-30 days'
        when days_to_first_action <= 60 then '31-60 days'
        else '60+ days'
    end as days_bucket,
    case
        when days_to_first_action is null then 6
        when days_to_first_action <= 7 then 1
        when days_to_first_action <= 14 then 2
        when days_to_first_action <= 30 then 3
        when days_to_first_action <= 60 then 4
        else 5
    end as bucket_order,
    final_status
from referral_actions
