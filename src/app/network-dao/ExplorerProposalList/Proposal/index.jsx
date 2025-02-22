/**
 * @file proposal item
 * @author atom-yang
 */
// eslint-disable-next-line no-use-before-define
import React from "react";
import moment from "moment";
import PropTypes from "prop-types";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import Tag from 'components/Tag';
import Divider from 'components/Divider';
import getChainIdQuery from 'utils/url';
import constants, {
  LOG_STATUS,
  ACTIONS_COLOR_MAP,
  organizationInfoPropTypes,
  STATUS_COLOR_MAP,
  CONTRACT_TEXT_MAP,
  PROPOSAL_STATUS_CAPITAL,
} from "@redux/common/constants";
import LinkNetworkDao from 'components/LinkNetworkDao';
import "./index.css";
import VoteChart from "../../_proposal_root/components/VoteChart";
import { NETWORK_TYPE } from "@config/config";
import { getBPCount } from "@common/utils";
import ButtonWithLoginCheck from "@components/ButtonWithLoginCheck";
import Card from 'components/Card';
import Text from 'components/Text';
import { shortenFileName } from "utils/file";
import { useLandingPageResponsive } from "hooks/useResponsive";
const { proposalTypes, proposalStatus, proposalActions } = constants;

export const ACTIONS_ICON_MAP = {
  [proposalActions.APPROVE]: (
    <CheckCircleOutlined className="gap-right-small" />
  ),
  [proposalActions.REJECT]: <CloseCircleOutlined className="gap-right-small" />,
  [proposalActions.ABSTAIN]: (
    <MinusCircleOutlined className="gap-right-small" />
  ),
};
const chainIdQuery = getChainIdQuery();
const Title = (props) => {
  const { status, proposalType, votedStatus, expiredTime } = props;
  const momentExpired = moment(expiredTime);
  const now = moment();
  const threshold = moment().add(3, "days");
  const showExpired =
    status !== proposalStatus.RELEASED &&
    momentExpired.isAfter(now) &&
    momentExpired.isBefore(threshold);
  return (
    <div className="flex items-center justify-between h-[23px]">
      <div className="flex items-center gap-[10px]">
      <span className="text-[15px] font-Unbounded font-light -tracking-[0.6px] text-white">{proposalType}</span>
      {votedStatus === "none" ? (
        <Tag color={ACTIONS_COLOR_MAP[votedStatus]}>
          {ACTIONS_ICON_MAP[votedStatus]}
          {votedStatus}
        </Tag>
      ) : null}
      </div>
      {!showExpired ? (
        <span className="font-Montserrat text-descM10 text-white">{`Expire ${now.to(
          momentExpired
        )}`}</span>
      ) : null}
    </div>
  );
};
Title.propTypes = {
  status: PropTypes.oneOf(Object.values(proposalStatus)).isRequired,
  proposalType: PropTypes.oneOf(Object.values(proposalTypes)).isRequired,
  votedStatus: PropTypes.oneOf(["none", "Approve", "Reject", "Abstain"])
    .isRequired,
  expiredTime: PropTypes.string.isRequired,
};

const Proposal = (props) => {
  const {
    proposalType,
    proposalId,
    expiredTime,
    releasedTime,
    contractAddress,
    contractMethod,
    proposer,
    organizationInfo,
    status,
    loading,
    approvals,
    rejections,
    abstentions,
    canVote,
    votedStatus,
    bpCount,
    currentAccount,
    logStatus,
    handleRelease,
    handleApprove,
    handleReject,
    handleAbstain,
    title,
    description,
  } = props;
  const { isPhone } = useLandingPageResponsive();

  const bpCountNumber =
    NETWORK_TYPE === "MAIN"
      ? getBPCount(status, expiredTime, releasedTime)
      : bpCount;
  const canThisUserVote =
    (status === proposalStatus.PENDING || status === proposalStatus.APPROVED) &&
    votedStatus === "none" &&
    canVote;
  const canRelease =
    logStatus === LOG_STATUS.LOGGED &&
    currentAccount &&
    proposer === currentAccount;
  return (
    <Card
      title={
        <Title
          status={status}
          expiredTime={expiredTime}
          proposalType={proposalType}
          votedStatus={votedStatus}
        />
      }
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-col justify-center w-[calc(100%-100px)] gap-[10px]">
          {title && <h2 className="text-[15px] font-Unbounded font-light -tracking-[0.6px] text-white leading-[24px]">{title}</h2>}
          <LinkNetworkDao
              className="text-secondaryMainColor text-descM10 font-Montserrat text-ellipsis"
              href={{
                pathname: `/proposal/${proposalId}`,
              }}            
            >
              {proposalId}
            </LinkNetworkDao>
            {CONTRACT_TEXT_MAP[contractMethod] ? (
              <Tag color="primary" className="max-content">
                {CONTRACT_TEXT_MAP[contractMethod]}
              </Tag>
            ) : null}
        </div>
        <div className="flex flex-col justify-center lg:items-center">
          <Tag color={STATUS_COLOR_MAP[status]}  className="max-content">
            {PROPOSAL_STATUS_CAPITAL[status]}
          </Tag>
          {status === proposalStatus.APPROVED && canRelease ? (
            // eslint-disable-next-line max-len
            <Button
              proposal-id={proposalId}
              type="link"
              size="small"
              onClick={handleRelease}
              loading={loading.Release[proposalId]}
            >
              Release&gt;
            </Button>
          ) : null}
        </div>
      </div>
      <Divider className="my-5"/>
      <div className="flex flex-col gap-[7px]">
        <div className="flex items-center gap-2">
          <span className="text-descM10 text-white font-Montserrat w-[90px] shrink-0">Proposal Expires:</span>
          <span className="text-lightGrey text-ellipsis text-desc10 font-Montserrat">
            {moment(expiredTime).format("YYYY/MM/DD HH:mm:ss")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-descM10 text-white font-Montserrat w-[90px] shrink-0">Contract:</span>
          <div className="text-lightGrey">
            <Text textClassName="!text-desc10" iconClassName="!text-[14px]" content={shortenFileName(`ELF_${contractAddress}_${chainIdQuery.chainId}`, 20, isPhone ? 8 : 16, isPhone ? 8 : 16)} copyable />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-descM10 text-white font-Montserrat w-[90px] shrink-0">Contract Method:</span>
          <span className="text-lightGrey text-ellipsis text-desc10 font-Montserrat">{contractMethod}</span>
        </div>
      </div>
      <Divider className="my-5"/>
      <VoteChart
        proposalType={proposalType}
        approvals={approvals}
        rejections={rejections}
        abstentions={abstentions}
        bpCount={bpCountNumber}
        organizationInfo={organizationInfo}
      />
      <Divider className="my-5"/>
      <div className="flex gap-[10px]">
        <ButtonWithLoginCheck
          type='primary'
          className="flex-1"
          disabled={!canThisUserVote}
          size='small'
          proposal-id={proposalId}
          onClick={handleApprove}
          loading={loading.Approve[proposalId] && canThisUserVote}
        >
          Approve
        </ButtonWithLoginCheck>
        <ButtonWithLoginCheck
          className="flex-1"
          type='danger'
          size='small'
          disabled={!canThisUserVote}
          proposal-id={proposalId}
          onClick={handleReject}
          loading={loading.Reject[proposalId] && canThisUserVote}
        >
          &nbsp;Reject&nbsp;
        </ButtonWithLoginCheck>
        <ButtonWithLoginCheck
          type='default'
          size='small'
          className="flex-1"
          disabled={!canThisUserVote}
          onClick={handleAbstain}
          proposal-id={proposalId}
          loading={loading.Abstain[proposalId] && canThisUserVote}
        >
          Abstain
        </ButtonWithLoginCheck>
      </div>
    </Card>
  );
};

/* eslint-disable react/no-unused-prop-types */
export const proposalPropTypes = {
  proposalType: PropTypes.oneOf(Object.values(proposalTypes)).isRequired,
  proposalId: PropTypes.string.isRequired,
  expiredTime: PropTypes.string.isRequired,
  createTxId: PropTypes.string.isRequired,
  contractAddress: PropTypes.string.isRequired,
  contractMethod: PropTypes.string.isRequired,
  proposer: PropTypes.string.isRequired,
  organizationInfo: PropTypes.shape(organizationInfoPropTypes).isRequired,
  isContractDeployed: PropTypes.bool.isRequired,
  createdBy: PropTypes.oneOf(["USER", "SYSTEM_CONTRACT"]).isRequired,
  releasedTxId: PropTypes.string.isRequired,
  releasedTime: PropTypes.string.isRequired,
  createAt: PropTypes.string.isRequired,
  status: PropTypes.oneOf(Object.values(proposalStatus)).isRequired,
  approvals: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    .isRequired,
  rejections: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    .isRequired,
  abstentions: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    .isRequired,
  canVote: PropTypes.bool.isRequired,
  votedStatus: PropTypes.oneOf(["none", "Approve", "Reject", "Abstain"])
    .isRequired,
  logStatus: PropTypes.oneOf(Object.values(LOG_STATUS)).isRequired,
  bpCount: PropTypes.number.isRequired,
  handleRelease: PropTypes.func.isRequired,
  handleApprove: PropTypes.func.isRequired,
  handleReject: PropTypes.func.isRequired,
  handleAbstain: PropTypes.func.isRequired,
  currentAccount: PropTypes.string,
};

Proposal.propTypes = proposalPropTypes;
Proposal.defaultProps = {
  currentAccount: "",
};

export default Proposal;
