import { ItemType } from 'components/Collapse';

export const AI_DRIVEN_DAO_ITEMS: ItemType[] = [
  {
    key: '1',
    label: 'AI agents in DAO governance',
    children:
      'Drafting proposals, whitepapers, manifestos, and posts, summarizing governance decisions, and onboarding new members through on-chain reputation or credential storage.',
  },
  {
    key: '2',
    label: 'AI-assisted data analysis',
    children:
      'Offering analysis and insights on proposals by leveraging data analytics to identify behavior patterns or voting trends among members, aiding the DAO in making informed decisions about proposals or governance structure changes.',
  },
  {
    key: '3',
    label: 'Swarm Intelligence',
    children:
      'AI agents can act as links or liaisons between DAOs, creating a "swarm intelligence" where agents or DAOs collaborate seamlessly without human facilitation.',
  },
];

export const BLOG_POSTS = [
  {
    title: 'Creating your own DAO',
    description: 'The Ultimate Guide to Creating Your Own DAO',
    date: 'Apr 15, 2024',
    img: require('assets/revamp-imgs/Image-1.jpg').default.src,
  },
  {
    title: 'DAOs vs Traditional Organisations',
    description: 'DAOs vs Traditional Organisations: A Head-to-Head Comparison',
    date: 'Apr 15, 2024',
    img: require('assets/revamp-imgs/Image-2.jpg').default.src,
  },
  {
    title: 'Top 10 DAOs',
    description: 'Best Decentralised Autonomous Organisations (DAO), Ranked by Market Cap',
    date: 'Apr 15, 2024',
    img: require('assets/revamp-imgs/Image-3.jpg').default.src,
  },
];
