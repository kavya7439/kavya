/* ============================================================
   KAVYA — THE PRISM · content
   ============================================================
   EDIT HERE. All copy and links. Plain language, Kavya's voice.
   Project images: assets/p1.jpg … p6.jpg (tall captures scroll
   inside the panels like screen recordings).
   Photo: assets/kavya.jpg (About act).
   ============================================================ */

const DATA = {

  profile: {
    name: "Kavya Bahety",
    email: "bahety.kavya2004@gmail.com",
    phone: "+91 74399 97544",
    linkedin: "https://www.linkedin.com/in/kavya-bahety",
    github: "https://github.com/growthkavya",
    photo: "assets/kavya.jpg",
    location: "Kolkata, India",
  },

  nav: { work: "Work", about: "About me", contact: "Say hi" },

  hero: {
    tagline: "Hi, I'm Kavya. I build things people remember.",
    cue: "Scroll, it gets better",
  },

  work: {
    sub: "Proof of work. No tech degree, 21, directed by me, built with AI.",
  },

  projects: [
    {
      num: "01",
      title: "SSEI Website",
      category: "Full rebuild · Live · 2026",
      desc: "SSEI has taught finance for 30 years. The old site made it look ten. I helped rebuild it so a student can find any course, teacher or resource in seconds, then broke every form, OTP and checkout on purpose before a student could.",
      accent: "#7AA2FF",
      image: "assets/p1.jpg",
      links: [{ label: "Visit live", href: "https://www.ssei.co.in/" }],
    },
    {
      num: "02",
      title: "Growth Ops Dashboard",
      category: "Live dashboard · Built with AI",
      desc: "Leads, ad spend and launches lived in ten spreadsheets. Now they live on one screen, and the Monday team review runs on it instead of on memory.",
      accent: "#9BB8D4",
      image: "assets/p2.jpg",
      links: [{ label: "See the preview", href: "https://kavya7439.github.io/growth-ops-preview/" }],
    },
    {
      num: "03",
      title: "Intern Team CRM",
      category: "Team tool · Opened every working day",
      desc: "Attendance, tasks, handoffs, one place. The intern team has opened it every working day since it shipped. A tool nobody opens is a spreadsheet with better fonts.",
      accent: "#8FD0B2",
      image: "assets/p3.jpg",
      links: [{ label: "See the preview", href: "https://kavya7439.github.io/intern-crm-preview/" }],
    },
    {
      num: "04",
      title: "UTM Attribution Dashboard",
      category: "Marketing analytics",
      desc: "Which ad, post or search actually brought this student in? Before, a shrug. Now, an answer, for every sign-up on the new website.",
      accent: "#C9CDD6",
      image: "assets/p4.jpg",
      links: [{ label: "Open the spec", href: "https://kavya7439.github.io/utm-attribution-dashboard/" }],
    },
    {
      num: "05",
      title: "Finance Readiness Compass",
      category: "Student diagnostic · Live",
      desc: "Five minutes of questions, then a map: which finance role fits you and what you're missing for it. Feels like a career quiz, works like an assessment.",
      accent: "#F2C17D",
      image: "assets/p5.jpg",
      links: [{ label: "Try it", href: "https://growthkavya.github.io/growth-ops-dashboard/finance-readiness/" }],
    },
    {
      num: "06",
      title: "The Analyst Arena",
      category: "Campaign landing page · Own domain",
      desc: "A campus equity-research challenge needed a home. Registration, rules, countdown and the email automation behind it, built in a week on its own domain.",
      accent: "#E39BB0",
      image: "assets/p6.jpg",
      links: [{ label: "Visit live", href: "https://analyst-arena.ssei.co.in/" }],
    },
  ],

  philosophy: {
    line: "Most problems don't need more tools.",
    sub: "They need the ones you already have to start talking to each other.",
  },

  about: {
    name: "Kavya Bahety",
    meta: "21 · Kolkata · Growth Ops and AI Manager",
    lines: [
      "Mass comm degree. Zero computer science. Everything on this page is live and in use.",
      "I don't type every line. I direct: break the problem down, brief the models, break what comes back, ship what survives.",
      "Idea to working product in days. The loop gets faster every month, and honestly, I'm having the time of my life.",
    ],
    stamp: "Made in Kolkata",
  },

  process: ["Understand", "Structure", "Build", "Break", "Ship"],
  processLine: "AI makes the building fast. Knowing what to build is still my job.",

  cta: {
    line: "Let's build something people remember.",
    sub: "Messy, ambitious, half-formed. Bring it.",
    linkedin: "LinkedIn",
  },

  footer: {
    line: "Creating experiences that are remembered long after they're seen.",
  },
};
