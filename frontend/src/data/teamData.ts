export interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: string;
  slug: string;
}

export interface TeamValue {
  title: string;
  description: string;
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'mark',
    name: 'Mark Trevitt',
    role: 'Founding Partner',
    image: 'https://framerusercontent.com/images/J61tVZQqhWcgDNGYNPAzMHhjN88.png',
    slug: 'mark-trevitt',
  },
  {
    id: 'sean',
    name: 'Sean Brownlee',
    role: 'Venture Partner',
    image: 'https://framerusercontent.com/images/OJVM79RLiRnvB2znQNIKnStbv5c.png',
    slug: 'sean-brownlee',
  },
  {
    id: 'gautam',
    name: 'Gautam Chintapenta',
    role: 'Investor',
    image: 'https://framerusercontent.com/images/JI1wAi9fjjzXxSjToAvWZBD5c0Q.png',
    slug: 'gautam-chintapenta',
  },
];

export const TEAM_VALUES: TeamValue[] = [
  {
    title: 'Research-led outcomes',
    description:
      'We translate cutting-edge AI insights into practical technical and commercial results founders can act on',
  },
  {
    title: 'Full-stack perspective',
    description:
      'We look across the whole system — technology, markets, and behaviour — to see value shifts before they become obvious',
  },
  {
    title: 'Asymmetric conviction',
    description:
      "We're engineered to surface early signals, move ahead of consensus, and commit decisively with clarity",
  },
  {
    title: 'Mapmakers, not momentum',
    description:
      'We invest based on first principles, not pattern-matching. We back map-makers, not followers',
  },
];
