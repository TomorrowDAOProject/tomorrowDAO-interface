"use client";
// eslint-disable-next-line no-use-before-define
import React, { useState, useEffect, useMemo } from "react";
import moment from "moment";
import PropTypes from "prop-types";
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation'
import Button from "components/Button";
import Divider from "components/Divider";
import Result from "components/Result";
import Card from 'components/Card';
import Tabs from "components/Tabs";
import Text from 'components/Text';
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
import VoteData from "./VoteData/index.jsx";
import VoteDetail from "./VoteDetail/index.jsx";
import OrganizationCard from "./OrganizationCard/index.jsx";
import ContractDetail from "./ContractDetail/index.jsx";
import config from "@common/config";
import "./index.css";
import { getContractAddress, sendTransactionWith } from "@redux/common/utils";
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
import { fetchURLDescription } from "api/request";
import Tag from "components/Tag";
import { shortenFileName } from "utils/file";
import { apiServer } from "api/axios";
const {
  proposalActions,
} = constants;

const { viewer } = config;

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
  const chain = getChainIdQuery()
  return apiServer.get(
    API_PATH.GET_PROPOSAL_INFO,
    {
      address: currentWallet.address,
      proposalId,
      chainId: chain.chainId
    }
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
    <span className="ml-[32px] font-Montserrat text-descM10 text-lightGrey">{`Expire ${now.to(expired)}`}</span>
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
    <div className="flex items-center gap-2 ml-2">
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
      .then((res) => {

        const result = res?.data;
        result.organization.leftOrgInfo = result.organization.networkDaoOrgLeftOrgInfoDto;

        result.proposal.status = result.proposal.status.toLowerCase();

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

  const leftOrgInfo = info?.organization?.networkDaoOrgLeftOrgInfoDto

  const { callSendMethod: callContract } = useConnectWallet()
  const { isSideChain  } = useChainSelect()

  const bpCountNumber = useMemo(() => {
    // todo 1.4.0
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
    <>
      {info.loadingStatus === LOADING_STATUS.SUCCESS ? (
        <>
          <Card
            className="mb-[26px]"
            title={
              <>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <h2 className="font-Unbounded text-descM15 font-light -tracking-[0.6px] text-white">Proposal Detail</h2>
                    <p className="ml-[4px] md:block hidden"><CountDown time={expiredTime} status={status} /></p>
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
                <p className="ml-[4px] mt-4 md:hidden text-right"><CountDown time={expiredTime} status={status} /></p>
              </>
            }
          >
            <>
              {
                networkDaoProposalDetail?.data?.title && (
                  <h3 className="mb-2 font-Unbounded text-[15px] text-white font-light -tracking-[0.6px]">{networkDaoProposalDetail?.data?.title}</h3>
                )
              }
              <span className="flex flex-col md:flex-row mb-[15px] font-Montserrat text-desc15 text-white">
                <span className="whitespace-nowrap">Proposal ID:</span>
                <span className="max-w-full text-ellipsis whitespace-nowrap">{proposalId}</span>
              </span>
              <div className="flex gap-x-2">
                <Tag color="default" className="gap-right">
                  {proposalType}
                </Tag>
                {CONTRACT_TEXT_MAP[contractMethod] ? (
                  <Tag color="default">
                    {CONTRACT_TEXT_MAP[contractMethod]}
                  </Tag>
                ) : null}
              </div>
              <Divider className="my-[15px]" />
              <div className="flex flex-wrap justify-between gap-y-[14px]">
                <div  className="flex items-center gap-[5px] basics-full md:basics-1/2 lg:basics-1/3 xl:basics-1/4">
                  <span className="text-desc13 text-lightGrey font-Montserrat">
                    Application Submitted:
                  </span>
                  <span className="text-desc13 text-white font-Montserrat">
                    {moment(createAt).format("YYYY/MM/DD HH:mm:ss")}
                  </span>
                </div>
                <div  className="flex items-center gap-[5px] basics-full md:basics-1/2 lg:basics-1/3 xl:basics-1/4">
                  <span className="text-desc13 text-lightGrey font-Montserrat">Proposal Expires:</span>
                  <span className="text-desc13 text-white font-Montserrat">
                    {moment(expiredTime).format("YYYY/MM/DD HH:mm:ss")}
                  </span>
                </div>
                <div  className="flex items-center gap-[5px] basics-full md:basics-1/2 lg:basics-1/3 xl:basics-1/4">
                  <span className="text-desc13 text-lightGrey font-Montserrat">Proposer:</span>
                  <span className="text-desc13 text-white font-Montserrat">
                    <a
                      href={`${isSideChain ? explorer : mainExplorer}/address/${addressFormat(proposer)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`ELF_${proposer}_${viewer.chainId}`}
                    >
                      <Text textClassName="!text-white !text-desc13" content={`ELF_${proposer}_${viewer.chainId}`} isAddress shortAddress />
                    </a>
                  
                  </span>
                </div>

                {status === proposalStatus.RELEASED ? (
                  <div  className="flex items-center gap-[5px] basics-full md:basics-1/2 lg:basics-1/3 xl:basics-1/4">
                    <span className="text-desc13 text-lightGrey font-Montserrat">
                      Proposal Released:
                    </span>
                    <span className="text-desc13 text-white font-Montserrat">
                      {moment(releasedTime).format("YYYY/MM/DD HH:mm:ss")}
                    </span>
                  </div>
                ) : null}
              </div>
            </>
          </Card>

          <div className="mt-[26px] border border-fillBg18 border-solid bg-darkBg rounded-[10px]">
            <Tabs
              activeKey={activeKey}
              onChange={changeTab}
              items={[
                {
                  key: 'proposal',
                  label: 'Proposal Details',
                  children: (
                    <div className="py-6 px-[22px] md:px-[38px]">
                      {/* {leftInfo?.description && (
                        <div className="proposal-detail-tab-description">
                          <h2>Description</h2>
                          <p className="description-card">{leftInfo?.description}</p>
                        </div>
                      )} */}
                      <VoteData
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
                      <Divider className="my-[30px]" />
                      <OrganizationCard
                        bpList={info.bpList}
                        bpCount={bpCountNumber}
                        parliamentProposerList={info.parliamentProposerList}
                        {...info.organization}
                      />
                      <Divider className="my-[30px]" />
                      <ContractDetail
                        aelf={aelf}
                        contractAddress={contractAddress}
                        contractMethod={contractMethod}
                        contractParams={contractParams}
                        createdBy={createdBy}
                      />
                      {existUrl && (
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
                      )}
                    </div>
                  ),
                },
                {
                  key: 'vote',
                  label: 'Voting Details',
                  children: (
                    <VoteDetail
                      proposalType={proposalType}
                      proposalId={proposalId}
                      logStatus={logStatus}
                      expiredTime={expiredTime}
                      status={status}
                      currentWallet={currentWallet}
                      wallet={wallet}
                      symbol={leftOrgInfo?.tokenSymbol??"ELF"}
                    />
                  ),
                },
              ]}
            />
            {visible ? (
              <ApproveTokenModal
                aelf={aelf}
                {...info.proposal}
                action={visible}
                tokenSymbol={leftOrgInfo?.tokenSymbol??"ELF"}
                onCancel={handleConfirm}
                onConfirm={handleConfirm}
                wallet={wallet}
                proposalId={proposalId}
                owner={currentWallet.address}
                visible={!!visible}
              />
            ) : null}
          </div>
        </>
      ) : null}
      {info.loadingStatus === LOADING_STATUS.FAILED ? (
        <Result
          status="error"
          title="Error Happened"
          subTitle="Please check your network"
        />
      ) : null}
    </>
  );
};

export default ProposalDetail;