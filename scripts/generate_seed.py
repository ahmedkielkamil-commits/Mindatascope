"""Generate robust Atlanta 30314-area seed data for mindscope.sql"""

SCHOOLS = [
    (1, "Booker T. Washington High School", "45 Whitehouse Dr SW, Atlanta, GA 30314", "Atlanta Public Schools", 1180, "30314"),
    (2, "Harper-Archer Elementary", "3393 Boynton Ave NW, Atlanta, GA 30314", "Atlanta Public Schools", 620, "30314"),
    (3, "Carver STEAM Academy", "55 McDonough Blvd SE, Atlanta, GA 30315", "Atlanta Public Schools", 890, "30315"),
    (4, "KIPP Atlanta Collegiate", "98 Anderson Ave NW, Atlanta, GA 30314", "KIPP Metro Atlanta", 540, "30314"),
    (5, "Therrell High School", "3099 Hermance Dr NW, Atlanta, GA 30311", "Atlanta Public Schools", 1050, "30311"),
    (6, "Slater Elementary", "52 Whitehouse Dr SW, Atlanta, GA 30314", "Atlanta Public Schools", 480, "30314"),
]

COUNSELORS = [
    (1, "Sarah", "Chen", "sarah.chen@btwatl.org", 1),
    (2, "James", "Wilson", "james.wilson@btwatl.org", 1),
    (3, "Lisa", "Martinez", "lisa.martinez@harperatl.org", 2),
    (4, "David", "Okonkwo", "david.okonkwo@harperatl.org", 2),
    (5, "Priya", "Sharma", "priya.sharma@carversteam.org", 3),
    (6, "Michael", "Brooks", "michael.brooks@carversteam.org", 3),
    (7, "Angela", "Reeves", "angela.reeves@carversteam.org", 3),
    (8, "Kevin", "Nguyen", "kevin.nguyen@kippatl.org", 4),
    (9, "Tanya", "Washington", "tanya.washington@therrell.org", 5),
    (10, "Robert", "Hill", "robert.hill@therrell.org", 5),
    (11, "Camila", "Rosario", "camila.rosario@slateratl.org", 6),
    (12, "Brian", "Foster", "brian.foster@slateratl.org", 6),
]

PARENTS = [
    (1, "John", "Doe", "john.doe@gmail.com"),
    (2, "Maria", "Garcia", "maria.garcia@gmail.com"),
    (3, "David", "Smith", "david.smith@gmail.com"),
    (4, "Keisha", "Johnson", "keisha.johnson@gmail.com"),
    (5, "Carlos", "Mendez", "carlos.mendez@gmail.com"),
    (6, "Aisha", "Williams", "aisha.williams@gmail.com"),
    (7, "James", "Brown", "james.brown@gmail.com"),
    (8, "Latoya", "Davis", "latoya.davis@gmail.com"),
    (9, "Marcus", "Thompson", "marcus.thompson@gmail.com"),
    (10, "Elena", "Petrov", "elena.petrov@gmail.com"),
    (11, "Terrence", "Jackson", "terrence.jackson@gmail.com"),
    (12, "Sandra", "Lee", "sandra.lee@gmail.com"),
    (13, "Darnell", "Moore", "darnell.moore@gmail.com"),
    (14, "Nicole", "Adams", "nicole.adams@gmail.com"),
    (15, "Hector", "Ruiz", "hector.ruiz@gmail.com"),
    (16, "Tamika", "Scott", "tamika.scott@gmail.com"),
    (17, "Greg", "Phillips", "greg.phillips@gmail.com"),
    (18, "Yolanda", "Harris", "yolanda.harris@gmail.com"),
    (19, "Chris", "Allen", "chris.allen@gmail.com"),
    (20, "Monique", "Taylor", "monique.taylor@gmail.com"),
]

# studentid, fname, lname, schoolid, parentid, zip, counselorid, roadmap_status, created_at, stages_completed (1-6)
STUDENTS = [
    (1, "Marcus", "Doe", 1, 1, "30314", 1, "active", "2025-10-05 09:00:00", 6),
    (2, "Brianna", "Garcia", 1, 2, "30314", 2, "active", "2025-11-12 10:30:00", 4),
    (3, "Ethan", "Smith", 2, 3, "30314", 3, "paused", "2025-12-01 14:00:00", 2),
    (4, "Olivia", "Doe", 1, 1, "30314", 1, "active", "2026-01-18 11:15:00", 3),
    (5, "Noah", "Garcia", 2, 2, "30315", 4, "completed", "2025-08-15 08:45:00", 6),
    (6, "Jasmine", "Johnson", 3, 4, "30315", 5, "active", "2025-09-20 13:00:00", 5),
    (7, "Tyler", "Mendez", 3, 5, "30310", 6, "active", "2025-10-22 09:30:00", 3),
    (8, "Aaliyah", "Williams", 4, 6, "30314", 8, "active", "2025-11-05 15:00:00", 2),
    (9, "Jordan", "Brown", 5, 7, "30311", 9, "paused", "2025-12-10 10:00:00", 1),
    (10, "Destiny", "Davis", 5, 8, "30312", 10, "active", "2026-01-08 11:30:00", 4),
    (11, "Malik", "Thompson", 1, 9, "30314", 2, "active", "2025-10-30 08:00:00", 5),
    (12, "Sofia", "Petrov", 6, 10, "30314", 11, "completed", "2025-07-20 12:00:00", 6),
    (13, "Jaylen", "Jackson", 6, 11, "30314", 12, "active", "2025-11-18 14:30:00", 3),
    (14, "Emily", "Lee", 2, 12, "30315", 3, "active", "2026-02-01 09:15:00", 2),
    (15, "Darius", "Moore", 3, 13, "30310", 7, "active", "2025-12-15 16:00:00", 4),
    (16, "Chloe", "Adams", 4, 14, "30314", 8, "active", "2026-01-25 10:45:00", 1),
    (17, "Andre", "Ruiz", 5, 15, "30311", 9, "active", "2025-11-28 13:20:00", 3),
    (18, "Kayla", "Scott", 1, 16, "30314", 1, "completed", "2025-06-10 09:00:00", 6),
    (19, "Chris", "Phillips", 2, 17, "30314", 4, "active", "2026-02-10 11:00:00", 2),
    (20, "Imani", "Harris", 3, 18, "30315", 5, "active", "2025-10-08 08:30:00", 5),
    (21, "Logan", "Allen", 6, 19, "30314", 11, "active", "2025-12-22 15:30:00", 2),
    (22, "Zaria", "Taylor", 4, 20, "30314", 8, "active", "2026-01-14 12:15:00", 3),
]

STAGE_TASKS = {
    1: "Complete intake forms and establish a daily check-in routine with your child.",
    2: "Practice the counselor-recommended coping strategy for 15 minutes each evening.",
    3: "Attend a parent-counselor progress meeting and review behavioral goals.",
    4: "Implement the home behavior plan and log observations for two weeks.",
    5: "Connect with an external provider and confirm the first appointment.",
    6: "Review maintenance goals and celebrate milestone completion with your child.",
}

BEHAVIOR_CHECKS = {
    1: "Student follows the agreed daily check-in routine with minimal reminders.",
    2: "Student uses the coping strategy independently at least three times per week.",
    3: "Parent and counselor document aligned goals during the progress meeting.",
    4: "Home behavior plan is followed consistently for at least ten days.",
    5: "External provider appointment is scheduled and confirmed.",
    6: "Maintenance goals are reviewed and student sustains target behaviors.",
}

REFERRAL_POOL = [
    ("behavioral_therapy", "Westside Behavioral Health", "890 Murphy Ave SW, Atlanta, GA 30310"),
    ("speech_therapy", "Atlanta Speech & Language Center", "1460 Metropolitan Pkwy SW, Atlanta, GA 30310"),
    ("occupational_therapy", "Peachtree OT Services", "350 Cleveland Ave SE, Atlanta, GA 30354"),
    ("family_therapy", "Center for Family Healing", "191 Peachtree St NE, Atlanta, GA 30303"),
    ("social_skills", "Community Youth Skills Lab", "677 Connally St SE, Atlanta, GA 30315"),
]

REFERRAL_STATUSES = ["pending", "scheduled", "checked_in", "completed", "missed"]

THERAPIES = [
    "Cognitive Behavioral Therapy (CBT)",
    "Social Skills Training",
    "Parent Management Training",
    "Trauma-Focused Cognitive Behavioral Therapy (TF-CBT)",
    "Family Therapy / Caregiver Involvement",
    "Dialectical Behavior Therapy (DBT)",
    "School-Based Counseling",
]

ZIPS = ["30314", "30315", "30310", "30312", "30311", "30308"]

FACILITIES = [
    ("Jeanes Mental Health Services", "1200 Joseph E Boone Blvd NW, Atlanta, GA 30314"),
    ("Walker Family Services", "999 Joseph E Lowery Blvd NW, Atlanta, GA 30318"),
    ("Hope Harbor Youth Counseling", "550 Piedmont Ave NE, Atlanta, GA 30308"),
    ("Westside Community Therapy", "890 Murphy Ave SW, Atlanta, GA 30310"),
    ("Peachtree Behavioral Group", "191 Peachtree St NE, Atlanta, GA 30303"),
]


def sql_str(s):
    return "'" + s.replace("'", "''") + "'"


def task_status(stage_num, stages_completed, roadmap_status):
    if stage_num <= stages_completed:
        return "completed"
    if stage_num == stages_completed + 1:
        if roadmap_status == "completed" and stages_completed >= 6:
            return "completed"
        if roadmap_status == "paused":
            return "pending"
        return "in_progress" if stage_num <= stages_completed + 1 else "pending"
    return "pending"


def met_at_for(status, base_date, stage_num):
    if status != "completed":
        return "NULL"
    day_offset = (stage_num - 1) * 14 + 5
    return f"'{base_date[:10]}'"  # simplified - use date arithmetic in output


def main():
    lines = []

    lines.append("INSERT INTO `schools` (`schoolid`, `name`, `location`, `district`, `student_count`, `zip_code`) VALUES")
    lines.append(",\n".join(
        f"({sid}, {sql_str(name)}, {sql_str(loc)}, {sql_str(dist)}, {cnt}, {sql_str(zipc)})"
        for sid, name, loc, dist, cnt, zipc in SCHOOLS
    ) + ";\n")

    lines.append("INSERT INTO `parents` (`parentid`, `fname`, `lname`, `email`, `password`) VALUES")
    lines.append(",\n".join(
        f"({pid}, {sql_str(fn)}, {sql_str(ln)}, {sql_str(em)}, 'hashed_pw_placeholder')"
        for pid, fn, ln, em in PARENTS
    ) + ";\n")

    lines.append("INSERT INTO `counselors` (`counselorid`, `fname`, `lname`, `email`, `schoolid`) VALUES")
    lines.append(",\n".join(
        f"({cid}, {sql_str(fn)}, {sql_str(ln)}, {sql_str(em)}, {sid})"
        for cid, fn, ln, em, sid in COUNSELORS
    ) + ";\n")

    lines.append("INSERT INTO `roadmap` (`roadmapid`, `studentid`, `counselorid`, `status`, `created_at`) VALUES")
    lines.append(",\n".join(
        f"({sid}, {sid}, {counselor}, {sql_str(status)}, {sql_str(created)})"
        for sid, _, _, school, parent, zip, counselor, status, created, _ in STUDENTS
    ) + ";\n")

    lines.append("INSERT INTO `students` (`studentid`, `fname`, `lname`, `schoolid`, `parentid`, `zipcode`) VALUES")
    lines.append(",\n".join(
        f"({sid}, {sql_str(fn)}, {sql_str(ln)}, {school}, {parent}, {sql_str(zipc)})"
        for sid, fn, ln, school, parent, zipc, _, _, _, _ in STUDENTS
    ) + ";\n")

    # parent_tasks + behavior_checks
    pt_lines = []
    bc_lines = []
    pt_id = 1
    bc_id = 1
    for sid, _, _, _, _, _, _, status, created, stages_done in STUDENTS:
        base = created[:10]
        for stage in range(1, 7):
            st_status = task_status(stage, stages_done, status)
            visible = 1 if stage <= max(stages_done + 1, 1) else 0
            met = "NULL"
            if st_status == "completed":
                y, m, d = map(int, base.split("-"))
                day = d + (stage - 1) * 12
                met = f"'{y:04d}-{m:02d}-{min(day, 28):02d} 18:00:00'"
            pt_lines.append(
                f"({pt_id}, {sid}, {sql_str(STAGE_TASKS[stage])}, 'stage_{stage}', "
                f"'{st_status}', {visible}, {met})"
            )
            bc_status = "met" if st_status == "completed" else ("in_progress" if st_status == "in_progress" else "not_met")
            bc_met = met if bc_status == "met" else "NULL"
            bc_lines.append(
                f"({bc_id}, {pt_id}, {sql_str(BEHAVIOR_CHECKS[stage])}, {stage}, "
                f"'{bc_status}', {visible}, {bc_met})"
            )
            pt_id += 1
            bc_id += 1

    lines.append("INSERT INTO `parent_tasks` (`parent_taskid`, `roadmapid`, `description`, `stage`, `status`, `visible`, `met_at`) VALUES")
    lines.append(",\n".join(pt_lines) + ";\n")

    lines.append("INSERT INTO `behavior_checks` (`behavior_checkid`, `parent_taskid`, `description`, `stage`, `status`, `visible`, `met_at`) VALUES")
    lines.append(",\n".join(bc_lines) + ";\n")

    # referrals - 2-3 per roadmap for first 18 roadmaps
    ref_lines = []
    rid = 1
    for sid, _, _, _, _, _, _, _, _, stages in STUDENTS[:18]:
        for j in range(2):
            therapy, name, loc = REFERRAL_POOL[(sid + j) % len(REFERRAL_POOL)]
            st = REFERRAL_STATUSES[(sid + stages + j) % len(REFERRAL_STATUSES)]
            met = "NULL"
            if st in ("completed", "checked_in"):
                met = f"'2026-0{(sid % 6) + 1}-15 10:00:00'"
            ref_lines.append(
                f"({rid}, {sid}, {sql_str(therapy)}, {sql_str(name)}, {sql_str(loc)}, '{st}', {met})"
            )
            rid += 1
    lines.append("INSERT INTO `referrals` (`referralid`, `roadmapid`, `therapy_type`, `name`, `location`, `status`, `met_at`) VALUES")
    lines.append(",\n".join(ref_lines) + ";\n")

    # appointments
    appt_lines = []
    for i, (pid, _, _, _) in enumerate(PARENTS[:16], 1):
        counselor = COUNSELORS[(i - 1) % len(COUNSELORS)][0]
        appt_lines.append(
            f"({i}, {pid}, {counselor}, 'counselor', 'confirmed', '2026-0{(i % 6) + 1}-10 14:00:00', '2026-0{(i % 6) + 1}-10 15:00:00')"
        )
    lines.append("INSERT INTO `appointment` (`appointmentid`, `parentid`, `counselorid`, `createdBy`, `status`, `start`, `end`) VALUES")
    lines.append(",\n".join(appt_lines) + ";\n")

    URGENCIES = ["low", "moderate", "high", "critical"]
    BEHAVIORS = [
        '["verbal_outbursts", "task_avoidance", "peer_conflict"]',
        '["social_withdrawal", "classroom_anxiety", "difficulty_initiating_conversation"]',
        '["emotional_dysregulation", "sensory_overload", "frequent_tears"]',
        '["low_self_care_motivation", "attention_seeking", "difficulty_following_routines"]',
        '["bedtime_resistance", "reading_frustration", "mild_peer_conflict"]',
        '["truancy_risk", "defiance_authority", "academic_disengagement"]',
    ]
    PARENT_NAMES = [f"{fn} {ln}" for _, fn, ln, *_ in PARENTS]

    # questionnaire submissions - 20 submissions spread across schools/months
    sub_lines = []
    for i in range(1, 21):
        st = STUDENTS[(i - 1) % len(STUDENTS)]
        sid, fn, ln, school, parent, zipc, counselor, _, created, _ = st
        month = (i % 6) + 1
        grade = (sid % 8) + 4
        urgency = URGENCIES[i % len(URGENCIES)]
        behaviors = BEHAVIORS[i % len(BEHAVIORS)]
        counselor_json = (
            f"'{{\"student_name\": \"{fn} {ln}\", \"age\": {grade + 5}, \"grade\": \"{grade}\", "
            f"\"developmental_level\": \"typical\", \"observed_behaviors\": {behaviors}, "
            f"\"trigger_types\": [\"transitions\", \"authority_correction\"], "
            f"\"recovery_time_minutes\": {15 + (i % 4) * 10}, "
            f"\"current_services\": [\"school_based_counseling\"], "
            f"\"urgency_level\": \"{urgency}\"}}'"
        )
        if i % 4 == 0:
            parent_json = "NULL"
        else:
            pname = PARENT_NAMES[parent - 1]
            parent_json = (
                f"'{{\"parent_name\": \"{pname}\", \"relationship\": \"guardian\", "
                f"\"home_concerns\": [\"morning_routine\", \"homework_refusal\"], "
                f"\"prior_services\": [\"school_counselor_checkins\"], "
                f"\"consent_to_referral\": true, \"preferred_contact\": \"email\"}}'"
            )
        sub_lines.append(
            f"({i}, {counselor}, {school}, {sql_str(zipc)}, '2026-0{month}-15 10:00:00', "
            f"{counselor_json}, {parent_json}, '1.0.0')"
        )
    lines.append(
        "INSERT INTO `questionnaire_submissions` "
        "(`submission_id`, `counselor_id`, `school_id`, `zip_code`, `submitted_at`, "
        "`counselor_form_json`, `parent_form_json`, `pipeline_version`) VALUES"
    )
    lines.append(",\n".join(sub_lines) + ";\n")

    # recommendation events - 4 per submission for first 15
    rec_lines = []
    rec_id = 1
    for sub in range(1, 16):
        st = STUDENTS[(sub - 1) % len(STUDENTS)]
        school, zipc = st[3], st[5]
        for j, therapy in enumerate(THERAPIES[:4]):
            gap = j < 3
            sev = ["critical", "high", "moderate", "moderate"][j]
            rec_lines.append(
                f"({rec_id}, {sub}, {school}, {sql_str(zipc)}, {sql_str(therapy)}, "
                f"'behavioral_therapy', '{sev}', {300 - j * 100}, {1 if gap else 0}, "
                f"'[\"behavior_observed\"]', '2026-0{(sub % 6) + 1}-15 11:00:00')"
            )
            rec_id += 1
    lines.append(
        "INSERT INTO `recommendation_events` "
        "(`recommendation_id`, `submission_id`, `school_id`, `zip_code`, `intervention`, "
        "`therapy_category`, `severity`, `gap_score`, `was_gap`, `triggered_by`, `recommended_at`) VALUES"
    )
    lines.append(",\n".join(rec_lines) + ";\n")

    # facility search - for submissions with parent form (not multiples of 4)
    fse_lines = []
    fse_id = 1
    tiers = ["recommended", "possible", "excluded"]
    for sub in range(1, 16):
        if sub % 4 == 0:
            continue
        st = STUDENTS[(sub - 1) % len(STUDENTS)]
        zipc = st[5]
        therapy = THERAPIES[sub % len(THERAPIES)]
        for j, (fname, faddr) in enumerate(FACILITIES[:3]):
            tier = tiers[j]
            score = 70 - j * 15
            fse_lines.append(
                f"({fse_id}, {sub}, {sql_str(zipc)}, {sql_str(therapy)}, {sql_str(fname)}, "
                f"{sql_str(faddr)}, 'google_places', {50 - j * 5}, {15 - j * 3}, {score}, "
                f"'{tier}', 'facility', {1 if j == 0 else 0}, '2026-0{(sub % 6) + 1}-15 12:00:00')"
            )
            fse_id += 1
    lines.append(
        "INSERT INTO `facility_search_events` "
        "(`search_event_id`, `submission_id`, `zip_code`, `therapy_type`, `facility_name`, "
        "`facility_address`, `source`, `relevance_score`, `operational_score`, `total_score`, "
        "`tier`, `result_type`, `was_selected`, `searched_at`) VALUES"
    )
    lines.append(",\n".join(fse_lines) + ";\n")

    # counselor checkins
    ci_lines = []
    for i in range(1, 25):
        counselor = COUNSELORS[(i - 1) % len(COUNSELORS)]
        cid, _, _, _, school = counselor
        ctype = "post_submission" if i % 3 else "low_usage_prompt"
        resp = ["new_student_concern", "followup_existing_student", "busy_other_responsibilities"][i % 3]
        ci_lines.append(
            f"({i}, {cid}, {school}, '{ctype}', '{resp}', '2026-0{(i % 6) + 1}-20 09:00:00')"
        )
    lines.append(
        "INSERT INTO `counselor_checkins` "
        "(`checkin_id`, `counselor_id`, `school_id`, `checkin_type`, `response`, `submitted_at`) VALUES"
    )
    lines.append(",\n".join(ci_lines) + ";\n")

    # messages - sample for first 5 appointments
    msg_lines = []
    for i in range(1, 6):
        pid = PARENTS[i - 1][0]
        counselor = COUNSELORS[i - 1][0]
        msg_lines.append(
            f"({i}, {i}, 'counselor', {pid}, {counselor}, 'Looking forward to our session.', 1, '2026-06-20 09:00:00')"
        )
    lines.append(
        "INSERT INTO `messages` "
        "(`messageid`, `appointmentid`, `message_type`, `parentid`, `counselorid`, `body`, `is_read`, `created_at`) VALUES"
    )
    lines.append(",\n".join(msg_lines) + ";\n")

    print("\n".join(lines))


if __name__ == "__main__":
    main()
