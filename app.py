import os

from dotenv import load_dotenv
from flask import Flask, jsonify, redirect, render_template, request, url_for
from sqlalchemy import text

from facility_search import geocode_records, search_facilities
from mysql import fetch_all, get_connection, rows_to_json

load_dotenv()

app = Flask(__name__, template_folder="Templates")


def _zip_code_param():
    zip_code = request.args.get("zip_code", "").strip()
    return zip_code or None


@app.get("/api/school-zips")
def school_zips():
    sql = (
        "SELECT zip_code, COUNT(*) AS school_count, "
        "GROUP_CONCAT(name ORDER BY name SEPARATOR ', ') AS schools "
        "FROM schools GROUP BY zip_code ORDER BY zip_code"
    )
    return jsonify(fetch_all(sql))


@app.get("/")
def index():
    return redirect(url_for("counselor_density_page"))


@app.get("/counselor-density")
def counselor_density_page():
    return render_template(
        "counselor.html",
        google_maps_api_key=os.getenv("GOOGLE_PLACES_API_KEY", ""),
    )


@app.get("/api/counselor-density/school-ratios")
def school_ratios():
    zip_code = _zip_code_param()
    if zip_code:
        sql = text(
            "SELECT * FROM mart_school_counselor_ratios "
            "WHERE zip_code = :zip_code "
            "ORDER BY student_to_counselor_ratio DESC"
        )
        with get_connection() as conn:
            rows = rows_to_json(conn.execute(sql, {"zip_code": zip_code}).mappings().all())
    else:
        rows = fetch_all(
            "SELECT * FROM mart_school_counselor_ratios "
            "ORDER BY student_to_counselor_ratio DESC"
        )
    center = geocode_records(rows, "location")
    return jsonify({"schools": rows, "center": center})


@app.get("/api/counselor-density/submission-trend")
def submission_trend():
    zip_code = _zip_code_param()
    if zip_code:
        sql = text(
            "SELECT t.* FROM mart_counselor_submission_trend t "
            "INNER JOIN counselors c ON t.counselorid = c.counselorid "
            "INNER JOIN schools s ON c.schoolid = s.schoolid "
            "WHERE s.zip_code = :zip_code "
            "ORDER BY t.counselorid, t.`year_month`"
        )
        with get_connection() as conn:
            rows = conn.execute(sql, {"zip_code": zip_code}).mappings().all()
            return jsonify(rows_to_json(rows))
    sql = (
        "SELECT * FROM mart_counselor_submission_trend "
        "ORDER BY counselorid, `year_month`"
    )
    return jsonify(fetch_all(sql))


@app.get("/api/counselor-density/caseload-scatter")
def caseload_scatter():
    zip_code = _zip_code_param()
    if zip_code:
        sql = text(
            "SELECT m.* FROM mart_counselor_caseload_vs_submissions m "
            "INNER JOIN counselors c ON m.counselorid = c.counselorid "
            "INNER JOIN schools s ON c.schoolid = s.schoolid "
            "WHERE s.zip_code = :zip_code "
            "ORDER BY m.student_count DESC"
        )
        with get_connection() as conn:
            rows = conn.execute(sql, {"zip_code": zip_code}).mappings().all()
            return jsonify(rows_to_json(rows))
    sql = (
        "SELECT * FROM mart_counselor_caseload_vs_submissions "
        "ORDER BY student_count DESC"
    )
    return jsonify(fetch_all(sql))


GAP_ORDER = (
    "FIELD(gap_severity, 'critical', 'high', 'moderate', 'covered', 'no_demand'), "
    "times_recommended DESC"
)


@app.get("/service-mapping")
def service_mapping_page():
    return render_template(
        "servicemap.html",
        google_maps_api_key=os.getenv("GOOGLE_PLACES_API_KEY", ""),
    )


@app.get("/api/service-mapping/demand-vs-supply")
def demand_vs_supply():
    therapy_type = request.args.get("therapy_type")
    zip_code = request.args.get("zip_code")
    order = f" ORDER BY {GAP_ORDER}"
    conditions = []
    params = {}
    if zip_code:
        conditions.append("zip_code = :zip_code")
        params["zip_code"] = zip_code.strip()
    if therapy_type:
        conditions.append("therapy_type = :therapy_type")
        params["therapy_type"] = therapy_type
    where = f" WHERE {' AND '.join(conditions)}" if conditions else ""
    sql = text(f"SELECT * FROM mart_therapy_demand_vs_supply{where}{order}")
    if params:
        with get_connection() as conn:
            rows = conn.execute(sql, params).mappings().all()
            return jsonify(rows_to_json(rows))
    return jsonify(fetch_all(f"SELECT * FROM mart_therapy_demand_vs_supply{order}"))


@app.get("/api/service-mapping/therapy-summary")
def therapy_summary():
    sql = "SELECT * FROM mart_therapy_type_demand_summary ORDER BY total_recommendations DESC"
    return jsonify(fetch_all(sql))


@app.get("/api/service-mapping/therapy-types")
def therapy_types():
    rows = fetch_all(
        "SELECT DISTINCT therapy_type FROM mart_therapy_demand_vs_supply ORDER BY therapy_type"
    )
    return jsonify([row["therapy_type"] for row in rows])


@app.get("/api/service-mapping/facilities")
def facilities_by_zip():
    zip_code = request.args.get("zip_code", "").strip()
    if not zip_code:
        return jsonify({"error": "zip_code is required"}), 400
    try:
        return jsonify(search_facilities(zip_code, request.args.get("therapy_type")))
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except RuntimeError as exc:
        return jsonify({"error": str(exc)}), 502


STATUS_ORDER = "FIELD(status, 'pending', 'scheduled', 'checked_in', 'completed', 'missed')"


@app.get("/referral-status")
def referral_status_page():
    return render_template("referralstatus.html")


@app.get("/api/referral-status/funnel")
def referral_funnel():
    sql = "SELECT * FROM mart_engagement_funnel ORDER BY stage_order"
    return jsonify(fetch_all(sql))


@app.get("/api/referral-status/timing-distribution")
def referral_timing_distribution():
    sql = (
        "SELECT days_bucket, bucket_order, COUNT(*) AS referral_count "
        "FROM mart_referral_followthrough_timing "
        "GROUP BY days_bucket, bucket_order "
        "ORDER BY bucket_order"
    )
    return jsonify(fetch_all(sql))


@app.get("/api/referral-status/by-therapy-type")
def referral_by_therapy_type():
    therapy_type = request.args.get("therapy_type")
    order = f" ORDER BY therapy_type, {STATUS_ORDER}"
    if therapy_type:
        sql = text(
            "SELECT * FROM mart_referral_status_by_therapy "
            "WHERE therapy_type = :therapy_type" + order
        )
        with get_connection() as conn:
            rows = conn.execute(sql, {"therapy_type": therapy_type}).mappings().all()
            return jsonify(rows_to_json(rows))
    return jsonify(fetch_all("SELECT * FROM mart_referral_status_by_therapy" + order))


@app.get("/api/referral-status/over-time")
def referral_over_time():
    therapy_type = request.args.get("therapy_type")
    order = f" ORDER BY snapshot_order, therapy_type, {STATUS_ORDER}"
    if therapy_type:
        sql = text(
            "SELECT * FROM mart_referral_status_over_time "
            "WHERE therapy_type = :therapy_type" + order
        )
        with get_connection() as conn:
            rows = conn.execute(sql, {"therapy_type": therapy_type}).mappings().all()
            return jsonify(rows_to_json(rows))
    return jsonify(fetch_all("SELECT * FROM mart_referral_status_over_time" + order))


@app.get("/api/referral-status/therapy-types")
def referral_therapy_types():
    rows = fetch_all(
        "SELECT DISTINCT therapy_type FROM mart_referral_status_by_therapy ORDER BY therapy_type"
    )
    return jsonify([row["therapy_type"] for row in rows])


@app.get("/roadmap-progression")
def roadmap_progression_page():
    return render_template("roadmapprog.html")


@app.get("/api/roadmap-progression/stage-distribution")
def roadmap_stage_distribution():
    sql = "SELECT * FROM mart_stage_completion_distribution ORDER BY stage_number"
    return jsonify(fetch_all(sql))


@app.get("/api/roadmap-progression/behavioral-markers")
def roadmap_behavioral_markers():
    stage = request.args.get("stage")
    difficulty = request.args.get("difficulty")
    limit = request.args.get("limit", "20")
    conditions = []
    params = {"limit": int(limit)}
    if stage:
        conditions.append("stage_number = :stage")
        params["stage"] = int(stage)
    if difficulty:
        conditions.append("difficulty_tier = :difficulty")
        params["difficulty"] = difficulty
    where = f" WHERE {' AND '.join(conditions)}" if conditions else ""
    sql = text(
        f"SELECT * FROM mart_behavioral_marker_difficulty{where} "
        "ORDER BY met_rate ASC LIMIT :limit"
    )
    with get_connection() as conn:
        rows = conn.execute(sql, params).mappings().all()
        return jsonify(rows_to_json(rows))


@app.get("/api/roadmap-progression/time-per-stage")
def roadmap_time_per_stage():
    sql = "SELECT * FROM mart_avg_time_per_stage ORDER BY stage_number"
    return jsonify(fetch_all(sql))


@app.get("/api/roadmap-progression/task-completion-by-stage")
def roadmap_task_completion_by_stage():
    sql = "SELECT * FROM mart_parent_task_completion_by_stage ORDER BY stage_number"
    return jsonify(fetch_all(sql))


@app.get("/equity")
def equity_page():
    return render_template("equity.html")


@app.get("/api/equity/socioeconomic-adoption")
def equity_socioeconomic_adoption():
    sql = (
        "SELECT * FROM mart_care_plan_rate_by_socioeconomic "
        "ORDER BY median_household_income IS NULL, median_household_income ASC"
    )
    return jsonify(fetch_all(sql))


@app.get("/api/equity/followthrough-by-zip")
def equity_followthrough_by_zip():
    sql = (
        "SELECT * FROM mart_referral_followthrough_by_zip "
        "ORDER BY followthrough_rate ASC"
    )
    return jsonify(fetch_all(sql))


@app.get("/api/equity/service-desert-index")
def equity_service_desert_index():
    sql = (
        "SELECT * FROM mart_service_desert_index "
        "ORDER BY service_desert_index DESC"
    )
    return jsonify(fetch_all(sql))


@app.get("/api/equity/appointment-scheduling")
def equity_appointment_scheduling():
    sql = (
        "SELECT * FROM mart_appointment_scheduling_rate "
        "ORDER BY grouping_type DESC, zip_code ASC"
    )
    return jsonify(fetch_all(sql))


if __name__ == "__main__":
    app.run(debug=True, port=5000)
