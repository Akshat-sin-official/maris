export interface Testimonial {
  id: string;
  author: string;
  role: string;
  quote: string;
  companyLogo: string;
  badge: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "un-oxygen-carbon",
    author: "UNITED NATIONS ENVIRONMENT PROGRAMME",
    role: "UN Ocean & Climate Science Research",
    quote: "The ocean produces over 50% of the world's oxygen through marine phytoplankton and absorbs nearly 30% of human-emitted carbon dioxide, making marine ecosystems our planet's primary life-support system.",
    companyLogo: "/logos/un.svg",
    badge: "50%+ WORLD OXYGEN",
  },
  {
    id: "who-health-biodiversity",
    author: "WORLD HEALTH ORGANIZATION (WHO)",
    role: "Global Marine Health & Nutrition Index",
    quote: "Marine ecosystems harbor over 80% of all species diversity on Earth and provide critical nutrition to more than 3 billion people globally, anchoring both planetary health and human survival.",
    companyLogo: "/logos/who.svg",
    badge: "80% PLANETARY BIODIVERSITY",
  },
  {
    id: "wwf-blue-carbon",
    author: "WORLD WILDLIFE FUND (WWF)",
    role: "Global Marine Conservation Initiative",
    quote: "Coastal blue carbon habitats—mangroves, seagrasses, and tidal marshes—sequester atmospheric carbon up to 10 times faster per hectare than terrestrial tropical rainforests, critical for global climate stabilization.",
    companyLogo: "/logos/wwf.svg",
    badge: "10x FASTER CARBON CAPTURE",
  },
  {
    id: "noaa-coastal-reef",
    author: "NATIONAL OCEANIC & ATMOSPHERIC ADMINISTRATION",
    role: "NOAA Ocean Service & Coastal Protection",
    quote: "Coral reefs buffer over 200 million coastal residents from storm surges, tsunamis, and coastal erosion while providing essential spawning and nursery grounds for 25% of all marine life.",
    companyLogo: "/logos/noaa.svg",
    badge: "200M+ RESIDENTS PROTECTED",
  },
];
