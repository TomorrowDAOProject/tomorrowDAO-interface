/**
 * @file constants
 * @author atom-yang
 */
import PropTypes from 'prop-types';
import AElf from 'aelf-sdk';
import getExplorerRPC from 'utils/getExplorerRPC';
import config from '../../common/config';

const { constants, viewer, wallet } = config;
const explorerRPC = getExplorerRPC();
export const FAKE_WALLET = AElf.wallet.getWalletByPrivateKey(wallet.privateKey);

export const API_PATH = {
  GET_ALL_CONTRACTS: '/viewer/allContracts',
  GET_PROPOSAL_LIST: '/proposal/list',
  GET_PROPOSAL_INFO: '/proposal/proposalInfo',
  CHECK_CONTRACT_NAME: '/proposal/checkContractName',
  ADD_CONTRACT_NAME: '/proposal/addContractName',
  UPDATE_CONTRACT_NAME: '/proposal/updateContractName',
  GET_AUDIT_ORGANIZATIONS: '/proposal/auditOrganizations',
  GET_ORGANIZATIONS: '/proposal/organizations',
  GET_VOTED_LIST: '/proposal/votedList',
  GET_PERSONAL_VOTED_LIST: '/proposal/personalVotedList',
  GET_CONTRACT_NAME: '/viewer/getContractName',
  GET_AUDIT_ORG_BY_PAGE: '/proposal/auditOrganizationsByPage',
  GET_ORG_OF_OWNER: '/proposal/orgOfOwner',
  GET_APPLIED_PROPOSALS: '/proposal/appliedList',
  GET_ALL_PERSONAL_VOTES: '/proposal/allPersonalVotes',
};

export const LOG_STATUS = {
  LOGGED: 'logged',
  LOG_OUT: 'log_out',
};

export const LOADING_STATUS = {
  LOADING: 'loading',
  SUCCESS: 'success',
  FAILED: 'failed',
};

export const organizationInfoPropTypes = {
  releaseThreshold: PropTypes.shape({
    minimalApprovalThreshold: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
    ]).isRequired,
    maximalRejectionThreshold: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
    ]).isRequired,
    maximalAbstentionThreshold: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
    ]).isRequired,
    minimalVoteThreshold: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
    ]).isRequired,
  }).isRequired,
  orgAddress: PropTypes.string.isRequired,
  orgHash: PropTypes.string.isRequired,
  txId: PropTypes.string.isRequired,
  createdAt: PropTypes.string.isRequired,
  updatedAt: PropTypes.string.isRequired,
  creator: PropTypes.string.isRequired,
  proposalType: PropTypes.oneOf(Object.values(constants.proposalTypes)).isRequired,
  leftOrgInfo: PropTypes.shape({
    proposerAuthorityRequired: PropTypes.bool,
    parliamentMemberProposingAllowed: PropTypes.bool,
    tokenSymbol: PropTypes.string,
    proposerWhiteList: PropTypes.shape({
      proposers: PropTypes.arrayOf(PropTypes.string),
    }),
    organizationMemberList: PropTypes.shape({
      organizationMembers: PropTypes.arrayOf(PropTypes.string),
    }),
  }),
};

const { proposalStatus, proposalActions } = constants;

export const ACTIONS_COLOR_MAP = {
  [proposalActions.APPROVE]: 'success',
  [proposalActions.REJECT]: 'error',
  [proposalActions.ABSTAIN]: 'secondary',
};

export const STATUS_COLOR_MAP = {
  [proposalStatus.PENDING]: 'warning',
  [proposalStatus.APPROVED]: 'success',
  [proposalStatus.RELEASED]: 'primary',
  [proposalStatus.EXPIRED]: 'secondary',
};

export const CONTRACT_TEXT_MAP = {
  ProposeContractCodeCheck: 'Check Contract Code',
  DeploySmartContract: 'Deploy Contract',
  UpdateSmartContract: 'Update Contract',
};

export const PROPOSAL_STATUS_CAPITAL = {
  [proposalStatus.PENDING]: 'Pending',
  [proposalStatus.APPROVED]: 'Approved',
  [proposalStatus.EXPIRED]: 'Expired',
  [proposalStatus.RELEASED]: 'Released',
};

export default {
  ...constants,
  proposalStatus: {
    ...proposalStatus,
  },
  viewer,
  DEFAUT_RPCSERVER: explorerRPC,
  APP_NAME: 'explorer.aelf.io',
};
export const DEFAUT_RPCSERVER = explorerRPC;
