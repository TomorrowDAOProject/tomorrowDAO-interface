import { IProposalTypeListItem } from 'types';
export enum EOptionType {
  simple = 'simple',
  advanced = 'advanced',
}
export const proposalTypeList: Array<IProposalTypeListItem> = [
  {
    label: 'Quick Start',
    desc: `Quickly create a simple voting list`,
    value: EOptionType.simple,
  },
  {
    label: 'Standard',
    desc: `Create a standard voting list, with each voting option including a name, logo, introduction, description, images and link.`,
    value: EOptionType.advanced,
  },
];
export enum ESourceType {
  Telegram = 0,
  TomorrowDao = 1,
}
