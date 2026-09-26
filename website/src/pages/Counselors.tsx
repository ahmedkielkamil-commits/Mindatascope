import { useState } from "react";
import { Link } from "react-router";

const steps = [
  {
    number: "01",
    title: "Counselor submits a behavioral questionnaire about a student",
    detail: "A structured intake captures behavioral markers, academic performance, and family context.",
  },
  {
    number: "02",
    title: "AI generates a care plan with referrals and a staged roadmap",
    detail: "The pipeline cross-references SAMHSA, NIMH, and AACAP guidelines to surface the best-fit providers.",
  },
  {
    number: "03",
    title: "Parent and counselor track progress together through the app",
    detail: "Appointments, messages, and milestones in one shared view — visible to both sides.",
  },
];

const referrals = [
  {
    type: "Behavioral Therapy",
    facilities: [
      {
        name: "Sunrise Behavioral Health Center",
        address: "1420 Oak Ave, Springfield, IL 62701",
        fit: "Strong match for ADHD and oppositional behavior patterns seen in Marcus's profile. Evidence-based ABA and CBT programs with a school-liaison coordinator on staff.",
      },
      {
        name: "Midwest Child & Family Services",
        address: "890 Prairie Rd, Springfield, IL 62702",
        fit: "Sliding-scale fees available. Specializes in dual-diagnosis cases where learning disability co-occurs with behavioral dysregulation.",
      },
      {
        name: "Gateway Wellness Clinic",
        address: "2215 Lincoln Ave, Springfield, IL 62704",
        fit: "Accepts Medicaid. Known for short waitlists (avg 2 weeks) and flexible after-school scheduling.",
      },
    ],
  },
  {
    type: "Educational Support",
    facilities: [
      {
        name: "Bright Futures Learning Center",
        address: "3312 Elm St, Springfield, IL 62703",
        fit: "Dyslexia-certified staff. Offers Orton-Gillingham structured literacy, which aligns with Marcus's current IEP reading goals.",
      },
      {
        name: "Achieve Academic Therapy",
        address: "770 College St, Springfield, IL 62701",
        fit: "Provides both tutoring and psychoeducational assessments. Can coordinate directly with school psychologist.",
      },
      {
        name: "Lincoln Park SPED Services",
        address: "4401 Park Dr, Springfield, IL 62705",
        fit: "District-contracted provider. Can bill directly to school — no out-of-pocket cost for families.",
      },
    ],
  },
  {
    type: "Family Support",
    facilities: [
      {
        name: "Central Illinois Family Counseling",
        address: "120 S 5th St, Springfield, IL 62701",
        fit: "Parent coaching component built into intake. Addresses family communication patterns that affect behavioral regulation at home.",
      },
      {
        name: "Resilience Family Services",
        address: "987 Monroe St, Springfield, IL 62702",
        fit: "Spanish-speaking therapists available. Home visit option for families with transportation barriers.",
      },
      {
        name: "Community First Behavioral Health",
        address: "5560 Veterans Pkwy, Springfield, IL 62704",
        fit: "Non-profit with FQHC designation. Broadest insurance acceptance of any provider in the district.",
      },
    ],
  },
];

const roadmap = [
  {
    stage: 1,
    theme: "Immediate Stabilization",
    actions: [
      "Schedule initial intake with Sunrise Behavioral Health Center",
      "Request updated psychoeducational evaluation through the district",
      "Notify classroom teacher of current IEP accommodations in writing",
    ],
    markers: [
      "Intake appointment confirmed",
      "Evaluation request submitted",
      "Teacher acknowledgment received",
    ],
  },
  {
    stage: 2,
    theme: "Assessment & Planning",
    actions: [
      "Attend evaluation results meeting with school psychologist",
      "Review and update IEP goals based on new assessment data",
      "Begin weekly behavioral therapy sessions",
    ],
    markers: [
      "Evaluation results reviewed",
      "IEP updated and signed",
      "Therapy sessions started",
    ],
  },
  {
    stage: 3,
    theme: "School-Based Support",
    actions: [
      "Set up bi-weekly check-ins between counselor and parent",
      "Establish behavioral support plan with classroom modifications",
      "Enroll in after-school tutoring at Bright Futures Learning Center",
    ],
    markers: [
      "Check-in schedule confirmed",
      "Behavioral plan signed",
      "Tutoring enrollment complete",
    ],
  },
  {
    stage: 4,
    theme: "Family Engagement",
    actions: [
      "Begin parent coaching sessions at Central Illinois Family Counseling",
      "Connect family with community resource navigator",
      "Complete home-school communication log setup",
    ],
    markers: [
      "Parent sessions started",
      "Resource navigator assigned",
      "Log system active",
    ],
  },
  {
    stage: 5,
    theme: "Progress Monitoring",
    actions: [
      "Quarterly review of IEP goal progress with full team",
      "Therapist report shared with school counselor",
      "Academic progress monitored via CBM assessments",
    ],
    markers: [
      "Q1 review completed",
      "Therapist report received",
      "CBM baseline established",
    ],
  },
  {
    stage: 6,
    theme: "Transition Planning",
    actions: [
      "Begin 504/IEP transition planning for next grade level",
      "Review service needs as student approaches middle school",
      "Develop summer continuity plan to prevent regression",
    ],
    markers: [
      "Transition goals drafted",
      "Middle school team alerted",
      "Summer plan in place",
    ],
  },
];

const trackingData = [
  {
    facility: "Sunrise Behavioral Health Center",
    type: "Behavioral Therapy",
    status: "scheduled",
  },
  {
    facility: "Bright Futures Learning Center",
    type: "Educational Support",
    status: "pending",
  },
  {
    facility: "Central Illinois Family Counseling",
    type: "Family Support",
    status: "completed",
  },
];

const statusColors: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  pending: { bg: "#FEF3C7", text: "#B45309", label: "Pending" },
  scheduled: { bg: "#DBEAFE", text: "#1D4ED8", label: "Scheduled" },
  completed: { bg: "#D1FAE5", text: "#065F46", label: "Completed" },
};

export default function Counselors() {
  const [activeTab, setActiveTab] = useState(0);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    school: "",
    district: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const toggleCheck = (key: string) =>
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));

  const tabs = [
    "Recommended Referrals",
    "Parent Roadmap",
    "Referral Tracking",
  ];

  const adminEmailHref = `mailto:admin@district.edu?subject=Please%20consider%20MindScope%20for%20our%20district&body=Hi%2C%0A%0AI%27ve%20been%20exploring%20MindScope%20and%20believe%20it%20could%20significantly%20help%20our%20counseling%20team.%20I%27d%20love%20for%20you%20to%20take%20a%20look.%0A%0Ahttps%3A%2F%2Fmindscope.com%2Fdistricts%0A%0AHappy%20to%20discuss%20further.`;

  return (
    <>
      {/* ── Hero ── */}
      <section
        className="relative flex"
        style={{
          minHeight: "calc(100vh - 5rem)",
          overflow: "hidden",
        }}
      >
        {/* Left: navy panel */}
        <div
          className="relative z-10 flex flex-col justify-center px-10 md:px-16 lg:px-20 py-12 w-full md:w-[52%] shrink-0"
          style={{ backgroundColor: "#14337B" }}
        >
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm mb-10 transition-opacity hover:opacity-60 w-fit"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M10 3L5 8l5 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back to home
          </Link>

          <p
            className="text-xs font-semibold tracking-widest uppercase mb-4"
            style={{ color: "#F3C153" }}
          >
            For School Counselors
          </p>

          <h1
            className="font-display leading-tight mb-5"
            style={{
              fontSize: "clamp(2.2rem, 3.8vw, 3.4rem)",
              color: "#FFFFFF",
              maxWidth: 520,
            }}
          >
            Do more for every student — without burning out.
          </h1>

          <p
            className="text-base md:text-lg mb-8 leading-relaxed"
            style={{
              color: "rgba(255,255,255,0.62)",
              maxWidth: 440,
            }}
          >
            MindScope gives school counselors AI assisted care plans, structured
            referral workflows, and a shared tracking view so nothing falls
            through the cracks.
          </p>

          <div className="flex flex-wrap gap-3">
            <a
              href="#demo"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 hover:-translate-y-0.5"
              style={{
                backgroundColor: "#FFFFFF",
                color: "#14337B",
              }}
            >
              See a sample care plan
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M3 7h8M7 3l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>

            <a
              href="#access"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
              style={{
                backgroundColor: "rgba(255,255,255,0.08)",
                color: "#FFFFFF",
                border: "1px solid rgba(255,255,255,0.18)",
              }}
            >
              Request access
            </a>
          </div>
        </div>

        {/* Right: photo panel */}
        <div
          className="hidden md:block flex-1 relative"
          style={{ backgroundColor: "#14337B" }}
        >
          <img
            src="https://images.unsplash.com/photo-1577896851231-70ef18881754?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY2hvb2wlMjBjb3Vuc2Vsb3IlMjBzdHVkZW50JTIwbWVldGluZyUyMGRlc2t8ZW58MXx8fHwxNzg5NzA4MTAwfDA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="School counselor with students"
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              borderRadius: "2.5rem 0 2.5rem 2.5rem",
              objectPosition: "center 30%",
            }}
          />

          <div
            className="absolute inset-0"
            style={{
              borderRadius: "2.5rem 0 2.5rem 2.5rem",
              background:
                "linear-gradient(90deg, rgba(20,51,123,0.35) 0%, transparent 35%)",
            }}
          />
        </div>
      </section>

      {/* ── The challenge ── */}
      <section style={{ backgroundColor: "var(--card)" }}>
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-20">
          <div className="grid md:grid-cols-5 gap-12 items-start">
            <div className="md:col-span-2">
              <p
                className="text-xs font-semibold tracking-widest uppercase mb-4"
                style={{ color: "var(--muted-foreground)" }}
              >
                The challenge
              </p>

              <h2
                className="font-display text-3xl md:text-4xl leading-snug"
                style={{ color: "var(--foreground)" }}
              >
                400 students. One counselor.
              </h2>
            </div>

            <div className="md:col-span-3">
              <p
                className="text-base leading-relaxed"
                style={{ color: "var(--muted-foreground)" }}
              >
                The average school counselor is responsible for over 400
                students. Identifying the right mental health resources,
                coordinating with parents, and tracking follow-through is nearly
                impossible at that scale. MindScope was built to change that —
                giving counselors a structured system so every student who needs
                support actually gets it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ backgroundColor: "var(--background)" }}>
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-20">
          <div className="mb-12">
            <p
              className="text-xs font-semibold tracking-widest uppercase mb-4"
              style={{ color: "var(--muted-foreground)" }}
            >
              How it works
            </p>

            <h2
              className="font-display text-3xl md:text-4xl leading-snug"
              style={{ color: "var(--foreground)" }}
            >
              From intake to follow-through in three steps.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.number} className="relative">
                <div
                  className="font-display text-5xl mb-4"
                  style={{
                    color: "var(--muted-foreground)",
                    opacity: 0.35,
                  }}
                >
                  {step.number}
                </div>

                <h3
                  className="font-semibold text-base mb-2 leading-snug"
                  style={{ color: "var(--foreground)" }}
                >
                  {step.title}
                </h3>

                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {step.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Demo Care Plan ── */}
      <section id="demo" style={{ backgroundColor: "var(--card)" }}>
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-20">
          <div className="mb-10">
            <p
              className="text-xs font-semibold tracking-widest uppercase mb-4"
              style={{ color: "var(--muted-foreground)" }}
            >
              Sample care plan
            </p>

            <h2
              className="font-display text-3xl md:text-4xl leading-snug mb-2"
              style={{ color: "var(--foreground)" }}
            >
              Marcus T. — Grade 4
            </h2>

            <p
              className="text-sm"
              style={{ color: "var(--muted-foreground)" }}
            >
              ADHD + Reading Disability · Springfield Elementary
            </p>
          </div>

          {/* Tabs */}
          <div
            className="flex gap-1 mb-8 p-1 rounded-lg w-fit"
            style={{ backgroundColor: "var(--muted)" }}
          >
            {tabs.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(i)}
                className="px-4 py-2 rounded-md text-sm font-medium transition-all"
                style={{
                  backgroundColor:
                    activeTab === i ? "var(--card)" : "transparent",
                  color:
                    activeTab === i
                      ? "var(--foreground)"
                      : "var(--muted-foreground)",
                  boxShadow:
                    activeTab === i
                      ? "0 1px 3px rgba(0,0,0,0.08)"
                      : "none",
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab 1: Referrals */}
          {activeTab === 0 && (
            <div className="space-y-8">
              {referrals.map((category) => (
                <div key={category.type}>
                  <h3
                    className="font-display text-xl mb-4"
                    style={{ color: "var(--foreground)" }}
                  >
                    {category.type}
                  </h3>

                  <div className="grid md:grid-cols-3 gap-4">
                    {category.facilities.map((f) => (
                      <div
                        key={f.name}
                        className="rounded-xl p-4"
                        style={{
                          backgroundColor: "var(--background)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        <h4
                          className="font-semibold text-sm mb-1"
                          style={{ color: "var(--foreground)" }}
                        >
                          {f.name}
                        </h4>

                        <p
                          className="text-xs mb-3"
                          style={{ color: "var(--muted-foreground)" }}
                        >
                          {f.address}
                        </p>

                        <div
                          className="rounded-lg p-3"
                          style={{ backgroundColor: "var(--secondary)" }}
                        >
                          <p
                            className="text-xs font-medium mb-1"
                            style={{ color: "var(--primary)" }}
                          >
                            Why this fits
                          </p>

                          <p
                            className="text-xs leading-relaxed"
                            style={{ color: "var(--foreground)" }}
                          >
                            {f.fit}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 2: Roadmap */}
          {activeTab === 1 && (
            <div className="space-y-4">
              {roadmap.map((stage) => (
                <div
                  key={stage.stage}
                  className="rounded-xl overflow-hidden"
                  style={{ border: "1px solid var(--border)" }}
                >
                  <div
                    className="flex items-center gap-4 px-5 py-4"
                    style={{ backgroundColor: "var(--secondary)" }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                      style={{
                        backgroundColor: "var(--primary)",
                        color: "var(--primary-foreground)",
                      }}
                    >
                      {stage.stage}
                    </div>

                    <h3
                      className="font-semibold text-sm"
                      style={{ color: "var(--foreground)" }}
                    >
                      {stage.theme}
                    </h3>
                  </div>

                  <div className="px-5 py-4 grid md:grid-cols-2 gap-4">
                    <div>
                      <p
                        className="text-xs font-semibold uppercase tracking-wide mb-2"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        Actions
                      </p>

                      <ul className="space-y-2">
                        {stage.actions.map((action, idx) => {
                          const key = `${stage.stage}-action-${idx}`;

                          return (
                            <li key={key} className="flex items-start gap-2">
                              <button
                                onClick={() => toggleCheck(key)}
                                className="mt-0.5 w-4 h-4 rounded shrink-0 border flex items-center justify-center transition-colors"
                                style={{
                                  borderColor: checkedItems[key]
                                    ? "var(--primary)"
                                    : "var(--border)",
                                  backgroundColor: checkedItems[key]
                                    ? "var(--primary)"
                                    : "transparent",
                                }}
                              >
                                {checkedItems[key] && (
                                  <svg
                                    width="10"
                                    height="10"
                                    viewBox="0 0 10 10"
                                    fill="none"
                                  >
                                    <path
                                      d="M2 5l2.5 2.5L8 3"
                                      stroke="white"
                                      strokeWidth="1.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                )}
                              </button>

                              <span
                                className="text-xs leading-relaxed"
                                style={{
                                  color: checkedItems[key]
                                    ? "var(--muted-foreground)"
                                    : "var(--foreground)",
                                  textDecoration: checkedItems[key]
                                    ? "line-through"
                                    : "none",
                                }}
                              >
                                {action}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    <div>
                      <p
                        className="text-xs font-semibold uppercase tracking-wide mb-2"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        Behavioral Markers
                      </p>

                      <ul className="space-y-2">
                        {stage.markers.map((marker, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-xs"
                            style={{ color: "var(--muted-foreground)" }}
                          >
                            <span style={{ color: "var(--primary)" }}>›</span>
                            {marker}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 3: Tracking */}
          {activeTab === 2 && (
            <div
              className="rounded-xl overflow-hidden"
              style={{ border: "1px solid var(--border)" }}
            >
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: "var(--secondary)" }}>
                    <th
                      className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      Facility
                    </th>
                    <th
                      className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      Therapy Type
                    </th>
                    <th
                      className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {trackingData.map((row, i) => {
                    const s = statusColors[row.status];

                    return (
                      <tr
                        key={row.facility}
                        style={{
                          borderTop:
                            i > 0 ? "1px solid var(--border)" : "none",
                        }}
                      >
                        <td
                          className="px-5 py-4 font-medium text-sm"
                          style={{ color: "var(--foreground)" }}
                        >
                          {row.facility}
                        </td>

                        <td
                          className="px-5 py-4 text-sm"
                          style={{ color: "var(--muted-foreground)" }}
                        >
                          {row.type}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold"
                            style={{
                              backgroundColor: s.bg,
                              color: s.text,
                            }}
                          >
                            {s.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <p
            className="text-xs mt-6"
            style={{ color: "var(--muted-foreground)" }}
          >
            Sample care plan generated for a fictional student profile. All
            facility names are real local providers surfaced by live search.
          </p>
        </div>
      </section>

      {/* ── Request Access ── */}
      <section id="access" style={{ backgroundColor: "var(--background)" }}>
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Left: context */}
            <div
              className="rounded-2xl p-8 h-full flex flex-col justify-center"
              style={{
                backgroundColor: "var(--secondary)",
                border: "1px solid var(--border)",
              }}
            >
              <p
                className="text-xs font-semibold tracking-widest uppercase mb-4"
                style={{ color: "var(--muted-foreground)" }}
              >
                Getting started
              </p>

              <h2
                className="font-display text-2xl md:text-3xl leading-snug mb-4"
                style={{ color: "var(--foreground)" }}
              >
                Ready to bring MindScope to your school?
              </h2>

              <p
                className="text-base leading-relaxed mb-8"
                style={{ color: "var(--muted-foreground)" }}
              >
                MindScope is implemented at the district level. If you are a
                counselor interested in using the platform, the fastest path is
                to share this page with your school administrator or district
                leadership and ask them to reach out.
              </p>

              <a
                href={adminEmailHref}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 hover:-translate-y-0.5 w-fit"
                style={{
                  backgroundColor: "#14337B",
                  color: "#FFFFFF",
                }}
              >
                Share with My Administrator
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M3 7h8M7 3l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>

              <Link
                to="/districts"
                className="inline-flex items-center gap-2 mt-3 text-sm font-medium transition-opacity hover:opacity-70 w-fit"
                style={{ color: "var(--muted-foreground)" }}
              >
                I'm an Administrator — contact us
              </Link>
            </div>

            {/* Right: interest form */}
            {!submitted ? (
              <div
                className="rounded-2xl p-8"
                style={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                }}
              >
                <h3
                  className="font-semibold text-base mb-1"
                  style={{ color: "var(--foreground)" }}
                >
                  Stay in the loop
                </h3>

                <p
                  className="text-sm mb-6"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  We will let you know when MindScope is available in your
                  district. We won't share your information.
                </p>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {["First name", "Last name"].map((placeholder, i) => (
                      <input
                        key={placeholder}
                        placeholder={placeholder}
                        value={
                          i === 0 ? formData.firstName : formData.lastName
                        }
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            [i === 0 ? "firstName" : "lastName"]:
                              e.target.value,
                          }))
                        }
                        className="px-4 py-2.5 rounded-lg text-sm outline-none"
                        style={{
                          backgroundColor: "var(--background)",
                          border: "1px solid var(--border)",
                          color: "var(--foreground)",
                        }}
                      />
                    ))}
                  </div>

                  <input
                    placeholder="Email address"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                    style={{
                      backgroundColor: "var(--background)",
                      border: "1px solid var(--border)",
                      color: "var(--foreground)",
                    }}
                  />

                  <input
                    placeholder="School name"
                    value={formData.school}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        school: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                    style={{
                      backgroundColor: "var(--background)",
                      border: "1px solid var(--border)",
                      color: "var(--foreground)",
                    }}
                  />

                  <input
                    placeholder="District name"
                    value={formData.district}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        district: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                    style={{
                      backgroundColor: "var(--background)",
                      border: "1px solid var(--border)",
                      color: "var(--foreground)",
                    }}
                  />

                  <button
                    onClick={() => {
                      if (formData.email) setSubmitted(true);
                    }}
                    className="w-full py-3 rounded-lg font-semibold text-sm transition-all hover:opacity-90"
                    style={{
                      backgroundColor: "var(--primary)",
                      color: "var(--primary-foreground)",
                    }}
                  >
                    Keep me updated
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="rounded-2xl p-8 text-center flex flex-col items-center justify-center"
                style={{
                  backgroundColor: "var(--secondary)",
                  border: "1px solid var(--border)",
                }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: "var(--primary)" }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M5 13l4 4L19 7"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <h3
                  className="font-semibold text-base mb-2"
                  style={{ color: "var(--foreground)" }}
                >
                  You're on the list
                </h3>

                <p
                  className="text-sm"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  We'll reach out when MindScope expands to your district.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Footer CTA bar ── */}
      <section style={{ backgroundColor: "#14337B" }}>
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-14 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p
              className="text-xs font-semibold tracking-widest uppercase mb-2"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              For district administrators
            </p>

            <h2
              className="font-display text-2xl md:text-3xl leading-snug"
              style={{ color: "#FFFFFF" }}
            >
              Bring MindScope to your district.
            </h2>
          </div>

          <Link
            to="/districts"
            className="inline-flex items-center gap-2 px-7 py-4 rounded-xl font-semibold text-sm transition-all hover:opacity-90 hover:-translate-y-0.5 shrink-0"
            style={{
              backgroundColor: "#FFFFFF",
              color: "#14337B",
            }}
          >
            View the district portal
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M3 7h8M7 3l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </section>
    </>
  );
}