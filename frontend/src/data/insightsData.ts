export interface InsightItem {
  id: string;
  title: string;
  subtitle?: string;
  date: string;
  tag: string;
  readTime: string;
  author: string;
  url: string;
}

export const INSIGHTS: InsightItem[] = [
  {
    id: "agentic-2",
    title: "The Rise of Agentic Workflows and AI Agents — Part II",
    date: "Aug 2026",
    tag: "Thesis",
    readTime: "6 min read",
    author: "Mark Trevitt",
    url: "insights/rise-of-agentic-workflows-and-ai-agents---part-ii.html",
  },
  {
    id: "ai-frontier",
    title: "The AI Frontier: Building the Future of Superintelligence",
    date: "Jul 2026",
    tag: "Manifesto",
    readTime: "4 min read",
    author: "MARIS Team",
    url: "the-ai-frontier.html",
  },
  {
    id: "augmentation-3",
    title: "Age of Augmentation: Part 3 — Human & Machine Collaboration",
    date: "Jun 2026",
    tag: "Deep Dive",
    readTime: "8 min read",
    author: "Sean Brownlee",
    url: "insights/age-of-augmentation-3.html",
  },
  {
    id: "nvidia-gtc",
    title: "NVIDIA GTC & The Next Industrial Revolution",
    date: "May 2026",
    tag: "Market Analysis",
    readTime: "5 min read",
    author: "Gautam Chintapenta",
    url: "insights/nvidia-gtc-and-the-next-industrial-revolution.html",
  },
  {
    id: "un-ocean-news",
    title: "UN Ocean Decade: Accelerating AI & Satellite Monitoring for Global Marine Protection",
    date: "Aug 2026",
    tag: "UN News",
    readTime: "5 min read",
    author: "UN Environment News",
    url: "https://news.un.org/en/story/2026/06/1150821",
  },
  {
    id: "reuters-marine-ai",
    title: "AI-Powered Ocean Surveillance Cuts Illegal Offshore Fishing by 45% in Protected Zones",
    date: "Jul 2026",
    tag: "Reuters News",
    readTime: "4 min read",
    author: "Reuters Science & Environment",
    url: "https://www.reuters.com/business/environment/",
  },
  {
    id: "nature-marine-biodiversity",
    title: "Neural Acoustic Tagging Maps Coral Sanctuary Biodiversity and Migratory Cetacean Corridors",
    date: "Jun 2026",
    tag: "Nature Journal",
    readTime: "7 min read",
    author: "Nature Marine Biology",
    url: "https://www.nature.com/articles/s41558-024-02000-x",
  },
  {
    id: "techcrunch-edge-ai",
    title: "Offline-First Edge AI: Protecting Vulnerable Ecosystems Beyond Cellular Reach",
    date: "May 2026",
    tag: "TechCrunch AI",
    readTime: "6 min read",
    author: "TechCrunch Climate",
    url: "https://techcrunch.com/category/artificial-intelligence/",
  },
];
