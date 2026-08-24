export interface NetworkMember {
  id: string;
  name: string;
  role: string;
  type: 'Network Member' | 'Technical Advisor' | 'Operating Advisor' | 'Industry Advisor' | 'Venture Advisor';
  quote?: string;
}

export const NETWORK_MEMBERS: NetworkMember[] = [
  {
    id: 'krithik',
    name: 'Krithik Puthalath',
    role: 'CEO, Co-founder',
    type: 'Network Member',
    quote:
      'More than just money, Mark rolls his sleeves-up and goes deep on AI to add real value by intros to key customers, partners, and investors.',
  },
  {
    id: 'hamid',
    name: 'Hamid Abdollahi',
    role: 'Technical Advisor',
    type: 'Technical Advisor',
  },
  {
    id: 'yevgeniy',
    name: 'Yevgeniy Vahlis',
    role: 'Operating Advisor',
    type: 'Operating Advisor',
  },
  {
    id: 'paul',
    name: 'Paul Kruszewski',
    role: 'Industry Advisor',
    type: 'Industry Advisor',
  },
  {
    id: 'sankaet',
    name: 'Sankaet Pathak',
    role: 'Venture Advisor',
    type: 'Venture Advisor',
  },
];
