"use client";
// eslint-disable-next-line no-use-before-define
import React, { useState, useEffect, useMemo } from "react";
import moment from "moment";
import PropTypes from "prop-types";
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import {
  Button,
  Divider,
  Skeleton,
  Result,
  Tabs,
  Typography,
  Card
} from "antd";
import { useSelector } from "react-redux";
import { useConnectWallet } from "@aelf-web-login/wallet-adapter-react";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import constants, {
  ACTIONS_COLOR_MAP,
  API_PATH,
  CONTRACT_TEXT_MAP,
  LOADING_STATUS,
  LOG_STATUS,
  STATUS_COLOR_MAP,
  PROPOSAL_STATUS_CAPITAL,
} from "@redux/common/constants";
import { request } from "@common/request";
import VoteData from "./VoteData/index.jsx";
import VoteDetail from "./VoteDetail/index.jsx";
import OrganizationCard from "./OrganizationCard/index.jsx";
import ContractDetail from "./ContractDetail/index.jsx";
import config from "@common/config";
import "./index.css";
import { getContractAddress, sendTransactionWith } from "@reduxp/common/utils";
import ApproveTokenModal from "../../_proposal_root/components/ApproveTokenModal/index.jsx";
import {
  getBPCount,
  sendHeight,
  validateURL,
} from "@common/utils";
import removeHash from "@utils/removeHash";
import addressFormat from "@utils/addressFormat";
import { NETWORK_TYPE } from '@config/config';
import { explorer, mainExplorer } from "config";
import { useChainSelect } from "hooks/useChainSelect";
import { fetchNetworkDaoProposaDetail } from "api/request";
import { useRequest } from "ahooks";
import getChainIdQuery from "utils/url";
import { HashAddress } from "aelf-design";
import { fetchURLDescription } from "api/request";
import Tag from "@components/Tag";
const {
  proposalActions,
} = constants;

const { viewer } = config;
const { Title } = Typography;

const { TabPane } = Tabs;

const { proposalTypes, proposalStatus } = constants;

export const ACTIONS_ICON_MAP = {
  [proposalActions.APPROVE]: (
    <CheckCircleOutlined className="gap-right-small" />
  ),
  [proposalActions.REJECT]: <CloseCircleOutlined className="gap-right-small" />,
  [proposalActions.ABSTAIN]: (
    <MinusCircleOutlined className="gap-right-small" />
  ),
};
async function getData(currentWallet, proposalId) {
  return request(
    API_PATH.GET_PROPOSAL_INFO,
    {
      address: currentWallet.address,
      proposalId,
    },
    { method: "GET" }
  );
}

function CountDown(props) {
  const { time, status } = props;
  if (!time) {
    return null;
  }
  const now = moment();
  const threshold = moment().add(3, "days");
  const expired = moment(time);
  const show =
    status !== proposalStatus.RELEASED &&
    expired.isAfter(now) &&
    expired.isBefore(threshold);
  return show ? (
    <span className="warning-text">{`Expire ${now.to(expired)}`}</span>
  ) : null;
}

CountDown.propTypes = {
  time: PropTypes.string,
  status: PropTypes.oneOf(Object.values(proposalStatus)).isRequired,
};

CountDown.defaultProps = {
  time: "",
};

function Extra(props) {
  const { status, logStatus, currentWallet, proposer, handleRelease } = props;
  const canRelease =
    logStatus === LOG_STATUS.LOGGED &&
    currentWallet &&
    proposer === currentWallet.address;
  return (
    <div className="proposal-list-item-id-status">
      <Tag color={STATUS_COLOR_MAP[status]}>
        {PROPOSAL_STATUS_CAPITAL[status]}
      </Tag>
      {status === proposalStatus.APPROVED && canRelease ? (
        // eslint-disable-next-line max-len
        <Button type="link" size="small" onClick={handleRelease}>
          Release&gt;
        </Button>
      ) : null}
    </div>
  );
}

Extra.propTypes = {
  currentWallet: PropTypes.shape({
    address: PropTypes.string,
    publicKey: PropTypes.string,
  }).isRequired,
  status: PropTypes.oneOf(Object.values(proposalStatus)).isRequired,
  logStatus: PropTypes.oneOf(Object.values(LOG_STATUS)).isRequired,
  proposer: PropTypes.string.isRequired,
  handleRelease: PropTypes.func.isRequired,
};

const ProposalDetail = () => {
  const searchParams = useSearchParams();
  const { proposalId } = useParams();
  const navigate = useRouter();
  const location = window.location;
  const common = useSelector((state) => state.common);
  const [visible, setVisible] = useState(false);
  const [activeKey, setActiveKey] = useState("proposal");
  const { logStatus, aelf, wallet, currentWallet, isALLSettle } = common;
  const [info, setInfo] = useState({
    proposal: {},
    organization: {},
    bpList: [],
    parliamentProposerList: [],
    tab: "proposal",
    loadingStatus: LOADING_STATUS.LOADING,
  });
  const { data: networkDaoProposalDetail } = useRequest(() => {
    const chain = getChainIdQuery()
    console.log('get fetchNetworkDaoProposaDetail', proposalId)
    return fetchNetworkDaoProposaDetail({
      chainId: chain.chainId,
      proposalId
    })
  })
  
  const { data: forumUrlDetail, run: getForumUrlDetail } = useRequest((forumUrl) => {
  const chain = getChainIdQuery()
    return fetchURLDescription({
      chainId: chain.chainId,
      proposalId,
      forumUrl: forumUrl
    })
  }, {
    manual: true
  })
  if (!proposalId) {
    return <div>no data { proposalId}</div>;
  }
  useEffect(() => {
    if (location.hash === "#voting") {
      setActiveKey("vote");
    } else {
      setActiveKey("proposal");
    }
  }, [proposalId]);
  useEffect(() => {
    // todo 2 get proposal detail
    getData(currentWallet, proposalId)
      .then((result) => {
        setInfo({
          ...info,
          bpList: result.bpList,
          proposal: result.proposal,
          organization: result.organization,
          parliamentProposerList: result.parliamentProposerList,
          loadingStatus: LOADING_STATUS.SUCCESS,
        });
        if (result.proposal.leftInfo.proposalDescriptionUrl) {
          getForumUrlDetail(result.proposal.leftInfo.proposalDescriptionUrl)
        }
        sendHeight(800);
      })
      .catch((e) => {
        console.error(e);
        setInfo({
          ...info,
          loadingStatus: LOADING_STATUS.FAILED,
        });
      });
  }, [isALLSettle, proposalId, logStatus, getForumUrlDetail]);

  const {
    createAt,
    proposer,
    contractAddress,
    contractMethod,
    contractParams,
    expiredTime,
    approvals,
    rejections,
    abstentions,
    status,
    releasedTime,
    proposalType,
    canVote,
    votedStatus,
    createdBy,
    leftInfo,
  } = info.proposal;

  const { leftOrgInfo = {} } = info.organization;

  const { callSendMethod: callContract } = useConnectWallet()
  const { isSideChain  } = useChainSelect()

  const bpCountNumber = useMemo(() => {
    // todo 1.4.0
    console.log('NETWORK_TYPE', NETWORK_TYPE);
    if (NETWORK_TYPE === 'MAIN') {
      return getBPCount(status, expiredTime, releasedTime)
    }
    return info.bpList.length;
    
  }, [info.bpList, status, expiredTime, releasedTime, NETWORK_TYPE]);

  const send = async (action) => {
    if (proposalType === proposalTypes.REFERENDUM) {
      setVisible(action);
    } else {

      await sendTransactionWith(
        callContract,
        getContractAddress(proposalType),
        action,
        proposalId
      );
    }
  };

  function goBack() {
    navigate.goBack();
  }

  const handleApprove = async () => {
    await send("Approve");
  }

  const handleReject = async () => {
    await send("Reject");
  }

  const handleAbstain = async () => {
    await send("Abstain");
  }

  const handleRelease = async () => {
    await send("Release");
  }

  const handleConfirm = async (action)=>  {
    if (action) {
      await sendTransactionWith(
        callContract,
        getContractAddress(proposalType),
        action,
        proposalId
      );
    }
    setVisible(false);
  }

  const changeTab = (key) => {
    if (key === "proposal") {
      removeHash();
      setActiveKey("proposal");
    } else {
      window.location.hash = "voting";
    }
  };

  window.addEventListener("hashchange", () => {
    if (location.hash === "#voting") {
      setActiveKey("vote");
    } else {
      setActiveKey("proposal");
    }
  });
  const existUrl = validateURL(leftInfo?.proposalDescriptionUrl || "");

  return (
    <div className="proposal-detail">
      {info.loadingStatus === LOADING_STATUS.LOADING ? <Skeleton /> : null}      
      {info.loadingStatus === LOADING_STATUS.SUCCESS ? (
        <>
          <div className="page-content-bg-border unset-bottom-border lg:py-6 h-[78px]">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <h2 className="leading-[28px]">Proposal Detail</h2>
                <p className="ml-[4px]"><CountDown time={expiredTime} status={status} /></p>
               </div>
               <div className="flex">
                  {
                    votedStatus && votedStatus !== "none" ? (
                      <Tag  color={ACTIONS_COLOR_MAP[votedStatus]}>
                        {ACTIONS_ICON_MAP[votedStatus]}
                        {votedStatus}
                      </Tag>
                    ) : null
                  }
                  <Extra
                    {...info.proposal}
                          currentWallet={currentWallet}
                          logStatus={logStatus}
                    handleRelease={handleRelease}
                  />
                  </div>
            </div>
          </div>
          <div className="page-content-bg-border unset-top-border lg:py-6 mb-[24px]">
            {
              networkDaoProposalDetail?.data?.title && (
                <h3 className="card-title mb-[12px] break-all">{networkDaoProposalDetail?.data?.title}</h3>
              )
            }
            <div className="card-title-lg truncate mb-[12px]">
            Proposal ID:{proposalId}
            </div>
            <div className="proposal-detail-tag gap-bottom">
              <Tag color={'#FAFAFA'} className="gap-right">
                <span className="tag-font">
                  {proposalType}
                </span>
              </Tag>
              {CONTRACT_TEXT_MAP[contractMethod] ? (
                <Tag color={'#FAFAFA'}>
                  <span className="tag-font">
                  {CONTRACT_TEXT_MAP[contractMethod]}
                  </span>
                </Tag>
              ) : null}
            </div>
            <Divider />
            <div className="proposal-detail-desc-list overflow-hidden">
              <div className="proposal-key-value">
                <div  className="detail-flex items-center">
                  <span className="card-sm-text text-Neutral-Secondary-Text gap-right">
                    Application Submitted:
                  </span>
                  <span className="card-sm-text-black text-ellipsis">
                    {moment(createAt).format("YYYY/MM/DD HH:mm:ss")}
                  </span>
                </div>
                <div  className="detail-flex items-center">
                  <span className="card-sm-text text-Neutral-Secondary-Text gap-right">Proposal Expires:</span>
                  <span className="card-sm-text-black text-ellipsis">
                    {moment(expiredTime).format("YYYY/MM/DD HH:mm:ss")}
                  </span>
                </div>
                <div  className="detail-flex items-center">
                  <span className="card-sm-text text-Neutral-Secondary-Text gap-right">Proposer:</span>
                  <span className="card-sm-text-black text-ellipsis truncate">
                    <a
                      href={`${isSideChain ? explorer : mainExplorer}/address/${addressFormat(proposer)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`ELF_${proposer}_${viewer.chainId}`}
                    >
                       <HashAddress 
                        preLen={8}
                        endLen={11}
                        address={`ELF_${proposer}_${viewer.chainId}`}
                        />
                    </a>
                   
                  </span>
                </div>

                {status === proposalStatus.RELEASED ? (
                  <div  className="detail-flex items-center">
                    <span className="card-sm-text text-Neutral-Secondary-Text gap-right">
                      Proposal Released:
                    </span>
                    <span className="card-sm-text-black text-ellipsis">
                      {moment(releasedTime).format("YYYY/MM/DD HH:mm:ss")}
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          <Tabs
            className="proposal-detail-tab"
            activeKey={activeKey}
            onTabClick={(key) => changeTab(key)}
          >
            <TabPane tab="Proposal Details" key="proposal">
              <div className="px-[16px] lg:px-[32px] pb-[40px]">
                {
                  leftInfo?.description && (
                    <div className="proposal-detail-tab-description">
                      <h2>Description</h2>
                      <p className="description-card">
                        {leftInfo?.description}
                      </p>
                    </div>
                  )
                }

                <VoteData
                  className="gap-top-large"
                  proposalType={proposalType}
                  expiredTime={expiredTime}
                  status={status}
                  approvals={approvals}
                  rejections={rejections}
                  abstentions={abstentions}
                  canVote={canVote}
                  votedStatus={votedStatus}
                  bpCount={bpCountNumber}
                  handleApprove={handleApprove}
                  handleReject={handleReject}
                  handleAbstain={handleAbstain}
                  organization={info.organization}
                />
                 <Divider />
                <OrganizationCard
                  className="gap-top-large proposal-detail-org"
                  bpList={info.bpList}
                  bpCount={bpCountNumber}
                  parliamentProposerList={info.parliamentProposerList}
                  {...info.organization}
                />
                 <Divider />
                <ContractDetail
                  className="gap-top-large contract-detail"
                  aelf={aelf}
                  contractAddress={contractAddress}
                  contractMethod={contractMethod}
                  contractParams={contractParams}
                  createdBy={createdBy}
                />
                {
                  existUrl && 
                  <>
                  <Divider />
                  <div className="link-preview">
                    <h2 className="normal-text-bold">Discussion</h2>
                    {
                      !forumUrlDetail?.data?.title ? <Link href={leftInfo.proposalDescriptionUrl ?? ''} target="_blank">
                        {leftInfo.proposalDescriptionUrl}
                      </Link> : 
                      <Link href={leftInfo.proposalDescriptionUrl ?? ''} target="_blank">
                      <div className="link-preview-content">
                        {
                          forumUrlDetail?.data?.favicon ? 
                          <img className="icon" src={forumUrlDetail.data.favicon} alt="" /> :
                          <div className="icon text">{forumUrlDetail.data?.title?.[0] ?? "T"}</div>
                        }
                        <div className="link-preview-info">
                          <h3 className="break-words">{forumUrlDetail.data?.title}</h3>
                          <p className="break-words link-preview-info-description">{forumUrlDetail.data?.description}</p>
                        </div>
                      </div>
                      </Link>
                    }
                </div>
                </>
                }
              </div>
            </TabPane>
            <TabPane tab="Voting Details" key="vote">
              <div className="px-[16px] lg:px-[32px]">
                <VoteDetail
                  proposalType={proposalType}
                  proposalId={proposalId}
                  logStatus={logStatus}
                  expiredTime={expiredTime}
                  status={status}
                  currentWallet={currentWallet}
                  wallet={wallet}
                  symbol={leftOrgInfo.tokenSymbol || "ELF"}
                  />
                </div>
            </TabPane>
          </Tabs>
          {visible ? (
            <ApproveTokenModal
              aelf={aelf}
              {...info.proposal}
              action={visible}
              tokenSymbol={leftOrgInfo.tokenSymbol || "ELF"}
              onCancel={handleConfirm}
              onConfirm={handleConfirm}
              wallet={wallet}
              proposalId={proposalId}
              owner={currentWallet.address}
              visible={!!visible}
            />
          ) : null}
        </>
      ) : null}
      {info.loadingStatus === LOADING_STATUS.FAILED ? (
        <Result
          status="error"
          title="Error Happened"
          subTitle="Please check your network"
        />
      ) : null}
    </div>
  );
};

export default ProposalDetail;