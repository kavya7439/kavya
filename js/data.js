/* ============================================================
   KAVYA — THE PRISM · content
   ============================================================
   EDIT HERE. All copy and links. Plain language, Kavya's voice.
   Project images: assets/p1.jpg … p4.jpg (tall captures scroll
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
      title: "UTM Attribution Dashboard",
      category: "Marketing analytics · Live",
      desc: "Which ad, post or search actually brought this student in? Before, a shrug. Now, an answer, for every sign-up on the new website.",
      accent: "#C9CDD6",
      image: "assets/p4.jpg",
      links: [{ label: "Open the spec", href: "https://kavya7439.github.io/utm-attribution-dashboard/" }],
    },
    {
      num: "03",
      title: "Barely Chartered",
      category: "Brand site · Side project · Still cooking",
      desc: "A CFA Level 1 brand that talks like a person, not an institute. The site opens as a results email, then becomes the pitch. Built as a demo; the brand is still being shaped.",
      accent: "#D4FF3F",
      image: "assets/p3.jpg",
      links: [{ label: "See the demo", href: "barely-chartered/" }],
    },
    {
      num: "04",
      title: "Growth Ops Dashboard",
      category: "Team operating system · Live, behind a login",
      desc: "Leads, ad spend, launches, interns, student lifecycle: it lived in ten spreadsheets. Now it is one system the Monday review runs on. The tour shows the shape; the sample workspace shows the feel.",
      accent: "#9BB8D4",
      image: "assets/p2.jpg",
      links: [{ label: "Take the tour", href: "growth-ops/" }, { label: "Sample workspace", href: "https://kavya7439.github.io/growth-ops-preview/" }],
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
