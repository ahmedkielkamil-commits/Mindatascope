{{ config(materialized='table') }}

with monthly_submissions as (
    select
        counselor_id as counselorid,
        date_format(submitted_at, '%Y-%m') as `year_month`,
        count(*) as submissions_that_month
    from {{ source('mindscope', 'questionnaire_submissions') }}
    group by counselor_id, date_format(submitted_at, '%Y-%m')
),

counselor_months as (
    select
        c.counselorid,
        c.fname,
        c.lname,
        sch.name as school_name,
        ms.`year_month`,
        ms.submissions_that_month
    from {{ source('mindscope', 'counselors') }} as c
    inner join {{ source('mindscope', 'schools') }} as sch
        on c.schoolid = sch.schoolid
    inner join monthly_submissions as ms
        on c.counselorid = ms.counselorid
),

with_rolling as (
    select
        counselorid,
        fname,
        lname,
        school_name,
        `year_month`,
        submissions_that_month,
        avg(submissions_that_month) over (
            partition by counselorid
            order by `year_month`
            rows between 2 preceding and current row
        ) as rolling_3month_avg
    from counselor_months
),

checkins as (
    select
        counselor_id,
        checkin_type,
        response,
        date_format(submitted_at, '%Y-%m') as checkin_month,
        submitted_at
    from {{ source('mindscope', 'counselor_checkins') }}
)

select
    wr.counselorid,
    wr.fname,
    wr.lname,
    wr.school_name,
    wr.`year_month`,
    wr.submissions_that_month,
    wr.rolling_3month_avg,
    (
        select ci.response
        from checkins as ci
        where ci.counselor_id = wr.counselorid
          and ci.checkin_month in (
              wr.`year_month`,
              date_format(
                  date_sub(str_to_date(concat(wr.`year_month`, '-01'), '%Y-%m-%d'), interval 1 month),
                  '%Y-%m'
              )
          )
        order by ci.submitted_at desc
        limit 1
    ) as most_recent_checkin_response,
    (
        select ci.checkin_type
        from checkins as ci
        where ci.counselor_id = wr.counselorid
          and ci.checkin_month in (
              wr.`year_month`,
              date_format(
                  date_sub(str_to_date(concat(wr.`year_month`, '-01'), '%Y-%m-%d'), interval 1 month),
                  '%Y-%m'
              )
          )
        order by ci.submitted_at desc
        limit 1
    ) as most_recent_checkin_type
from with_rolling as wr
order by wr.counselorid, wr.`year_month`
