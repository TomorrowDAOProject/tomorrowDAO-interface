/*
 * @Author: Alfred Yang
 * @Github: https://github.com/cat-walk
 * @Date: 2019-08-31 17:53:57
 * @LastEditors: Alfred Yang
 * @LastEditTime: 2019-12-09 18:36:12
 * @Description: the page of election and nodes's notification
 */
import React, { PureComponent } from "react";
import Decimal from "decimal.js";
import { toast } from "react-toastify";
import getChainIdQuery from 'utils/url';
import moment from "moment";

import StatisticalData from "@components/StatisticalData/";
import {
  ELECTION_NOTIFI_DATA_TIP,
  txStatusInUpperCase,
  UNKNOWN_ERROR_TIP,
  ELF_DECIMAL,
} from "@src/constants";
import { aelf } from "@src/utils";
import getStateJudgment from "@utils/getStateJudgment";
import { connect } from "react-redux";
import NodeTable from "./NodeTable";
import ElectionRuleCard from "./ElectionRuleCard/ElectionRuleCard";
import MyWalletCard from "./MyWalletCard/MyWalletCard";
import Dividends from "@components/Dividends";
import "./ElectionNotification.style.css";
import CandidateApplyModal from "./CandidateApplyModal/CandidateApplyModal";
import { getTokenDecimal } from "@utils/utils";
import { WebLoginInstance } from "@utils/webLogin";
import { onlyOkModal } from "@components/SimpleModal/index.tsx";
import { fetchAllCandidateInfo } from "../utils";
import useNetworkDaoRouter from "hooks/useNetworkDaoRouter";


const electionNotifiStatisData = {
  termEndTime: {
    id: 0,
    title: "Current Term's Countdown (-th term)",
    isCountdown: true,
    resetTime: 1000 * 60 * 60 * 24 * 7,
    tooltip: ELECTION_NOTIFI_DATA_TIP,
  },
  currentNodesAmount: {
    id: 1,
    title: "Current Node's Amount",
  },
  currentVotesAmount: {
    id: 2,
    title: "Current Votes Amount",
  },
  currentMiningReward: {
    id: 3,
    title: "Current Mining Reward",
  },
};

async function getDividend(treasury, consensus) {
  let undistributed = {
    value: {
      ELF: 0,
    },
  };
  const miner = await consensus.GetCurrentTermMiningReward.call();
  try {
    undistributed = await treasury.GetUndistributedDividends.call();
  } catch (e) {
    console.log("call contract method failed");
  }
  let dividends = {
    ELF: 0,
  };
  if (undistributed && undistributed.value) {
    dividends = {
      ...(undistributed.value || {}),
      ELF: new Decimal((undistributed.value || {}).ELF || 0)
        .add(miner && miner.value ? miner.value : 0)
        .toNumber(),
    };
  }
  dividends = dividends || {};
  if (Object.keys(dividends).length > 0) {
    const symbols = Object.keys(dividends);
    let decimals = await Promise.all(symbols.map((s) => getTokenDecimal(s)));
    decimals = symbols.reduce(
      (acc, v, i) => ({
        ...acc,
        [v]: decimals[i],
      }),
      {}
    );
    dividends = Object.keys(dividends).reduce(
      (acc, key) => ({
        ...acc,
        [key]: new Decimal(dividends[key])
          .dividedBy(`1e${decimals[key] || 8}`)
          .toNumber(),
      }),
      {}
    );
  }
  return dividends;
}

const Display = (props) => {
  const { dividends } = props;
  return (
    <div className="ant-statistic vote-statistic">
      <div className="ant-statistic-title text-desc12 text-Neutral-Secondary-Text font-Montserrat pt-[14px] mb-4">Current Mining Reward</div>
      <div className="ant-statistic-content">
        <span className="ant-statistic-content-value text-descM18 text-white font-Montserrat">
          <Dividends dividends={dividends} useButton={false} />
        </span>
      </div>
    </div>
  );
};

class ElectionNotification extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      contracts: null,
      showWallet: false,
      candidates: null,
      nodesCount: null,
      statisData: electionNotifiStatisData,
      statisDataLoading: false,
      applyModalVisible: false,
    };

    this.hasRun = false;

    this.handleApplyModalOk = this.handleApplyModalOk.bind(this);
    this.handleApplyModalCancel = this.handleApplyModalCancel.bind(this);
    this.displayApplyModal = this.displayApplyModal.bind(this);
    this.quitElection = this.quitElection.bind(this);
  }

  async componentDidMount() {
    const {
      changeVoteState,
      electionContract,
      multiTokenContract,
      dividendContract,
      profitContractFromExt,
    } = this.props;

    await this.fetchData();

    if (
      dividendContract &&
      electionContract &&
      multiTokenContract &&
      profitContractFromExt
    ) {
      changeVoteState({
        shouldRefreshMyWallet: true,
      });
    }
  }

  componentDidUpdate() {
    this.fetchData();
  }

  async fetchData() {
    const {
      electionContract,
      consensusContract,
      dividendContract,
      shouldRefreshElectionNotifiStatis,
      changeVoteState,
    } = this.props;
    // todo: decouple, it's too couple here
    if (
      electionContract !== null &&
      consensusContract !== null &&
      dividendContract !== null &&
      !this.hasRun
    ) {
      // this.fetchTotalVotesAmount();
      this.hasRun = true;
      await this.fetchStatisData();
    }

    if (shouldRefreshElectionNotifiStatis) {
      // Avoid repeating refresh
      changeVoteState(
        {
          shouldRefreshElectionNotifiStatis: false,
        },
        () => {
          this.fetchStatisData();
        }
      );
    }
  }

  async fetchStatisData() {
    const { statisDataLoading, statisData } = this.state;
    if (statisDataLoading) {
      return;
    }
    const { electionContract, consensusContract, dividendContract } =
      this.props;
    this.setState({
      statisDataLoading: true,
    });
    const dataSource = [
      {
        contract: consensusContract,
        method: "GetCurrentTermNumber",
        statisDataKey: "termEndTime",
        processor: (value) => (<div className="text-center mr-[4px]">
          <div className="mb-[2px]">Current Term's Countdown</div>
          <div>({value}th term)</div>
        </div>),
        dataKey: "title",
      },
      {
        contract: electionContract,
        method: "GetCandidates",
        processor: (value) => value.length,
        statisDataKey: "currentNodesAmount",
        dataKey: "num",
      },
      {
        contract: electionContract,
        method: "GetPageableCandidateInformation",
        processor: (value) =>
          value.reduce((x, y) => x + y.obtainedVotesAmount / ELF_DECIMAL, 0),
        statisDataKey: "currentVotesAmount",
        dataKey: "num",
      },
      {
        contract: consensusContract,
        method: "GetNextElectCountDown",
        processor: (value) => moment().add(value, "seconds"),
        statisDataKey: "termEndTime",
        dataKey: "num",
      },
    ];

    const list = await Promise.all(
      dataSource.map(async (item) => {
        const { contract, dataKey, method, processor, statisDataKey } = item;
        try {
          let r;
          if (method === "GetPageableCandidateInformation") {
            r = await fetchAllCandidateInfo(contract);
            return {
              statisDataKey,
              [dataKey]: processor(r),
            };
          }
          r = await contract[method].call();
          return {
            statisDataKey,
            [dataKey]: processor((r || { value: 0 }).value),
          };
        } catch (e) {
          return {
            statisDataKey,
            [dataKey]: 0,
          };
        }
      })
    );
    const result = list.reduce(
      (acc, v) => {
        const { statisDataKey, ...left } = v;
        return {
          ...acc,
          [statisDataKey]: {
            ...(statisData[statisDataKey] || {}),
            ...(acc[statisDataKey] || {}),
            ...left,
          },
        };
      },
      {
        ...statisData,
      }
    );
    const dividends = await getDividend(dividendContract, consensusContract);
    this.setState({
      statisData: {
        ...result,
        currentMiningReward: {
          ...statisData.currentMiningReward,
          isRender: true,
          num: <Display key="currentMiningReward" dividends={dividends} />,
        },
      },
      statisDataLoading: false,
    });
  }

  quitElection() {
    const {
      currentWallet,
      electionContractFromExt,
      checkExtensionLockStatus,
      judgeCurrentUserIsCandidate,
    } = this.props;

    checkExtensionLockStatus().then(() => {
      const chainIdQuery = getChainIdQuery();
      WebLoginInstance.get()
        .callContract({
          contractAddress: electionContractFromExt.address,
          methodName: "QuitElection",
          args: {
            value: currentWallet?.publicKey,
          },
          chainId: chainIdQuery.chainId
          // options: {
          //   chainId: chainIdQuery.chainId
          // }
        })
        .then((res) => {
          if (!res) {
            const chainIdQuery = getChainIdQuery();
            return WebLoginInstance.get().callContract({
              contractAddress: electionContractFromExt.address,
              methodName: "QuitElection",
              args: {
                value: currentWallet?.address,
              },
              chainId: chainIdQuery.chainId
              // options: {
              //   chainId: chainIdQuery.chainId
              // }
            });
          }
          return res;
        })
        .then((res = {}) => {
          if (res.error) {
            toast.error(res.errorMessage.message);
            return;
          }
          if (!res) {
            toast.error(UNKNOWN_ERROR_TIP);
            return;
          }
          const transactionId = res.result
            ? res.result.TransactionId
            : res.TransactionId;
          setTimeout(async () => {
            try {
              const result = await aelf.chain.getTxResult(transactionId);
              const { Status: status } = result;
              getStateJudgment(status, transactionId);
              judgeCurrentUserIsCandidate();
            } catch (e) {
              console.log(e);
              toast.error(e.message || e.Error || "Network error");
            }
          }, 4000);
        })
        .catch((err) => {
          console.error(err);
        });
    });
  }

  handleApplyModalOk(admin) {
    const { checkExtensionLockStatus } = this.props;
    checkExtensionLockStatus().then(() => {
      // checkExtensionLockStatus will change props
      const {
        currentWallet,
        electionContractFromExt,
        judgeCurrentUserIsCandidate,
        changeVoteState,
      } = this.props;
      // changeVoteState({
      //   shouldRefreshMyWallet: true,
      // });
      if (
        (currentWallet.discoverInfo || currentWallet.portkeyInfo) &&
        !currentWallet.nightElfInfo
      ) {
        onlyOkModal({
          message: `Becoming a candidate node with smart contract wallet address is not supported.`,
        });
        this.setState({
          applyModalVisible: false,
        });
        return;
      }
      const chainIdQuery = getChainIdQuery();
      WebLoginInstance.get()
        .callContract({
          contractAddress: electionContractFromExt.address,
          methodName: "AnnounceElection",
          args: admin,
          chainId: chainIdQuery.chainId,
          // options: {
          //   chainId: chainIdQuery.chainId
          // }
        })
        .then((res) => {
          if (res.error) {
            toast.error(res.error.message || res.errorMessage.message);
            return;
          }
          if (!res) {
            toast.error(UNKNOWN_ERROR_TIP);
            return;
          }
          const transactionId = res.result
            ? res.result.TransactionId
            : res.TransactionId;
          setTimeout(async () => {
            try {
              const result = await aelf.chain.getTxResult(transactionId);
              this.setState({
                applyModalVisible: false,
              });
              const { Status: status } = result;
              getStateJudgment(status, transactionId);
              judgeCurrentUserIsCandidate();
              if (status === txStatusInUpperCase.mined) {
                this.props.navigate(
                  `/vote/apply?pubkey=${currentWallet?.publicKey}`
                );
              }
            } catch (e) {
              console.log(e);
              toast.error(e.message || e.Error || "Network error");
            }
          }, 4000);
        })
        .catch((err) => {
          console.error(err);
        });
    });
  }

  displayApplyModal() {
    this.setState({
      applyModalVisible: true,
    });
  }

  handleApplyModalCancel() {
    this.setState({
      applyModalVisible: false,
    });
  }

  render() {
    const {
      consensusContract,
      multiTokenContract,
      profitContract,
      dividendContract,
      isCandidate,
      handleDividendClick,
      dividends,
      electionContractFromExt,
      shouldRefreshNodeTable,
      nodeTableRefreshTime,
      changeVoteState,
      shouldRefreshMyWallet,
      checkExtensionLockStatus,
    } = this.props;
    const { statisData, statisDataLoading, applyModalVisible } = this.state;

    const { electionContract } = this.props;

    return (
      <section className="election-notification">
        <div className="statistical-data-content">
          <StatisticalData data={statisData} spinning={statisDataLoading} tooltipClassName="!max-w-[440px] !w-[400px]" />
        </div>
        <ElectionRuleCard
          isCandidate={isCandidate}
          quitElection={this.quitElection}
          displayApplyModal={this.displayApplyModal}
        />
        <MyWalletCard
          multiTokenContract={multiTokenContract}
          electionContract={electionContract}
          profitContract={profitContract}
          dividendContract={dividendContract}
          handleDividendClick={handleDividendClick}
          dividends={dividends}
          electionContractFromExt={electionContractFromExt}
          shouldRefreshMyWallet={shouldRefreshMyWallet}
          changeVoteState={changeVoteState}
          checkExtensionLockStatus={checkExtensionLockStatus}
        />
        <NodeTable
          electionContract={electionContract}
          consensusContract={consensusContract}
          shouldRefreshNodeTable={shouldRefreshNodeTable}
          nodeTableRefreshTime={nodeTableRefreshTime}
          changeVoteState={changeVoteState}
        />
        <CandidateApplyModal
          visible={applyModalVisible}
          onOk={this.handleApplyModalOk}
          onCancel={this.handleApplyModalCancel}
        />
      </section>
    );
  }
}
const mapStateToProps = (state) => {
  const { currentWallet } = state.common;
  return {
    currentWallet,
  };
};
const ElectionNotificationConnect = connect(mapStateToProps)((ElectionNotification));

export default function WrapElectionNotification(props) {
  const router = useNetworkDaoRouter()
  return <ElectionNotificationConnect {...props} navigate={router.push} />
}
