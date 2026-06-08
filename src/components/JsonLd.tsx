export default function JsonLd() {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "AI Ed",
    url: "https://aied.dev",
    description: "Free AI literacy training for every industry",
    publisher: { "@type": "Organization", name: "AI Ed", url: "https://aied.dev" },
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "AI Ed",
    url: "https://aied.dev",
    description: "AI Ed is a free AI literacy education platform teaching Gen AI Fundamentals, Prompt Engineering, AI Agents, and Claude Code to professionals in every industry. No technical background required.",
    logo: "https://aied.dev/images/icon.png",
    email: "hello@aied.dev",
    foundingDate: "2026-04-10",
    founder: { "@type": "Person", name: "Hyrum Hurst" },
    foundingOrganization: { "@type": "Organization", name: "QuarterSmart" },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "AI Ed Courses",
      itemListElement: [
        { "@type": "Offer", itemOffered: { "@type": "Course", name: "Gen AI Fundamentals" } },
        { "@type": "Offer", itemOffered: { "@type": "Course", name: "Prompt Engineering" } },
        { "@type": "Offer", itemOffered: { "@type": "Course", name: "AI Agents" } },
        { "@type": "Offer", itemOffered: { "@type": "Course", name: "Claude Code" } },
      ],
    },
  };

  const courseSchemas = [
    {
      "@context": "https://schema.org",
      "@type": "Course",
      name: "Gen AI Fundamentals",
      description: "Learn how large language models (LLMs) work, what tokens are, and how AI generates text, images, and code. A foundational course for professionals in any industry who want to understand AI from the ground up.",
      provider: { "@type": "Organization", name: "AI Ed", url: "https://aied.dev" },
      isAccessibleForFree: true,
      educationalLevel: "Beginner",
      inLanguage: "en",
      courseMode: "Online",
      teaches: ["Large language models", "Tokens and context windows", "AI-generated text and images", "AI fundamentals"],
      dateCreated: "2026-04-10",
      dateModified: "2026-04-10",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD", availability: "https://schema.org/PreOrder" },
    },
    {
      "@context": "https://schema.org",
      "@type": "Course",
      name: "Prompt Engineering",
      description: "Master the art of communicating with AI. Learn structured prompting techniques including role prompting, chain-of-thought, and few-shot examples that produce precise, useful outputs from AI tools like ChatGPT, Claude, and Gemini.",
      provider: { "@type": "Organization", name: "AI Ed", url: "https://aied.dev" },
      isAccessibleForFree: true,
      educationalLevel: "Intermediate",
      inLanguage: "en",
      courseMode: "Online",
      teaches: ["Prompt engineering", "Role prompting", "Chain-of-thought prompting", "Few-shot prompting", "AI communication techniques"],
      dateCreated: "2026-04-10",
      dateModified: "2026-04-10",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD", availability: "https://schema.org/PreOrder" },
    },
    {
      "@context": "https://schema.org",
      "@type": "Course",
      name: "AI Agents",
      description: "Build autonomous AI workflows that reason, use tools, and complete multi-step tasks. Learn agentic AI frameworks and orchestration patterns used in modern AI systems.",
      provider: { "@type": "Organization", name: "AI Ed", url: "https://aied.dev" },
      isAccessibleForFree: true,
      educationalLevel: "Intermediate",
      inLanguage: "en",
      courseMode: "Online",
      teaches: ["AI agents", "Autonomous AI workflows", "Agentic frameworks", "Multi-step task automation", "Tool use in AI"],
      dateCreated: "2026-04-10",
      dateModified: "2026-04-10",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD", availability: "https://schema.org/PreOrder" },
    },
    {
      "@context": "https://schema.org",
      "@type": "Course",
      name: "Claude Code",
      description: "Use AI for real software development. Learn to scaffold projects, write and debug code, and deploy applications using Claude Code CLI and AI-assisted development workflows.",
      provider: { "@type": "Organization", name: "AI Ed", url: "https://aied.dev" },
      isAccessibleForFree: true,
      educationalLevel: "Intermediate",
      inLanguage: "en",
      courseMode: "Online",
      teaches: ["Claude Code", "AI-assisted software development", "Code scaffolding with AI", "AI debugging", "Agentic coding"],
      dateCreated: "2026-04-10",
      dateModified: "2026-04-10",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD", availability: "https://schema.org/PreOrder" },
    },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is AI Ed?",
        acceptedAnswer: { "@type": "Answer", text: "AI Ed is a free AI literacy education platform at aied.dev that teaches AI fundamentals, prompt engineering, AI agents, and Claude Code to professionals in every industry. It is powered by QuarterSmart." }
      },
      {
        "@type": "Question",
        name: "Is AI Ed really free?",
        acceptedAnswer: { "@type": "Answer", text: "Yes. AI Ed is completely free with no credit card required, no subscription, and no hidden costs. The mission of AI Ed is to make AI education accessible to every professional regardless of their industry or budget." }
      },
      {
        "@type": "Question",
        name: "What courses does AI Ed offer?",
        acceptedAnswer: { "@type": "Answer", text: "AI Ed offers four courses: Gen AI Fundamentals (how large language models work), Prompt Engineering (communicating effectively with AI), AI Agents (building autonomous AI workflows), and Claude Code (using AI for software development). Each course includes hands-on lessons and real-world projects." }
      },
      {
        "@type": "Question",
        name: "Who is AI Ed for?",
        acceptedAnswer: { "@type": "Answer", text: "AI Ed is designed for professionals in every industry: healthcare, marketing, finance, legal, education, real estate, retail, engineering, creative, operations, sales, and HR. No prior technical knowledge is required." }
      },
      {
        "@type": "Question",
        name: "Do I need a technical background?",
        acceptedAnswer: { "@type": "Answer", text: "No technical background is required. AI Ed courses are designed from the ground up for non-technical professionals. Whether you are in accounting, nursing, law, or software engineering, the courses explain concepts clearly and build skills step by step." }
      },
      {
        "@type": "Question",
        name: "How long does it take to complete a course?",
        acceptedAnswer: { "@type": "Answer", text: "AI Ed courses are self-paced. Most learners complete an individual course in a few hours to a few days, depending on pace. There are no deadlines or time limits." }
      },
    ],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://aied.dev",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Courses",
        item: "https://aied.dev/#courses",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "FAQ",
        item: "https://aied.dev/#faq",
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      {courseSchemas.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
    </>
  );
}
