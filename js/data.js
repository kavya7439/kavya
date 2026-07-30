/* ============================================================
   KAVYA — THE PRISM · content
   ============================================================
   EDIT HERE. All copy and links. [ADD ...] renders as a
   visible placeholder. Plain language, minimal words.
   Project images: assets/p1.jpg … p4.jpg (tall captures
   scroll inside the panels like screen recordings).
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
    sub: "Proof of work — how a 21-year-old with no tech background ships real products with AI",
  },

  projects: [
    {
      num: "01",
      title: "SSEI Website",
      category: "Website rebuild · Live",
      desc: "SSEI has taught finance for 30 years. I helped rebuild its website so a student can find any course, teacher or resource in seconds.",
      accent: "#7AA2FF",
      image: "assets/p1.jpg",
      links: [{ label: "Visit live", href: "https://www.ssei.co.in/" }],
    },
    {
      num: "02",
      title: "Growth Ops Dashboard",
      category: "Live dashboard · Built with AI",
      desc: "Our leads, ad spends and launches used to sit in ten different spreadsheets. Now one dashboard shows all of it, and the weekly team review runs on it.",
      accent: "#9BB8D4",
      image: "assets/p2.jpg",
      links: [
        { label: "See the preview", href: "https://kavya7439.github.io/growth-ops-preview/" },
        { label: "Code", href: "https://github.com/growthkavya/growth-ops-dashboard" },
      ],
    },
    {
      num: "03",
      title: "Intern Team CRM",
      category: "Team tool · Used daily",
      desc: "One place where our intern team marks attendance, picks up tasks and tracks work. They have opened it every working day for two months.",
      accent: "#8FD0B2",
      image: "assets/p3.jpg",
      links: [{ label: "See the preview", href: "https://kavya7439.github.io/intern-crm-preview/" }],
    },
    {
      num: "04",
      title: "UTM Attribution Dashboard",
      category: "Marketing analytics",
      desc: "When someone signs up on the new SSEI website, this shows exactly which ad, post or search brought them in.",
      accent: "#C9CDD6",
      image: "assets/p4.jpg",
      links: [{ label: "Open the spec", href: "https://kavya7439.github.io/utm-attribution-dashboard/" }],
    },
  ],

  philosophy: {
    line: "Most problems don't need more tools.",
    sub: "They need the ones you already have to start talking to each other.",
  },

  about: {
    name: "Kavya Bahety",
    meta: "21 · Kolkata · Growth operations",
    lines: [
      "No computer science degree. No engineering team. Everything on this page is live and in use.",
      "I work by directing AI: break the problem down, brief the models, test what comes back, ship only what holds up.",
      "That takes me from idea to working product in days — and the loop gets faster every month.",
    ],
  },

  process: ["Understand", "Structure", "Build", "Test", "Improve"],
  processLine: "AI makes the building faster. Deciding what to build is still my job.",

  achievements: [
    { n: "4", label: "tools live and in use today" },
    { n: "60+", label: "days the intern team has used the CRM, every working day" },
    { n: "1", label: "full website relaunch shipped in 2026" },
    { n: "[ADD]", label: "[ADD a verified number worth bragging about]" },
  ],

  cta: {
    line: "Let's build something beautiful.",
    sub: "Have something messy or ambitious in mind? Bring it.",
  },

  footer: {
    line: "Creating experiences that are remembered long after they're seen.",
  },
};
