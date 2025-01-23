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
    bgColor: 'rgba(255,174,0,0.20)',
    textColor: '#FFAE00',
    firstText: 'Availabe to be executed before',
    secondText: 'Approved on',
  },
  [AllProposalStatusString.Defeated]: {
    bgColor: '#FEEFF1',
    textColor: '#F55D6E',
    firstText: 'Rejected on',
  },
  [AllProposalStatusString.Expired]: {
    bgColor: '#EDEDED',
    textColor: '#919191',
    firstText: 'Availabe to be executed before',
    secondText: 'Approved on',
  },
  [AllProposalStatusString.Executed]: {
    bgColor: '#E4F8F5',
    textColor: '#05C4A2',
  },
  [AllProposalStatusString.BelowThreshold]: {
    bgColor: '#FEF7EC',
    textColor: '#F8B042',
  },
  [AllProposalStatusString.PendingVote]: {
    bgColor: '#FEF7EC',
    textColor: '#F8B042',
  },
  [AllProposalStatusString.Challenged]: {
    bgColor: '#F2EEFF',
    textColor: '#764DF1',
  },
  [AllProposalStatusString.Vetoed]: {
    bgColor: '#F0F1F3',
    textColor: '#687083',
  },
  [AllProposalStatusString.Published]: {
    bgColor: '#F0F5FF',
    textColor: '#597EF7',
  },
};
// the proposal is created by network dao, not tmrw dao
export const TMRWCreateProposal = 0;

export const DEFAULT_PAGESIZE = 20;

export const createOptionsDaoAlias = ['telegram-apps-dao', 'votigram-dao'];
