/* ============================================================
   KAVYA — THE PRISM · content
   ============================================================
   EDIT HERE. All copy and links. [ADD ...] renders as a
   visible placeholder. Plain language, minimal words.
   Project images: set image: "assets/p1.jpg" etc. and drop
   files in /assets. Until then an abstract frame renders.
   ============================================================ */

const DATA = {

  profile: {
    name: "Kavya Bahety",
    email: "bahety.kavya2004@gmail.com",
    linkedin: "https://www.linkedin.com/in/kavya-bahety",
    github: "https://github.com/growthkavya",
    location: "Kolkata, India",
  },

  hero: {
    tagline: "Creating experiences that are remembered.",
    cue: "Scroll",
  },

  work: {
    sub: "Selected work · Four systems, live",
  },

  projects: [
    {
      num: "01",
      title: "SSEI Website System",
      category: "Content strategy · UX structure · Testing",
      desc: "A 30-year education company's website, restructured into clearer journeys for students and internal teams.",
      accent: "#7AA2FF",
      image: "assets/p1.jpg",
      links: [{ label: "Visit live", href: "https://www.ssei.co.in/" }],
    },
    {
      num: "02",
      title: "Growth Operations Dashboard",
      category: "Product · Data · Built with AI",
      desc: "One live dashboard that replaced scattered spreadsheets for leads, spends and launches. The weekly review runs on it.",
      accent: "#9BB8D4",
      image: "assets/p2.jpg",
      links: [
        { label: "Open dashboard", href: "https://growthkavya.github.io/growth-ops-dashboard/lab/" },
        { label: "Code", href: "https://github.com/growthkavya/growth-ops-dashboard" },
      ],
    },
    {
      num: "03",
      title: "Intern Team CRM",
      category: "Internal tool · Operations",
      desc: "Attendance, tasks and team management in one place. In daily use for over two months.",
      accent: "#8FD0B2",
      image: "assets/p3.jpg",
      links: [{ label: "See it live", href: "https://growthkavya.github.io/growth-ops-dashboard/lab/" }],
    },
    {
      num: "04",
      title: "UTM Attribution Dashboard",
      category: "Analytics · Reporting design",
      desc: "Lead attribution for the new SSEI website. Every identified action traced back to its source.",
      accent: "#C9CDD6",
      image: "assets/p4.jpg",
      links: [{ label: "Open the spec", href: "https://kavya7439.github.io/utm-attribution-dashboard/" }],
    },
  ],

  philosophy: {
    line: "Most problems don't need more pieces.",
    sub: "They need the existing ones to work together.",
  },

  about: {
    name: "Kavya Bahety",
    meta: "21 · Kolkata · Growth operations",
    lines: [
      "I come from mass communication, not computer science.",
      "I direct AI the way a producer directs a set. The systems on this page are the result.",
      "A habit of not giving up, and of getting things shipped.",
    ],
  },

  process: ["Understand", "Structure", "Build", "Test", "Improve"],
  processLine: "AI moves the work faster. It does not decide what matters.",

  achievements: [
    { n: "4", label: "working systems, live today" },
    { n: "60+", label: "days of daily CRM use by the intern team" },
    { n: "1", label: "full website relaunch, shipped 2026" },
    { n: "[ADD]", label: "[ADD a verified number worth bragging about]" },
  ],

  cta: {
    line: "Let's build something beautiful.",
    sub: "Have something complex in mind? Bring it.",
  },

  footer: {
    line: "Creating experiences that are remembered long after they're seen.",
  },
};
