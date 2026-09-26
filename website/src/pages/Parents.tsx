import { useState } from "react";
import { Link } from "react-router";

const needTypes = [
  "Dyslexia", "ADHD", "Autism", "Anxiety", "Depression",
  "Learning Disability", "Speech/Language", "Behavioral", "Other",
];

function ResearchTool() {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleConvert = () => {
    if (!file && !url.trim()) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setDone(true); }, 2000);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>
          Upload a PDF
        </label>

        <label
          className="flex items-center justify-center gap-2 w-full py-4 rounded-lg border-2 border-dashed cursor-pointer transition-colors hover:border-current"
          style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M10 3v10M6 7l4-4 4 4M3 17h14"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <span className="text-sm">
            {file ? file.name : "Choose file or drag here"}
          </span>

          <input
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px" style={{ backgroundColor: "var(--border)" }} />
        <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          or
        </span>
        <div className="flex-1 h-px" style={{ backgroundColor: "var(--border)" }} />
      </div>

      <input
        type="url"
        placeholder="Paste a URL to a research paper"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="w-full px-4 py-3 rounded-lg text-sm outline-none"
        style={{
          backgroundColor: "var(--secondary)",
          border: "1px solid var(--border)",
          color: "var(--foreground)",
        }}
      />

      <button
        onClick={handleConvert}
        disabled={loading || (!file && !url.trim())}
        className="w-full py-3 rounded-lg font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-40"
        style={{
          backgroundColor: "var(--primary)",
          color: "var(--primary-foreground)",
        }}
      >
        {loading ? "Converting…" : done ? "Download PowerPoint" : "Convert to PowerPoint"}
      </button>

      {done && (
        <a
          href="#"
          className="block w-full text-center py-3 rounded-lg font-semibold text-sm transition-all hover:opacity-90"
          style={{
            backgroundColor: "var(--accent)",
            color: "var(--accent-foreground)",
          }}
          onClick={(e) => e.preventDefault()}
        >
          Download .pptx
        </a>
      )}
    </div>
  );
}

function FacilitySearch() {
  const [location, setLocation] = useState("");
  const [need, setNeed] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<null | typeof mockResults>(null);

  const mockResults = [
    {
      name: "Sunrise Behavioral Health Center",
      address: "1420 Oak Ave, Springfield, IL 62701",
      distance: "1.2 mi",
      description:
        "Specializes in childhood ADHD, anxiety, and behavioral support. Accepts most insurance.",
    },
    {
      name: "Gateway Learning & Wellness",
      address: "890 Maple Blvd, Springfield, IL 62702",
      distance: "2.8 mi",
      description:
        "Dyslexia screening, IEP support, and occupational therapy for K–12 students.",
    },
    {
      name: "Bright Futures Therapy Group",
      address: "3312 Elm Street, Springfield, IL 62703",
      distance: "4.1 mi",
      description:
        "Child and adolescent counseling, family therapy, and school reintegration programs.",
    },
  ];

  const handleSearch = () => {
    if (!location.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setResults(mockResults);
    }, 1500);
  };

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="City, state, or zip code"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="w-full px-4 py-3 rounded-lg text-sm outline-none"
        style={{
          backgroundColor: "var(--secondary)",
          border: "1px solid var(--border)",
          color: "var(--foreground)",
        }}
      />

      <select
        value={need}
        onChange={(e) => setNeed(e.target.value)}
        className="w-full px-4 py-3 rounded-lg text-sm outline-none appearance-none"
        style={{
          backgroundColor: "var(--secondary)",
          border: "1px solid var(--border)",
          color: need ? "var(--foreground)" : "var(--muted-foreground)",
        }}
      >
        <option value="">Disability or need type…</option>
        {needTypes.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      <button
        onClick={handleSearch}
        disabled={loading || !location.trim()}
        className="w-full py-3 rounded-lg font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-40"
        style={{
          backgroundColor: "var(--primary)",
          color: "var(--primary-foreground)",
        }}
      >
        {loading ? "Searching…" : "Find Facilities"}
      </button>

      {results && (
        <div className="pt-2 space-y-3">
          {results.map((r) => (
            <div
              key={r.name}
              className="rounded-lg p-4"
              style={{
                backgroundColor: "var(--background)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4
                  className="font-semibold text-sm"
                  style={{ color: "var(--foreground)" }}
                >
                  {r.name}
                </h4>

                <span
                  className="text-xs shrink-0 font-medium px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: "var(--secondary)",
                    color: "var(--primary)",
                  }}
                >
                  {r.distance}
                </span>
              </div>

              <p
                className="text-xs mb-2"
                style={{ color: "var(--muted-foreground)" }}
              >
                {r.address}
              </p>

              <p
                className="text-xs leading-relaxed"
                style={{ color: "var(--muted-foreground)" }}
              >
                {r.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function IEPAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(false);

  const handleAnalyze = () => {
    if (!file) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setResult(true);
    }, 2500);
  };

  const sections = [
    {
      title: "What this IEP includes",
      color: "var(--primary)",
      bg: "var(--secondary)",
      items: [
        "Annual goals in reading fluency (Lexile 580→700) and written expression",
        "90 minutes per week of specialized reading support with a certified specialist",
        "Extended time (1.5×) on all standardized assessments",
        "Preferential seating near instruction and a low distraction testing environment",
      ],
    },
    {
      title: "Things to ask about",
      color: "#B45309",
      bg: "#FEF3C7",
      items: [
        "The baseline assessment used to set the Lexile goal — ask to see the evaluation report",
        "How progress will be measured and how often you'll receive updates",
        "Who is the primary contact if goals aren't being met mid-year",
      ],
    },
    {
      title: "Your rights",
      color: "#065F46",
      bg: "#D1FAE5",
      items: [
        "Under IDEA §300.322, you must be a member of the IEP team and invited to every meeting",
        "You have the right to request an Independent Educational Evaluation (IEE) at public expense",
        "Prior Written Notice (PWN) is required whenever the school proposes or refuses to change services",
      ],
    },
  ];

  return (
    <div className="space-y-4">
      <label
        className="flex items-center justify-center gap-2 w-full py-4 rounded-lg border-2 border-dashed cursor-pointer transition-colors hover:border-current"
        style={{
          borderColor: "var(--border)",
          color: "var(--muted-foreground)",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M10 3v10M6 7l4-4 4 4M3 17h14"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <span className="text-sm">
          {file ? file.name : "Upload your child's IEP (PDF)"}
        </span>

        <input
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </label>

      <button
        onClick={handleAnalyze}
        disabled={loading || !file}
        className="w-full py-3 rounded-lg font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-40"
        style={{
          backgroundColor: "var(--primary)",
          color: "var(--primary-foreground)",
        }}
      >
        {loading ? "Analyzing…" : "Analyze IEP"}
      </button>

      {result && (
        <div className="space-y-3 pt-2">
          {sections.map((s) => (
            <div
              key={s.title}
              className="rounded-lg p-4"
              style={{
                backgroundColor: s.bg,
                border: `1px solid ${s.color}22`,
              }}
            >
              <h4
                className="font-semibold text-sm mb-3"
                style={{ color: s.color }}
              >
                {s.title}
              </h4>

              <ul className="space-y-2">
                {s.items.map((item, i) => (
                  <li
                    key={i}
                    className="text-xs leading-relaxed flex gap-2"
                    style={{ color: "var(--foreground)" }}
                  >
                    <span
                      className="mt-0.5 shrink-0"
                      style={{ color: s.color }}
                    >
                      ›
                    </span>

                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const tools = [
  {
    id: "research",
    label: "Disability Research, Made Simple",
    title: "Research to PowerPoint",
    description:
      "Upload a disability research paper or paste a link. We'll convert it into a clear, plain language presentation you can share with teachers, doctors, or family members.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M9 12h6M9 16h4M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V8l-6-5z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14 3v5h5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    component: <ResearchTool />,
  },
  {
    id: "facility",
    label: "Find Support Near You",
    title: "Facility Search",
    description:
      "Enter your location and your child's area of need. We'll surface nearby facilities from our database that specialize in the behavioral or learning support your child requires.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 21c-4-4-7-7.5-7-11a7 7 0 0114 0c0 3.5-3 7-7 11z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx="12"
          cy="10"
          r="2.5"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    ),
    component: <FacilitySearch />,
  },
  {
    id: "iep",
    label: "Understand Your Child's IEP",
    title: "IEP Analyzer",
    description:
      "Upload your child's Individualized Education Program document. We'll explain what it means in plain terms, flag things you should ask about, and cite the federal guidelines that protect your rights.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 12l2 2 4-4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    component: <IEPAnalyzer />,
  },
];

export default function Parents() {
  const shareHref = `mailto:district@school.edu?subject=Please%20consider%20MindScope&body=Hi%2C%0A%0AI%20wanted%20to%20share%20MindScope%20with%20you%20%E2%80%94%20a%20platform%20that%20helps%20schools%20support%20students%20with%20behavioral%20and%20learning%20differences.%0A%0Ahttps%3A%2F%2Fmindscope.com%2Fdistricts%0A%0AThank%20you.`;

  return (
    <>
      {/* ── Hero — split layout ── */}
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
            For Families
          </p>

          <h1
            className="font-display leading-tight mb-5"
            style={{
              fontSize: "clamp(2.2rem, 3.8vw, 3.4rem)",
              color: "#FFFFFF",
              maxWidth: 520,
            }}
          >
            Free tools for parents navigating the system alone.
          </h1>

          <p
            className="text-base md:text-lg mb-8 leading-relaxed"
            style={{
              color: "rgba(255,255,255,0.62)",
              maxWidth: 440,
            }}
          >
            MindScope gives families the resources to understand their child's
            needs, find local support, and navigate the system — no account
            needed.
          </p>

          <div className="flex flex-wrap gap-3">
            <a
              href="#tools"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 hover:-translate-y-0.5"
              style={{
                backgroundColor: "#FFFFFF",
                color: "#14337B",
              }}
            >
              Explore the Tools
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path
                  d="M6 12l4-4-4-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>

            <Link
              to="/districts"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
              style={{
                backgroundColor: "rgba(255,255,255,0.08)",
                color: "#FFFFFF",
                border: "1px solid rgba(255,255,255,0.18)",
              }}
            >
              For Districts
            </Link>
          </div>
        </div>

        {/* Right: photo card inset from top, navy behind */}
        <div
          className="hidden md:block flex-1 relative"
          style={{ backgroundColor: "#14337B" }}
        >
          <img
            src="https://images.unsplash.com/photo-1588072432836-e10032774350?w=1400&h=1000&fit=crop&auto=format"
            alt="Parent and child working together"
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              borderRadius: "2.5rem 0 2.5rem 2.5rem",
              objectPosition: "center 40%",
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

      {/* ── Why these tools exist ── */}
      <section style={{ backgroundColor: "var(--card)" }}>
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-20 grid md:grid-cols-5 gap-12 items-center">
          <div className="md:col-span-2">
            <p
              className="text-xs font-semibold tracking-widest uppercase mb-4"
              style={{ color: "var(--muted-foreground)" }}
            >
              Why we built this
            </p>

            <h2
              className="font-display text-3xl md:text-4xl leading-snug"
              style={{ color: "var(--foreground)" }}
            >
              The information gap is real — and it shouldn't determine outcomes.
            </h2>
          </div>

          <div className="md:col-span-3">
            <p
              className="text-base md:text-lg leading-relaxed"
              style={{ color: "var(--muted-foreground)" }}
            >
              Parents who know how to read an IEP, find the right specialists,
              and advocate within the system get dramatically better results for
              their children. But that knowledge shouldn't require connections
              or resources most families don't have. These tools exist to level
              that playing field — so every parent can show up informed.
            </p>
          </div>
        </div>
      </section>

      {/* ── Tools ── */}
      <section id="tools" style={{ backgroundColor: "var(--background)" }}>
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-20">
          <div className="mb-12">
            <p
              className="text-xs font-semibold tracking-widest uppercase mb-3"
              style={{ color: "var(--muted-foreground)" }}
            >
              Free parent resources
            </p>

            <h2
              className="font-display text-3xl md:text-4xl leading-tight mb-3"
              style={{ color: "var(--foreground)" }}
            >
              Three tools, no account needed.
            </h2>

            <p
              className="text-sm"
              style={{ color: "var(--muted-foreground)" }}
            >
              Built for families who are figuring this out on their own.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tools.map((tool, i) => (
              <div
                key={tool.id}
                className="rounded-2xl flex flex-col overflow-hidden"
                style={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                }}
              >
                <div
                  className="p-7 pb-0"
                  style={{ minHeight: i === 1 ? 268 : undefined }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                    style={{
                      backgroundColor: "var(--secondary)",
                      color: "var(--primary)",
                    }}
                  >
                    {tool.icon}
                  </div>

                  <p
                    className="text-xs font-semibold tracking-widest uppercase mb-2"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {tool.label}
                  </p>

                  <h2
                    className="font-display text-2xl mb-3"
                    style={{ color: "var(--foreground)" }}
                  >
                    {tool.title}
                  </h2>

                  <p
                    className="text-sm leading-relaxed mb-5"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {tool.description}
                  </p>
                </div>

                <div className="px-7 pb-7 flex-1">
                  <div
                    style={{
                      borderTop: "1px solid var(--border)",
                      paddingTop: "1.25rem",
                    }}
                  >
                    {tool.component}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Disclaimer + share CTA ── */}
      <section
        style={{
          backgroundColor: "var(--card)",
          borderTop: "1px solid var(--border)",
        }}
      >
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-16 text-center">
          <p
            className="text-sm mb-10"
            style={{ color: "var(--muted-foreground)" }}
          >
            These tools are provided for informational purposes only. MindScope
            does not provide clinical diagnoses or legal advice.
          </p>

          <div
            className="pt-8"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <p
              className="font-display text-2xl md:text-3xl mb-3"
              style={{ color: "var(--foreground)" }}
            >
              Is your child's school using MindScope?
            </p>

            <p
              className="text-sm mb-8"
              style={{ color: "var(--muted-foreground)" }}
            >
              Ask your guidance counselor, or share this platform with your
              district directly.
            </p>

            <a
              href={shareHref}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 hover:-translate-y-0.5"
              style={{
                backgroundColor: "var(--primary)",
                color: "var(--primary-foreground)",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M2 4l6 4 6-4M2 4h12v8a1 1 0 01-1 1H3a1 1 0 01-1-1V4z"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Share with Your District
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer CTA bar ── */}
      <section style={{ backgroundColor: "#14337B" }}>
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p
              className="font-semibold text-base"
              style={{ color: "#FFFFFF" }}
            >
              Know a parent who could use these tools?
            </p>

            <p
              className="text-sm mt-1"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              Share MindScope — it's completely free for families.
            </p>
          </div>

          <a
            href={shareHref}
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
            style={{
              backgroundColor: "#FFFFFF",
              color: "#14337B",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M2 4l6 4 6-4M2 4h12v8a1 1 0 01-1 1H3a1 1 0 01-1-1V4z"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Share MindScope
          </a>
        </div>
      </section>
    </>
  );
}