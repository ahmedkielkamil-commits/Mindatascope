{{ config(materialized='table') }}

/*
  Care plan adoption rates by district socioeconomic profile.

  Socioeconomic indicators come from seed_district_socioeconomic — a manually curated
  placeholder that should be replaced with real Census or NCES district data when available.
  Authoritative source: https://nces.ed.gov/ccd/
*/

with school_district_metrics as (
    select
        s.district,
        count(distinct s.schoolid) as school_count,
        sum(s.student_count) as total_students,
        count(distinct c.counselorid) as total_counselors,
        count(distinct rm.roadmapid) as care_plans_generated
    from {{ source('mindscope', 'schools') }} as s
    left join {{ source('mindscope', 'counselors') }} as c
        on s.schoolid = c.schoolid
    left join {{ source('mindscope', 'students') }} as st
        on s.schoolid = st.schoolid
    left join {{ source('mindscope', 'roadmap') }} as rm
        on st.studentid = rm.studentid
    group by s.district
),

all_districts as (
    select district from school_district_metrics
    union
    select district from {{ ref('seed_district_socioeconomic') }}
)

select
    d.district,
    coalesce(m.school_count, 0) as school_count,
    coalesce(m.total_students, 0) as total_students,
    coalesce(m.total_counselors, 0) as total_counselors,
    case
        when coalesce(m.total_counselors, 0) = 0 then null
        else m.total_students / m.total_counselors
    end as student_to_counselor_ratio,
    coalesce(m.care_plans_generated, 0) as care_plans_generated,
    case
        when coalesce(m.total_students, 0) = 0 then null
        else (m.care_plans_generated / m.total_students) * 100
    end as care_plans_per_100_students,
    seed.median_household_income,
    seed.free_reduced_lunch_rate,
    seed.title_1_eligible,
    seed.socioeconomic_tier,
    case
        when seed.socioeconomic_tier is null then 'no_data'
        when seed.socioeconomic_tier = 'low'
            and (m.care_plans_generated / nullif(m.total_students, 0)) * 100 >= 5
            then 'high_need_high_adoption'
        when seed.socioeconomic_tier = 'low'
            and coalesce((m.care_plans_generated / nullif(m.total_students, 0)) * 100, 0) < 5
            then 'high_need_low_adoption'
        when seed.socioeconomic_tier = 'moderate'
            and (m.care_plans_generated / nullif(m.total_students, 0)) * 100 >= 5
            then 'moderate_need_high_adoption'
        when seed.socioeconomic_tier = 'moderate'
            and coalesce((m.care_plans_generated / nullif(m.total_students, 0)) * 100, 0) < 5
            then 'moderate_need_low_adoption'
        when seed.socioeconomic_tier = 'high'
            and (m.care_plans_generated / nullif(m.total_students, 0)) * 100 >= 5
            then 'low_need_high_adoption'
        when seed.socioeconomic_tier = 'high'
            and coalesce((m.care_plans_generated / nullif(m.total_students, 0)) * 100, 0) < 5
            then 'low_need_low_adoption'
        else 'no_data'
    end as adoption_vs_need_signal
from all_districts as d
left join school_district_metrics as m
    on d.district = m.district
left join {{ ref('seed_district_socioeconomic') }} as seed
    on d.district = seed.district
