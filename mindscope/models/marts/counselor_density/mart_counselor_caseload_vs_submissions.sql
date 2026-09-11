{{ config(materialized='table') }}

with school_students as (
    select
        schoolid,
        count(*) as student_count
    from {{ source('mindscope', 'students') }}
    group by schoolid
),

counselor_submissions as (
    select
        counselor_id as counselorid,
        count(*) as total_submissions,
        sum(
            case
                when submitted_at >= date_sub(current_timestamp, interval 90 day) then 1
                else 0
            end
        ) as submissions_last_90_days
    from {{ source('mindscope', 'questionnaire_submissions') }}
    group by counselor_id
),

latest_low_usage_checkins as (
    select
        counselor_id,
        response,
        row_number() over (
            partition by counselor_id
            order by submitted_at desc
        ) as row_num
    from {{ source('mindscope', 'counselor_checkins') }}
    where checkin_type = 'low_usage_prompt'
),

counselor_metrics as (
    select
        c.counselorid,
        c.fname,
        c.lname,
        sch.name as school_name,
        sch.district,
        coalesce(ss.student_count, 0) as student_count,
        coalesce(cs.total_submissions, 0) as total_submissions,
        coalesce(cs.submissions_last_90_days, 0) as submissions_last_90_days,
        case
            when coalesce(cs.total_submissions, 0) >= 10 then 'high'
            when coalesce(cs.total_submissions, 0) >= 4 then 'medium'
            when coalesce(cs.total_submissions, 0) >= 1 then 'low'
            else 'none'
        end as submission_frequency_tier
    from {{ source('mindscope', 'counselors') }} as c
    inner join {{ source('mindscope', 'schools') }} as sch
        on c.schoolid = sch.schoolid
    left join school_students as ss
        on c.schoolid = ss.schoolid
    left join counselor_submissions as cs
        on c.counselorid = cs.counselorid
)

select
    cm.counselorid,
    cm.fname,
    cm.lname,
    cm.school_name,
    cm.district,
    cm.student_count,
    cm.total_submissions,
    cm.submissions_last_90_days,
    cm.submission_frequency_tier,
    case
        when cm.submission_frequency_tier in ('none', 'low') then luc.response
        else null
    end as low_usage_explanation
from counselor_metrics as cm
left join latest_low_usage_checkins as luc
    on cm.counselorid = luc.counselor_id
   and luc.row_num = 1
