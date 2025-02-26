import React, { useEffect, useRef, useState } from "react";
import { Switch, Case, If, Then } from "react-if";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import {
  Spin,
  Empty,
  Result,
} from "antd";
import Row from 'components/Grid/Row';
import Col from 'components/Grid/Col';
import { useEffectOnce } from "react-use";
import { useConnectWallet } from "@aelf-web-login/wallet-adapter-react";
import Select from 'components/Select';
import Input from 'components/Input';
import Checkbox from 'components/Checkbox';
import constants, {
  API_PATH,
  LOADING_STATUS,
  LOG_STATUS,
} from "@redux/common/constants";
import Proposal from "./Proposal";
import { getProposals } from "@redux/actions/proposalList";
import ApproveTokenModal from "../_proposal_root/components/ApproveTokenModal";
import "./index.css";
import {
  getContractAddress,
  sendTransactionWith,
} from "@redux/common/utils";
import { removePrefixOrSuffix, sendHeight } from "@common/utils";
import removeHash from "@utils/removeHash";
import { request } from "@common/request";
import { GET_PROPOSALS_LIST } from "@redux/actions/proposalList";
import { debounce } from "lodash";
import { eventBus } from "utils/myEvent";
import Segmented from 'components/Segmented';
import Pagination from "components/Pagination";

const handleStatusChangeEvent = 'handleStatusChange';
const handleSearchChangeEvent = 'handleSearchChange';
const { proposalTypes, proposalStatus } = constants;
const keyFromHash = {
  "#association": proposalTypes.ASSOCIATION,
  "#referendum": proposalTypes.REFERENDUM,
};

const ProposalList = () => {
  const common = useSelector((state) => state.common, shallowEqual);
  const proposalList = useSelector((state) => state.proposals, shallowEqual);
  const [proposalInfo, setProposalInfo] = useState({
    tokenSymbol: "ELF",
    action: "Approve",
    visible: false,
  });
  const { bpCount, params, total, list, status: loadingStatus } = proposalList;
  const { aelf, logStatus, isALLSettle, wallet, currentWallet } = common;
  const dispatch = useDispatch();
  const handleStatusChangeRef = useRef()
  const handleSearchChangeRef = useRef()
  
  const [activeKey, setActiveKey] = useState();
  const [loading, setLoading] = useState({
    Release: {},
    Approve: {},
    Reject: {},
    Abstain: {},
  });
  const currentActiveKeyRef = useRef();
  currentActiveKeyRef.current = activeKey;

  const { callSendMethod: callContract } = useConnectWallet();

  useEffect(() => {
    sendHeight(500);
  }, [list]);

  const fetchList = async (param) => {
    let newParams = {
      ...param,
    };
    delete newParams.address;
    if (logStatus === LOG_STATUS.LOGGED) {
      newParams = {
        ...newParams,
        address: currentWallet.address,
      };
    }
    if (currentActiveKeyRef.current !== newParams.proposalType) {
      return;
    }
    dispatch(getProposals(newParams));
  };
  useEffect(() => {
    if (isALLSettle === true) {
      fetchList(params);
    }
  }, [isALLSettle, logStatus]);



  const onPageNumChange = (pageNum) =>
    fetchList({
      ...params,
      pageNum,
    });

  const onPageSizeChange = (pageSize) =>
    fetchList({
      ...params,
      pageSize,
      pageNum: 1,
    });

  const onSearch = async (value) => {
    await fetchList({
      ...params,
      pageNum: 1,
      search: removePrefixOrSuffix((value || "").trim()),
    });
  };
  

  const handleStatusChange = (value) =>
    fetchList({
      ...params,
      pageNum: 1,
      status: value,
    });
  handleSearchChangeRef.current = onSearch;
  handleStatusChangeRef.current = handleStatusChange;

  const handleContractFilter = (checked) => {
    fetchList({
      ...params,
      pageNum: 1,
      isContract: checked ? 1 : 0,
    });
  };
  const handleTabChange = (key) => {
    if (key === proposalTypes.PARLIAMENT) {
      removeHash();
      setActiveKey(proposalTypes.PARLIAMENT);
    } else {
      const index = Object.values(keyFromHash).findIndex((ele) => ele === key);
      window.location.hash = Object.keys(keyFromHash)[index];
    }
  };
  useEffect(() => {
    if (!activeKey) return;
    fetchList({
      ...params,
      pageNum: 1,
      proposalType: activeKey,
      status: proposalStatus.ALL,
      isContract: 0,
      search: "",
    });
  }, [activeKey]);
  const changeKey = () => {
    const { hash } = window.location;
    const key = keyFromHash[hash];
    setActiveKey(key || proposalTypes.PARLIAMENT);
    return key || proposalTypes.PARLIAMENT;
  };
  window.addEventListener("hashchange", () => {
    changeKey();
  });
  useEffectOnce(() => {
    changeKey();
  });

  const send = async (id, action) => {
    setLoading({
      ...loading,
      [action]: {
        ...loading[action],
        [id]: true,
      },
    });
    if (params.proposalType === proposalTypes.REFERENDUM) {
      const [proposal] = list.filter((item) => item.proposalId === id);
      console.log(proposal);
      setProposalInfo({
        ...proposalInfo,
        tokenSymbol: proposal.organizationInfo.leftOrgInfo.tokenSymbol,
        action,
        proposalId: proposal.proposalId,
        visible: true,
      });
    } else {
      await sendTransactionWith(
        callContract,
        getContractAddress(params.proposalType),
        action,
        id
      );
    }
    setLoading({
      ...loading,
      [action]: {
        ...loading[action],
        [id]: false,
      },
    });
  };

  async function handleConfirm(action) {
    if (action) {
      // if (!webLoginWallet.accountInfoSync.syncCompleted) {
      //   showAccountInfoSyncingModal();
      //   return;
      // }
      await sendTransactionWith(
        callContract,
        getContractAddress(params.proposalType),
        action,
        proposalInfo.proposalId
      );
    }
    setProposalInfo({
      ...proposalInfo,
      visible: false,
    });
  }
  const updateVotedStatus = async (proposalId) => {
    const data = await request(
      API_PATH.GET_PROPOSAL_INFO,
      {
        address: currentWallet.address,
        proposalId,
      },
      { method: "GET" }
    );
    const votedStatus = data?.proposal?.votedStatus;
    dispatch({
      type: GET_PROPOSALS_LIST.GET_PROPOSALS_LIST_SUCCESS,
      payload: {
        ...proposalList,
        list: list.map((ele) => {
          if (ele.proposalId === proposalId) {
            ele.votedStatus = votedStatus;
          }
          return ele;
        }),
      },
    });
    return votedStatus;
  };
  const handleRelease = async (id) => {
    debounce(async () => {
      setLoading({
        ...loading,
        Release: {
          ...loading["Release"],
          [id]: true,
        },
      });
      await sendTransactionWith(
        callContract,
        getContractAddress(params.proposalType),
        "Release",
        id
      );
      setLoading({
        ...loading,
        Release: {
          ...loading["Release"],
          [id]: false,
        },
      });
    }, 200)();
  };

  const handleApprove = async (id) => {
    // update votedStatus
    debounce(async () => {
      const votedStatus = await updateVotedStatus(id);
      if (votedStatus === "none") {
        await send(id, "Approve");
      }
    }, 200)();
  };
  const handleReject = async (id) => {
    debounce(async () => {
      const votedStatus = await updateVotedStatus(id);
      if (votedStatus === "none") {
        await send(id, "Reject");
      }
    }, 200)();
  };
  const handleAbstain = async (id) => {
    debounce(async () => {
      const votedStatus = await updateVotedStatus(id);
      if (votedStatus === "none") {
        await send(id, "Abstain");
      }
    }, 200)();
  };
  useEffect(() => {
    const handleStatusChange = (value) => { 
      handleStatusChangeRef.current?.(value)
    }
    const handleSearchChange = (value) => {
      handleSearchChangeRef.current?.(value)
    }
    eventBus.on(handleStatusChangeEvent, handleStatusChange)
    eventBus.on(handleSearchChangeEvent, handleSearchChange)
    return () => {
      eventBus.off(handleStatusChangeEvent, handleStatusChange)
      eventBus.off(handleSearchChangeEvent, handleSearchChange)
    }
  }, [])

  return (
    <div className="proposal-list">
      <Segmented
        value={activeKey}
        options={[
          proposalTypes.PARLIAMENT,
          proposalTypes.ASSOCIATION,
          proposalTypes.REFERENDUM
        ]}
        onChange={handleTabChange}
        itemClassName="text-[11px]"
      />
      <div className="my-[26px]">
        {params.proposalType === proposalTypes.PARLIAMENT && (
          <Checkbox
            label={<span className="text-descM12 font-Montserrat text-white">Deploy/Update Contract Proposal</span>}
            uncheckedClassName="!bg-white !border-lightGrey !border-solid !border"
            onChange={handleContractFilter}
          />
        )}
      </div>
      <div className="mb-[26px]">
        <Switch>
          <Case
            condition={
              loadingStatus === LOADING_STATUS.LOADING ||
              loadingStatus === LOADING_STATUS.SUCCESS
            }
          >
            <Spin spinning={loadingStatus === LOADING_STATUS.LOADING}>
              <Row gutter={16}>
                {list.map((item) => (
                  <Col sm={24} md={12} key={item.proposalId}>
                    <Proposal
                      bpCount={bpCount}
                      {...item}
                      logStatus={logStatus}
                      currentAccount={currentWallet.address}
                      loading={loading}
                      handleRelease={handleRelease}
                      handleAbstain={handleAbstain}
                      handleApprove={handleApprove}
                      handleReject={handleReject}
                    />
                  </Col>
                ))}
              </Row>
            </Spin>
          </Case>
          <Case condition={loadingStatus === LOADING_STATUS.FAILED}>
            <Result
              status="error"
              title="Error Happened"
              subTitle="Please check your network"
            />
          </Case>
        </Switch>
        <If
          condition={
            loadingStatus === LOADING_STATUS.SUCCESS && list.length === 0
          }
        >
          <Then>
            <Empty />
          </Then>
        </If>
      </div>
      <Pagination
        total={total}
        current={params.pageNum}
        pageSize={params.pageSize || 10}
        hideOnSinglePage
        onChange={onPageNumChange}
        onPageSizeChange={onPageSizeChange}
      />
      {proposalInfo.visible ? (
        <ApproveTokenModal
          aelf={aelf}
          {...proposalInfo}
          onCancel={handleConfirm}
          onConfirm={handleConfirm}
          wallet={wallet}
          owner={currentWallet.address}
        />
      ) : null}
    </div>
  );
};
const ExplorerProposalListFilter = () => {
  const proposalList = useSelector((state) => state.proposals, shallowEqual);
  const { params } = proposalList;
  const handleStatusChange = (value) => {
    eventBus.emit(handleStatusChangeEvent, value)
  }
  const onSearch = (e) => {
    eventBus.emit(handleSearchChangeEvent, e?.target?.value)
  }
  const [searchValue, setSearchValue] = useState(params.search);
  useEffect(() => {
    setSearchValue(params.search);
  }, [params.search]);
  return <div className="flex flex-col md:flex-row gap-2 md:gap-5">
    <Select
      className="md:w-[132px] w-full"
      value={params.status}
      options={[
        { label: 'All', value: proposalStatus.ALL },
        { label: 'Pending', value: proposalStatus.PENDING },
        { label: 'Approved', value: proposalStatus.APPROVED },
        { label: 'Released', value: proposalStatus.RELEASED },
        { label: 'Expired', value: proposalStatus.EXPIRED } 
      ]}
      onChange={(option) => handleStatusChange(option.value)}
    />
    <Input
      placeholder="Proposal ID/Contract Address/Proposer"
      prefix={
        <i className="tmrwdao-icon-search text-[20px] text-inherit" />
      }
      defaultValue={params.search}
      showClearBtn
      value={searchValue}
      onChange={setSearchValue}
      onPressEnter={onSearch}
      inputSize={'small'}
    />
  </div>
}
export default React.memo(ProposalList);
export {
  ExplorerProposalListFilter
}
