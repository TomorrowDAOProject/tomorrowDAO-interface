/* eslint-disable react/jsx-no-bind */
/**
 * @file vote detail
 * @author atom-yang
 */
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Table, ConfigProvider } from "antd";
import Input from "components/Input";
import Button from "components/Button";
import Tag from "components/Tag";
import NoData from 'components/NoData';
import Pagination from "components/Pagination";
import Decimal from "decimal.js";
import moment from "moment";
import { If, Then } from "react-if";
import { useConnectWallet } from "@aelf-web-login/wallet-adapter-react";
import config from "@common/config";
import { request } from "@common/request";
import Total from "@components/Total";
import constants, {
  API_PATH,
  LOG_STATUS,
  LOADING_STATUS,
  ACTIONS_COLOR_MAP,
} from "@redux/common/constants";
import {
  getContractAddress,
  sendTransactionWith,
} from "@redux/common/utils";
import "./index.css";
import { removePrefixOrSuffix } from "@common/utils";
import TableLayer from "@components/TableLayer/TableLayer";
import addressFormat from "@utils/addressFormat";
import { isSideChainByQueryParams } from 'utils/chain'
import { explorer, mainExplorer } from "config";
import { toast } from "react-toastify";

const { viewer } = config;

const { proposalTypes, proposalStatus } = constants;

function getList(params) {
  return request(API_PATH.GET_VOTED_LIST, params, { method: "GET" });
}

async function getPersonalVote(params) {
  return request(
    API_PATH.GET_PERSONAL_VOTED_LIST,
    {
      ...params,
    },
    { method: "GET" }
  );
}
const isSideChain = isSideChainByQueryParams();
const listColumn = [
  {
    title: "Voter",
    dataIndex: "voter",
    key: "voter",
    ellipsis: true,
    width: 300,
    render: (voter) => (
      <a
        className="text-descM12 font-Montserrat text-secondaryMainColor hover:text-mainColor"
        href={`${isSideChain ? explorer : mainExplorer}/address/${addressFormat(voter)}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {`ELF_${voter}_${viewer.chainId}`}
      </a>
    ),
  },
  {
    title: "Transaction Id",
    dataIndex: "txId",
    key: "txId",
    ellipsis: true,
    width: 300,
    render: (txId) => (
      <a
        className="text-descM12 font-Montserrat text-secondaryMainColor hover:text-mainColor"
        href={`${isSideChain ? explorer : mainExplorer}/tx/${txId}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {txId}
      </a>
    ),
  },
  {
    title: "Type",
    dataIndex: "action",
    key: "action",
    render(action) {
      return <Tag color={ACTIONS_COLOR_MAP[action]}>{action}</Tag>;
    },
  },
  {
    title: "Time",
    dataIndex: "time",
    key: "time",
    render(time) {
      return moment(time).format("YYYY/MM/DD HH:mm:ss");
    },
  },
];

const referendumListColumn = [...listColumn];
referendumListColumn.splice(
  2,
  0,
  {
    title: "Symbol",
    dataIndex: "symbol",
    key: "symbol",
  },
  {
    title: "Amount",
    dataIndex: "amount",
    key: "amount",
  }
);

const personListColumn = referendumListColumn.slice(1);

const VoteDetail = (props) => {
  const {
    proposalId,
    proposalType,
    logStatus,
    wallet,
    currentWallet,
    expiredTime,
    status,
    symbol,
  } = props;
  const { callSendMethod: callContract } = useConnectWallet();
  const [list, setList] = useState({
    loadingStatus: LOADING_STATUS.LOADING,
    list: [],
    total: 0,
    params: {
      proposalId,
      pageSize: 20,
      pageNum: 1,
      search: "",
    },
  });
  const [personVote, setPersonVote] = useState({
    list: [],
    left: 0,
    canReclaim: false,
  });

  function fetchList(params) {
    setList({
      ...list,
      loadingStatus: LOADING_STATUS.LOADING,
    });
    getList(params)
      .then((result) => {
        setList({
          ...list,
          params,
          list: result.list,
          total: result.total,
          loadingStatus: LOADING_STATUS.SUCCESS,
        });
      })
      .catch((e) => {
        console.error(e);
        setList({
          ...list,
          params,
          list: [],
          total: 0,
          loadingStatus: LOADING_STATUS.FAILED,
        });
      });
  }

  async function reclaimToken() {
    await sendTransactionWith(
      callContract,
      getContractAddress(proposalTypes.REFERENDUM),
      "ReclaimVoteToken",
      proposalId
    );
  }

  useEffect(() => {
    fetchList(list.params);
  }, [proposalId]);

  useEffect(() => {
    if (
      logStatus === LOG_STATUS.LOGGED &&
      proposalType === proposalTypes.REFERENDUM
    ) {
      getPersonalVote({
        proposalId,
        address: currentWallet.address,
      })
        .then((votes) => {
          const left = votes.reduce(
            (acc, v) => (v.claimed ? acc : acc.add(new Decimal(v.amount))),
            new Decimal(0)
          );
          setPersonVote({
            list: votes,
            left: left.toString(),
            // eslint-disable-next-line max-len
            canReclaim:
              left.gt(0) &&
              (moment(expiredTime).isBefore(moment()) ||
                status === proposalStatus.RELEASED),
          });
        })
        .catch((e) => {
          toast.error(e.message || "Get personal vote history failed");
        });
    }
  }, [proposalId, logStatus]);

  function onSearch(value) {
    fetchList({
      ...list.params,
      pageNum: 1,
      search: removePrefixOrSuffix((value || "").trim()),
    });
  }

  function onPageNumChange(pageNum) {
    fetchList({
      ...list.params,
      pageNum,
    });
  }

  return (
    <div className="py-6 px-[38px]">
      <If
        condition={
          logStatus === LOG_STATUS.LOGGED &&
          proposalType === proposalTypes.REFERENDUM &&
          personVote.list.length > 0
        }
      >
        <Then>
          <div className="mb-6">
            <span className="text-descM13 font-Montserrat text-white">Personal Votes</span>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-descM13 font-Montserrat text-white">Token Voted:</span>
                <span>
                  {personVote.left}
                  <Tag color="blue">{symbol}</Tag> left
                </span>
              </div>
              <Button
                type="primary"
                size="small"
                disabled={!personVote.canReclaim}
                onClick={reclaimToken}
              >
                Reclaim
              </Button>
            </div>
            <TableLayer>
              <Table
                showSorterTooltip={false}
                dataSource={personVote.list}
                columns={personListColumn}
                rowKey="txId"
                pagination={false}
                scroll={{ x: 980 }}
              />
            </TableLayer>
          </div>
        </Then>
      </If>
      <div className="flex items-center justify-between gap-2">
        <span className="text-descM13 font-Montserrat text-white">All Votes</span>
        <Input
          className="max-w-[calc(100%-100px)] md:max-w-[406px]"
          rootClassName="md:!text-desc11 !py-[10px]"
          placeholder="Input voter address/transaction id"
          prefix={<i className="tmrwdao-icon-search text-[16px] text-lightGrey" />}
          onPressEnter={onSearch}
          enterKeyHint="search"
        />
      </div>
      <TableLayer className="vote-detail-content gap-top-large">
        <ConfigProvider renderEmpty={() => <NoData></NoData>}>
          <Table
            showSorterTooltip={false}
            dataSource={list.list}
            columns={
              proposalType === proposalTypes.REFERENDUM
                ? referendumListColumn
                : listColumn
            }
            loading={list.loadingStatus === LOADING_STATUS.LOADING}
            rowKey="txId"
            pagination={false}
            scroll={{ x: 980 }}
          />
        </ConfigProvider>
      </TableLayer>
      <Pagination
        showQuickJumper
        total={list.total}
        current={list.params.pageNum}
        pageSize={list.params.pageSize}
        hideOnSinglePage
        onChange={onPageNumChange}
        showTotal={Total}
      />
    </div>
  );
};

VoteDetail.propTypes = {
  proposalType: PropTypes.oneOf(Object.values(proposalTypes)).isRequired,
  proposalId: PropTypes.string.isRequired,
  logStatus: PropTypes.oneOf(Object.values(LOG_STATUS)).isRequired,
  wallet: PropTypes.shape({
    sign: PropTypes.func.isRequired,
    login: PropTypes.func.isRequired,
  }).isRequired,
  currentWallet: PropTypes.shape({
    address: PropTypes.string,
    publicKey: PropTypes.string,
  }).isRequired,
  expiredTime: PropTypes.string.isRequired,
  status: PropTypes.oneOf(Object.values(proposalStatus)).isRequired,
  symbol: PropTypes.string.isRequired,
};

export default VoteDetail;
