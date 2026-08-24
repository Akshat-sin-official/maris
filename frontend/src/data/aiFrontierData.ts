export interface FrontierCategory {
  name: string;
  items: string[];
}

export const AI_FRONTIER_CATEGORIES: FrontierCategory[] = [
  {
    name: 'Agent Economy',
    items: [
      '01 Vertical Agents',
      '02 Agentic Commerce',
      '03 Multi-Agent Systems',
      '04 Multimodal AI',
      '05 Systems of Action',
      '06 AI-Native Services',
    ],
  },
  {
    name: 'Next-gen Compute',
    items: [
      '01 New Computing Paradigms',
      '02 Data Center Infrastructure',
      '03 Semiconductors',
    ],
  },
  {
    name: 'Physical AI',
    items: [
      '02 Physics Action Models',
      '03 Perception Systems',
      '05 Human Machine Interfaces',
      '06 Computer Vision',
    ],
  },
  {
    name: 'Scalable Infrastructure',
    items: [
      '01 Agent Infrastructure',
      '02 Developer Tools',
      '03 Data Infrastructure',
      '04 Cybersecurity',
      '05 Trust & Compliance',
      '06 Decentralized AI',
      '01 AI Infrastructure',
    ],
  },
  {
    name: 'Engineered Science',
    items: [
      '01 Lab Automation & Tools',
      '02 Materials Discovery',
      '03 Physics Models',
      '04 Computational Biology',
      '05 AI for Science',
    ],
  },
];
