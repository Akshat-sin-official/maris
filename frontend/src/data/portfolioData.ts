export interface PortfolioCompany {
  id: string;
  name: string;
  logo: string;
  bgImage?: string;
  categories: string[];
  description: string;
  badge?: string;
  url: string;
}

export const PORTFOLIO_CATEGORIES = [
  'All',
  'Next-gen Compute',
  'Physical AI',
  'Agent Economy',
  'Scalable Infrastructure',
  'Engineered Science',
  'Exited',
] as const;

export const PORTFOLIO_COMPANIES: PortfolioCompany[] = [
  {
    id: 'zyphra',
    name: 'Zyphra',
    logo: 'https://framerusercontent.com/images/3BkLg4RrKuTEc2ioeMWIbKb1HLM.png?width=366&height=80',
    categories: ['Next-gen Compute', 'Agent Economy', 'Scalable Infrastructure'],
    description: 'Full stack for open superintelligence — foundation models, inference platform and superagent.',
    url: 'https://www.zyphra.com/',
  },
  {
    id: 'foundation',
    name: 'Foundation',
    logo: 'https://framerusercontent.com/images/iyJ8Dhkm3bgQXghBtxi4cl6LgQ.svg?width=174&height=40',
    categories: ['Physical AI'],
    description: 'Autonomous machines that can do anything humanity wants',
    url: 'https://foundation.bot/',
  },
  {
    id: 'dwave',
    name: 'D-Wave Quantum',
    logo: 'https://framerusercontent.com/images/txO57a4C2wPN3aH3D07ZWYRqgv8.svg?width=160&height=40',
    categories: ['Next-gen Compute', 'Exited'],
    description: 'Quantum computing realized',
    badge: 'IPO: NYSE: QBTS',
    url: 'https://www.dwavequantum.com/',
  },
  {
    id: 'locus',
    name: 'Locus Robotics',
    logo: 'https://framerusercontent.com/images/OKW1sSFlpbAMrNcSQKHBJ4XOe0.png?width=673&height=180',
    categories: ['Physical AI'],
    description: 'Fully autonomous fulfillment for warehouses',
    url: 'https://www.locusrobotics.com',
  },
  {
    id: 'vivodyne',
    name: 'Vivodyne',
    logo: 'https://framerusercontent.com/images/IRz4eoEHdEUjnrrFDztQR1fho3M.svg?width=174&height=40',
    categories: ['Engineered Science'],
    description: 'Making biology computable with human tissue data centers',
    url: 'https://vivodyne.com',
  },
  {
    id: 'mythic',
    name: 'Mythic',
    logo: 'https://framerusercontent.com/images/5Fl09p6HmTzYSdvxzReP8vgfgE.svg?width=154&height=40',
    categories: ['Next-gen Compute', 'Physical AI'],
    description: 'Orders of magnitude more energy efficient AI inference',
    url: 'https://mythic.ai',
  },
  {
    id: 'siliconomix',
    name: 'Siliconomix',
    logo: 'https://framerusercontent.com/images/3BkLg4RrKuTEc2ioeMWIbKb1HLM.png?width=366&height=80',
    categories: ['Next-gen Compute'],
    description: 'Reimagining data center infrastructure for the AI era',
    url: '#',
  },
  {
    id: 'variational',
    name: 'Variational AI',
    logo: 'https://framerusercontent.com/images/iyJ8Dhkm3bgQXghBtxi4cl6LgQ.svg?width=174&height=40',
    categories: ['Engineered Science'],
    description: 'Generative AI for drug design against the hardest targets',
    url: 'https://variational.ai',
  },
  {
    id: 'quandri',
    name: 'Quandri',
    logo: 'https://framerusercontent.com/images/txO57a4C2wPN3aH3D07ZWYRqgv8.svg?width=160&height=40',
    categories: ['Agent Economy'],
    description: 'AI Agents for Insurance Intelligence',
    url: 'https://quandri.io',
  },
  {
    id: 'heritable',
    name: 'Heritable',
    logo: 'https://framerusercontent.com/images/OKW1sSFlpbAMrNcSQKHBJ4XOe0.png?width=673&height=180',
    categories: ['Engineered Science', 'Physical AI'],
    description: 'Making plants programmable',
    url: '#',
  },
];
