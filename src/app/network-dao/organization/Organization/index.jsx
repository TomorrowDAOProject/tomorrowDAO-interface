/**
 * @file organization item
 * @author atom-yang
 */
import React, { useMemo } from "react";
import roundTo from "round-to";
import { Switch, Case } from "react-if";
import moment from "moment";
import PropTypes from "prop-types";
import { Card,Row,Col,Divider } from "antd";
import { mainExplorer, explorer } from 'config'
import constants, {
  LOG_STATUS,
  organizationInfoPropTypes,
} from "@redux/common/constants";
import config from "@common/config";
import Circle from "../../_proposal_root/components/Circle/index";
import "./index.css";
import { isPhoneCheck } from "@common/utils";
import addressFormat from "@utils/addressFormat";
import { useChainSelect } from "hooks/useChainSelect";
import Select from 'components/Select';
import clsx from "clsx";

const { viewer } = config;

const { proposalTypes, proposalActions } = constants;

const Title = (props) => {
  const { proposalType } = props;
  return (
    <div className="organization-list-item-title">
      <span className="gap-right-small text-[14px] text-white font-Montserrat font-medium">{proposalType} Organisation</span>
    </div>
  );
};
Title.propTypes = {
  proposalType: PropTypes.oneOf(Object.values(proposalTypes)).isRequired,
};

function getRate(number, precision = 2) {
  return roundTo(number * 100, precision);
}

export function getCircleValues(
  proposalType,
  releaseThreshold,
  leftOrgInfo,
  bpCount = 1
) {
  const abstractVoteTotal = 10000;
  const {
    minimalApprovalThreshold,
    maximalRejectionThreshold,
    maximalAbstentionThreshold,
    minimalVoteThreshold,
  } = releaseThreshold;
  let total;
  let coef = 1;
  let precision = 0;
  if (proposalType === proposalType.ASSOCIATION) {
    const {
      organizationMemberList: { organizationMembers },
    } = leftOrgInfo;
    total = organizationMembers.length;
  } else if (proposalType === proposalTypes.PARLIAMENT) {
    coef = bpCount / abstractVoteTotal;
    total = abstractVoteTotal;
  } else {
    precision = 8;
    total = minimalVoteThreshold;
  }
  const result = {
    [proposalActions.APPROVE]: {
      value: minimalApprovalThreshold,
      maxValue: total,
      num: roundTo.up(minimalApprovalThreshold * coef, precision),
      rate: `${getRate(minimalApprovalThreshold / total)}%`,
    },
    [proposalActions.REJECT]: {
      value: maximalRejectionThreshold,
      maxValue: total,
      num: roundTo(maximalRejectionThreshold * coef, precision),
      rate: `${getRate(maximalRejectionThreshold / total)}%`,
    },
    [proposalActions.ABSTAIN]: {
      value: maximalAbstentionThreshold,
      maxValue: total,
      num: roundTo(maximalAbstentionThreshold * coef, precision),
      rate: `${getRate(maximalAbstentionThreshold / total)}%`,
    },
    Total: {
      value: minimalVoteThreshold,
      maxValue: total,
      num: roundTo.up(minimalVoteThreshold * coef, precision),
      rate: `${getRate(minimalVoteThreshold / total)}%`,
    },
  };
  return result;
}

function isProposer(
  logStatus,
  user,
  proposalType,
  leftOrgInfo,
  bpList,
  parliamentProposerList
) {
  if (logStatus !== LOG_STATUS.LOGGED) {
    return false;
  }
  const { proposerAuthorityRequired, proposerWhiteList = {} } = leftOrgInfo;
  let proposers = proposerWhiteList?.proposers??[];
  if (proposalType === proposalTypes.PARLIAMENT) {
    if (proposerAuthorityRequired === true) {
      proposers = [...bpList, ...parliamentProposerList];
      proposers = [...new Set(proposers)];
      return proposers.indexOf(user) > -1;
    }
    return true;
  }
  return proposers.indexOf(user) > -1;
}

export function getOrganizationLeftInfo(
  proposalType,
  leftOrgInfo,
  bpList,
  parliamentProposerList,
  organizationCaseClass,
  organizationItemClass,
) {

  console.log('leftOrgInfo', leftOrgInfo)
  const {
    tokenSymbol,
    proposerAuthorityRequired,
    proposerWhiteList = {},
    organizationMemberList = {},
  } = leftOrgInfo;

  console.log('proposerWhiteList', proposerWhiteList)


  let proposers = proposerWhiteList?.proposers??[];
  let organizationMembers = organizationMemberList?.organizationMembers??[];
  if (proposalType === proposalTypes.PARLIAMENT) {
    organizationMembers = [...bpList];
    if (proposerAuthorityRequired === true) {
      proposers = [...bpList, ...parliamentProposerList];
      proposers = [...new Set(proposers)];
    }
  }

  const proposersOptions = [];
  proposers?.map((v) => {
    proposersOptions.push({ label: `ELF_${v}_${viewer.chainId}`, value: v });
  })

  const proposerList =
    proposers.length > 0 ? (
      <Select
        // className="!h-[43px] !bg-fillBg8 !border-fillBg16"
        // labelClassName="!text-desc12"
        value={proposers[0]}
        className="w-full !h-[43px] !bg-fillBg8 !border-fillBg16"
        labelClassName="!max-w-[100%] !text-lightGrey text-ellipsis !text-[11px]"
        overlayItemClassName="text-ellipsis !text-[11px]"
        options={proposersOptions}
      />
    ) : (
      "None"
    );

  const membersOptions = [];
  organizationMembers?.map((v) => {
    membersOptions.push({ label: `ELF_${v}_${viewer.chainId}`, value: v });
  })
  const members =
    organizationMembers.length > 0 ? (
      <Select
        // className="!h-[43px] !bg-fillBg8 !border-fillBg16"
        // labelClassName="!text-desc12"
        value={organizationMembers[0]}
        className="w-full !h-[43px] !bg-fillBg8 !border-fillBg16"
        labelClassName="!max-w-[100%] !text-lightGrey text-ellipsis !text-[11px]"
        overlayItemClassName="text-ellipsis !text-[11px]"
        options={membersOptions}
      />
    ) : (
      "None"
    );
  return (
    <Switch>
      <Case condition={proposalType === proposalTypes.REFERENDUM}>
        <div className={clsx("flex flex-col", organizationCaseClass)}>
          <div className={clsx("mb-[20px]", organizationItemClass)}>
            <span className="card-list-desc-item-label mr-[6px]">Token:</span>
            <span className="card-list-desc-item-desc">{tokenSymbol}</span>
          </div>
          <div className={clsx("mb-[20px]", organizationItemClass)}>
            <span className="card-list-desc-item-label mr-[6px]">Members:</span>
            <span className="card-list-desc-item-desc">All Users</span>
          </div>
          <div className={clsx("mb-[10px]", organizationItemClass)}>
            <span className="card-list-desc-item-label mr-[6px]">Proposer White List:</span>
            <span className="card-list-desc-item-desc select">{proposerList}</span>
          </div>
        </div>
      </Case>
      <Case condition={proposalType === proposalTypes.PARLIAMENT}>
        <div className={clsx("flex flex-col", organizationCaseClass)}>
          <div className={clsx("mb-[20px]", organizationItemClass)}>
            <span className="card-list-desc-item-label mr-[6px]">Members:</span>
            <span className="card-list-desc-item-desc select">{members}</span>
          </div>
          <div className={clsx("mb-[10px]", organizationItemClass)}>
            <span className="card-list-desc-item-label mr-[6px]">Proposer White List:</span>
            <span className="card-list-desc-item-desc select">
              {proposerAuthorityRequired === false ? "All Users" : proposerList}
            </span>
          </div>
        </div>
      </Case>
      <Case condition={proposalType === proposalTypes.ASSOCIATION}>
        <div className={clsx("flex flex-col", organizationCaseClass)}>
          <div className={clsx("mb-[20px]", organizationItemClass)}>
            <span className="card-list-desc-item-label mr-[6px]">Members:</span>
            <span className="card-list-desc-item-desc select">{members}</span>
          </div>
          <div className={clsx("mb-[10px]", organizationItemClass)}>
            <span className="card-list-desc-item-label mr-[6px]">Proposer White List:</span>
            <span className="card-list-desc-item-desc select">{proposerList}</span>
          </div>
        </div>
      </Case>
    </Switch>
  );
}

const Organization = (props) => {
  const {
    proposalType,
    releaseThreshold,
    leftOrgInfo,
    orgAddress,
    creator,
    updatedAt,
    logStatus,
    bpList,
    editOrganization,
    parliamentProposerList,
    currentWallet,
  } = props;
  const votesData = useMemo(
    () =>
      getCircleValues(
        proposalType,
        releaseThreshold,
        leftOrgInfo,
        bpList.length
      ),
    [proposalType, releaseThreshold, leftOrgInfo]
  );
  const { isSideChain } = useChainSelect()
  // console.log("votesData", votesData);
  const leftOrg = useMemo(
    () =>
      getOrganizationLeftInfo(
        proposalType,
        leftOrgInfo,
        bpList,
        parliamentProposerList
      ),
    [leftOrgInfo, bpList, parliamentProposerList]
  );
  // eslint-disable-next-line max-len
  const canEdit = useMemo(
    () =>
      isProposer(
        logStatus,
        currentWallet.address,
        proposalType,
        leftOrgInfo,
        bpList,
        parliamentProposerList
      ),
    [logStatus, currentWallet]
  );
  const handleEdit = () => {
    editOrganization(orgAddress);
  };

  if (isPhoneCheck()) {
    return (
      <div className="organization-list-item gap-bottom">
        <Card title={<Title proposalType={proposalType} />}>
          <div className="organization-list-item-id">
            <div className="text-lightGrey text-[11px] font-Montserrat gap-right-large text-ellipsis">
              {addressFormat(orgAddress)}
            </div>
            {canEdit ? (
              <i className="tmrwdao-icon-edit cursor-pointer !text-lightGrey" onClick={handleEdit}  />
            ) : null}
          </div>
          <Divider className="bg-borderColor my-[20px]" />
          <div className="organization-list-item-info">
            <div className="organization-list-item-info-item">
              <span className="sub-title gap-right text-white !text-[11px] !font-medium">Author:</span>
              <span className="text-ellipsis">
                <a
                  href={`${isSideChain ? explorer : mainExplorer}/address/${addressFormat(creator)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondaryMainColor !text-[11px] font-Montserrat"
                >
                  {addressFormat(creator)}
                </a>
              </span>
            </div>
            <div className="organization-list-item-info-item flex items-center justify-start">
              <span className="sub-title gap-right !text-[11px] !font-medium">Update Time:</span>
              <span className="text-ellipsis text-[11px] text-lightGrey font-Montserrat">
                {moment(updatedAt).format("YYYY/MM/DD HH:mm:ss")}
              </span>
            </div>
          </div>
          <Divider className="bg-borderColor my-[20px]" />
          <div className="organization-list-item-votes">
            <p className="text-white font-medium font-Montserrat text-xs !mb-[20px]">Voting Data: Votes (Votes / Minimum Votes)</p>
            <Row gutter={16} className="organization-list-item-vote-chart">
              <Col span={8} offset={2}>
                <Circle
                  className="organization-list-item-vote-chart-circle"
                  type={proposalActions.APPROVE}
                  text={votesData[proposalActions.APPROVE].rate}
                  {...votesData[proposalActions.APPROVE]}
                />
              </Col>
              <Col span={8} offset={4}>
                <Circle
                  className="organization-list-item-vote-chart-circle"
                  type={proposalActions.REJECT}
                  text={votesData[proposalActions.REJECT].rate}
                  {...votesData[proposalActions.REJECT]}
                />
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <div className="organization-list-item-vote-desc text-center">
                  <div className="text-ellipsis text-white text-[11px] font-Montserrat font-medium" title="Approved Votes">
                    Approved Votes
                  </div>
                  <div
                    className="text-ellipsis"
                    title={`${votesData[proposalActions.APPROVE].num}(${
                      votesData[proposalActions.APPROVE].rate
                    })`}
                  >
                    <div className="text-white font-Montserrat font-light">
                      {votesData[proposalActions.APPROVE].num}
                    </div>
                    {/* <div className="text-[10px] text-lightGrey font-Montserrat">{votesData[proposalActions.APPROVE].rate}</div> */}
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div className="organization-list-item-vote-desc text-center">
                  <div className="text-ellipsis text-white text-[11px] font-Montserrat font-medium" title="Rejected Votes">
                    Rejected Votes
                  </div>
                  <div
                    className="text-ellipsis"
                    title={`${votesData[proposalActions.REJECT].num}(${
                      votesData[proposalActions.REJECT].rate
                    })`}
                  >
                    <div className="text-white font-Montserrat font-light">
                      {votesData[proposalActions.REJECT].num}
                    </div>
                    {/* <div className="text-[10px] text-lightGrey font-Montserrat">{votesData[proposalActions.REJECT].rate}</div> */}
                  </div>
                </div>
              </Col>
            </Row>
            <Row gutter={16} className="organization-list-item-vote-chart">
              <Col span={8} offset={2}>
                <Circle
                  className="organization-list-item-vote-chart-circle"
                  type={proposalActions.ABSTAIN}
                  text={votesData[proposalActions.ABSTAIN].rate}
                  {...votesData[proposalActions.ABSTAIN]}
                />
              </Col>
              <Col span={8} offset={4}>
                <Circle
                  className="organization-list-item-vote-chart-circle"
                  type="Total"
                  text={votesData.Total.rate}
                  {...votesData.Total}
                />
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <div className="organization-list-item-vote-desc text-center">
                  <div className="text-ellipsis text-white text-[11px] font-Montserrat font-medium" title="Abstained Votes">
                    Abstained Votes
                  </div>
                  <div
                    className="text-ellipsis"
                    title={`${votesData[proposalActions.ABSTAIN].num}(${
                      votesData[proposalActions.ABSTAIN].rate
                    })`}
                  >
                    <div className="text-white font-Montserrat font-light">
                      {votesData[proposalActions.ABSTAIN].num}
                    </div>
                    {/* <div className="text-[10px] text-lightGrey font-Montserrat">{votesData[proposalActions.ABSTAIN].rate}</div> */}
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div className="organization-list-item-vote-desc text-center">
                  <div className="text-ellipsis text-white text-[11px] font-Montserrat font-medium" title="Total Votes">
                    Total Votes
                  </div>
                  <div
                    className="text-ellipsis"
                    title={`${votesData.Total.num}(${votesData.Total.rate})`}
                  >
                    <div className="text-white font-Montserrat font-light">
                      {votesData.Total.num}
                    </div>
                    {/* <div className="text-[10px] text-lightGrey font-Montserrat">{votesData.Total.rate}</div> */}
                  </div>
                </div>
              </Col>
            </Row>
          </div>
          <Divider className="bg-borderColor my-[20px]" />
          <div className="organization-list-item-extra">{leftOrg}</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="organization-list-item gap-bottom">
      <Card title={<Title proposalType={proposalType} />}>
        <div className="organization-list-item-id">
          <div className="text-lightGrey text-[11px] font-Montserrat gap-right-large text-ellipsis">
            {addressFormat(orgAddress)}
          </div>
          {canEdit ? (
            <i className="tmrwdao-icon-edit cursor-pointer !text-lightGrey" onClick={handleEdit}  />
          ) : null}
        </div>
        <Divider className="bg-borderColor my-[20px]" />
        <div className="organization-list-item-info">
          <div className="organization-list-item-info-item">
            <span className="sub-title gap-right text-white !text-[11px] font-medium">Author:</span>
            <span className="text-ellipsis">
              <a
                href={`${isSideChain ? explorer : mainExplorer}/address/${addressFormat(creator)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondaryMainColor text-[11px] font-Montserrat"
              >
                {addressFormat(creator)}
              </a>
            </span>
          </div>
          <div className="organization-list-item-info-item flex items-center justify-start">
            <span className="sub-title gap-right !text-[11px] font-medium">Update Time:</span>
            <span className="text-ellipsis text-[11px] text-lightGrey font-Montserrat">
              {moment(updatedAt).format("YYYY/MM/DD HH:mm:ss")}
            </span>
          </div>
        </div>
        <Divider className="bg-borderColor my-[20px]" />
        <div className="organization-list-item-votes">
          <p className="text-white font-medium font-Montserrat text-xs !mb-[20px]">Voting Data: Votes (Votes / Minimum Votes)</p>
          <Row gutter={24} className="organization-list-item-vote-chart">
            <Col span={6}>
              <Circle
                className="organization-list-item-vote-chart-circle"
                type={proposalActions.APPROVE}
                text={votesData[proposalActions.APPROVE].rate}
                {...votesData[proposalActions.APPROVE]}
              />
            </Col>
            <Col span={6}>
              <Circle
                className="organization-list-item-vote-chart-circle"
                type={proposalActions.REJECT}
                text={votesData[proposalActions.REJECT].rate}
                {...votesData[proposalActions.REJECT]}
              />
            </Col>
            <Col span={6}>
              <Circle
                className="organization-list-item-vote-chart-circle"
                type={proposalActions.ABSTAIN}
                text={votesData[proposalActions.ABSTAIN].rate}
                {...votesData[proposalActions.ABSTAIN]}
              />
            </Col>
            <Col span={6}>
              <Circle
                className="organization-list-item-vote-chart-circle"
                type="Total"
                text={votesData.Total.rate}
                {...votesData.Total}
              />
            </Col>
          </Row>
          <Row gutter={24} className="mt-[10px]">
            <Col span={6}>
              <div className="organization-list-item-vote-desc text-center">
                <div className="text-ellipsis text-white text-[11px] font-Montserrat font-medium" title="Approved Votes">
                  Approved Votes
                </div>
                <div
                  className="text-ellipsis"
                  title={`${votesData[proposalActions.APPROVE].num}(${
                    votesData[proposalActions.APPROVE].rate
                  })`}
                >
                  <div className="text-white font-Montserrat font-light">
                    {votesData[proposalActions.APPROVE].num}
                  </div>
                  {/* <div className="text-[10px] text-lightGrey font-Montserrat">{votesData[proposalActions.APPROVE].rate}</div> */}
                </div>
              </div>
            </Col>
            <Col span={6}>
              <div className="organization-list-item-vote-desc text-center">
                <div className="text-ellipsis text-white text-[11px] font-Montserrat font-medium" title="Rejected Votes">
                  Rejected Votes
                </div>
                <div
                  className="text-ellipsis"
                  title={`${votesData[proposalActions.REJECT].num}(${
                    votesData[proposalActions.REJECT].rate
                  })`}
                >
                  <div className="text-white font-Montserrat font-light">
                    {votesData[proposalActions.REJECT].num}
                  </div>
                  {/* <div className="text-[10px] text-lightGrey font-Montserrat">{votesData[proposalActions.REJECT].rate}</div> */}
                </div>
              </div>
            </Col>
            <Col span={6}>
              <div className="organization-list-item-vote-desc text-center">
                <div className="text-ellipsis text-white text-[11px] font-Montserrat font-medium" title="Abstained Votes">
                  Abstained Votes
                </div>
                <div
                  className="text-ellipsis"
                  title={`${votesData[proposalActions.ABSTAIN].num}(${
                    votesData[proposalActions.ABSTAIN].rate
                  })`}
                >
                  <div className="text-white font-Montserrat font-light">
                    {votesData[proposalActions.ABSTAIN].num}
                  </div>
                  {/* <div className="text-[10px] text-lightGrey font-Montserrat">{votesData[proposalActions.ABSTAIN].rate}</div> */}
                </div>
              </div>
            </Col>
            <Col span={6}>
              <div className="organization-list-item-vote-desc text-center">
                <div className="text-ellipsis text-white text-[11px] font-Montserrat font-medium" title="Total Votes">
                  Total Votes
                </div>
                <div
                  className="text-ellipsis"
                  title={`${votesData.Total.num}(${votesData.Total.rate})`}
                >
                  <div className="text-white font-Montserrat font-light">
                    {votesData.Total.num}
                  </div>
                  {/* <div className="text-[10px] text-lightGrey font-Montserrat">{votesData.Total.rate}</div> */}
                </div>
              </div>
            </Col>
          </Row>
        </div>
        <Divider className="bg-borderColor my-[20px]" />
        <div className="organization-list-item-extra">{leftOrg}</div>
      </Card>
    </div>
  );
};

Organization.propTypes = {
  ...organizationInfoPropTypes,
  logStatus: PropTypes.oneOf(Object.values(LOG_STATUS)).isRequired,
  bpList: PropTypes.arrayOf(PropTypes.string).isRequired,
  editOrganization: PropTypes.func.isRequired,
  parliamentProposerList: PropTypes.arrayOf(PropTypes.string).isRequired,
  currentWallet: PropTypes.shape({
    address: PropTypes.string,
    publicKey: PropTypes.string,
  }).isRequired,
};

export default Organization;
