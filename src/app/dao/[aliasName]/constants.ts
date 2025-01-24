import {
  AllProposalStatusString,
  ProposalStatusFilters,
  ProposalStatusReplaceMap,
  ProposalTypeString,
} from 'types';
export const ALL = 'All';
export const proposalTypeList = [
  { value: ALL, label: ALL },
  ...(Object.keys(ProposalTypeString) as Array<keyof typeof ProposalTypeString>).map((key) => {
    return {
      value: ProposalTypeString[key],
      label: key,
    };
  }),
];

export const proposalStatusList = [
  { value: ALL, label: ALL },
  ...ProposalStatusFilters.map((key) => {
    return {
      value: key,
      label: ProposalStatusReplaceMap[key] ?? AllProposalStatusString[key],
    };
  }),
];

export const HC_MEMBER = 'Member';
export const HC_CANDIDATE = 'Candidate';

export const tagMap = {
  proposalType: 'All models',
  governanceMechanism: 'All governanceMechanism',
  proposalStatus: 'All status',
  pagination: '',
  content: '',
};

export const tagColorMap = {
  [AllProposalStatusString.Approved]: {
    bgColor: 'rgba(0, 200, 77, 0.25)',
    textColor: '#00C84D',
    firstText: 'Availabe to be executed before',
    secondText: 'Approved on',
  },
  [AllProposalStatusString.Defeated]: {
    bgColor: 'rgba(255, 55, 77, 0.15)',
    textColor: '#FF485D',
    firstText: 'Rejected on',
  },
  [AllProposalStatusString.Expired]: {
    bgColor: 'rgba(255, 255, 255, 0.08)',
    textColor: '#B9B9B9',
    firstText: 'Availabe to be executed before',
    secondText: 'Approved on',
  },
  [AllProposalStatusString.Executed]: {
    bgColor: 'rgba(255, 255, 255, 0.08)',
    textColor: '#B9B9B9',
  },
  [AllProposalStatusString.BelowThreshold]: {
    bgColor: '#FEF7EC',
    textColor: '#F8B042',
  },
  [AllProposalStatusString.PendingVote]: {
    bgColor: 'rgba(255, 174, 0, 0.20)',
    textColor: '#FFAE00',
  },
  [AllProposalStatusString.Challenged]: {
    bgColor: '#F2EEFF',
    textColor: '#764DF1',
  },
  [AllProposalStatusString.Vetoed]: {
    bgColor: 'rgba(255, 255, 255, 0.08)',
    textColor: '#B9B9B9',
  },
  [AllProposalStatusString.Published]: {
    bgColor: 'rgba(93, 73, 246, 0.60)',
    textColor: '#C0B8FF',
  },
};
// the proposal is created by network dao, not tmrw dao
export const TMRWCreateProposal = 0;

export const DEFAULT_PAGESIZE = 20;

export const createOptionsDaoAlias = ['telegram-apps-dao', 'votigram-dao'];
