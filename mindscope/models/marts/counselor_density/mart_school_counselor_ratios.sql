{{ config(materialized='table') }}

with counselor_counts as (
    select
        schoolid,
        count(*) as counselor_count
    from {{ source('mindscope', 'counselors') }}
    group by schoolid
),

student_counts as (
    select
        schoolid,
        student_count
    from {{ source('mindscope', 'schools') }}
),

submission_counts as (
    select
        school_id as schoolid,
        count(*) as care_plans_submitted
    from {{ source('mindscope', 'questionnaire_submissions') }}
    group by school_id
),

school_metrics as (
    select
        s.schoolid,
        s.name,
        s.location,
        s.district,
        s.zip_code,
        coalesce(c.counselor_count, 0) as counselor_count,
        coalesce(st.student_count, 0) as student_count,
        coalesce(sub.care_plans_submitted, 0) as care_plans_submitted,
        case
            when coalesce(c.counselor_count, 0) = 0 then null
            else coalesce(st.student_count, 0) / c.counselor_count
        end as student_to_counselor_ratio,
        case
            when coalesce(c.counselor_count, 0) = 0 then null
            else coalesce(sub.care_plans_submitted, 0) / c.counselor_count
        end as care_plans_per_counselor
    from {{ source('mindscope', 'schools') }} as s
    left join counselor_counts as c on s.schoolid = c.schoolid
    left join student_counts as st on s.schoolid = st.schoolid
    left join submission_counts as sub on s.schoolid = sub.schoolid
)

select
    schoolid,
    name,
    location,
    district,
    zip_code,
    counselor_count,
    student_count,
    student_to_counselor_ratio,
    care_plans_submitted,
    care_plans_per_counselor,
    case
        when student_to_counselor_ratio is null then 'no_data'
        when student_to_counselor_ratio > 400 then 'critical'
        when student_to_counselor_ratio > 250 then 'high'
        when student_to_counselor_ratio > 150 then 'moderate'
        else 'low'
    end as ratio_tier
from school_metrics
