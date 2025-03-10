import React, { useState, useEffect } from "react";
import moment from "moment";
import StatisticalData from "@components/StatisticalData/";
import { getAllTeamDesc } from "@api/vote";
import publicKeyToAddress from "@utils/publicKeyToAddress";
import { RANK_NOT_EXISTED_SYMBOL, ELF_DECIMAL, myVoteStatistData } from "../constants";
import Button from "components/Button";
import Spin from "components/Spin";
import { connect } from "react-redux";
import MyVoteRecord from "./MyVoteRecords";
import addressFormat from "@utils/addressFormat";
import "./MyVote.style.css";
import { WebLoginInstance } from "@utils/webLogin";
import { isActivityBrowser } from "@utils/isWebView";
import { fetchAllCandidateInfo } from "../utils";
import { useConnectWallet } from "@aelf-web-login/wallet-adapter-react";

const MyVote = ({ currentWallet, electionContract, checkExtensionLockStatus }) => {
  const [statistData, setStatistData] = useState(myVoteStatistData);
  const [tableData, setTableData] = useState([]);
  const [spinningLoading, setSpinningLoading] = useState(true);
  const [hasRun, setHasRun] = useState(false);

  const fetchElectorVote = async (wallet, contract) => {
    const { publicKey, address } = wallet;
    let res;
    if (publicKey) {
      res = await contract.GetElectorVoteWithAllRecords.call({
        value: publicKey,
      });
    }
    if (!res) {
      res = await contract.GetElectorVoteWithAllRecords.call({
        value: address,
      });
    }
    return res;
  };

  const processTableData = (myVoteRecords, allTeamInfo) => {
    const tableData = myVoteRecords;

    console.log('myVoteRecords', myVoteRecords)
    tableData.forEach((record) => {
      const teamInfo = allTeamInfo.find(
        (team) => team.public_key === record.candidate
      );
      if (teamInfo === undefined) {
        record.address = publicKeyToAddress(record.candidate);
        record.name = addressFormat(record.address);
      } else {
        record.name = teamInfo.name;
      }
      if (record.isWithdrawn) {
        record.type = "Redeem";
        record.operationTime = moment
          .unix(record.withdrawTimestamp.seconds)
          .format("YYYY-MM-DD HH:mm:ss");
      } else if (record.isChangeTarget) {
        record.type = "Switch Vote";
        record.operationTime = moment
          .unix(record.voteTimestamp.seconds)
          .format("YYYY-MM-DD HH:mm:ss");
      } else {
        record.type = "Vote";
        record.operationTime = moment
          .unix(record.voteTimestamp.seconds)
          .format("YYYY-MM-DD HH:mm:ss");
      }
      record.status = "Success";
      const start = moment.unix(record.voteTimestamp.seconds);
      const end = moment.unix(record.unlockTimestamp.seconds);
      record.formattedLockTime = end.from(start, true);
      record.formattedUnlockTime = end.format("YYYY-MM-DD HH:mm:ss");
      record.isRedeemable = record.unlockTimestamp.seconds <= moment().unix();
    });

    setTableData(tableData);
    setSpinningLoading(false);
  };

  const processData = (resArr) => {
    let electorVotes = resArr[0] || resArr[3];
    if (!electorVotes) {
      electorVotes = {
        activeVotingRecords: [],
        withdrawnVotesRecords: [],
      };
    }
    const allNodeInfo = (resArr[2] || [])
      .sort((a, b) => +b.obtainedVotesAmount - +a.obtainedVotesAmount)
      .map((item, index) => {
        item.rank = index + 1;
        return item;
      });
    let allTeamInfo = null;
    const withdrawableVoteRecords = [];
    let withdrawableVoteAmount = 0;
    if (resArr[1].code === '20000') {
      allTeamInfo = resArr[1].data;
    }

    const myVoteRecords = [
      ...electorVotes.activeVotingRecords,
      ...electorVotes.withdrawnVotesRecords,
    ];
    electorVotes.activeVotingRecords.forEach((record) => {
      if (record.unlockTimestamp.seconds < moment().unix()) {
        withdrawableVoteRecords.push(record);
      }
    });

    myVoteRecords.forEach((record) => {
      const foundedNode = allNodeInfo.find(
        (item) => item.candidateInformation.pubkey === record.candidate
      );
      if (foundedNode === undefined) {
        record.rank = 9999999;
        record.displayedRank = RANK_NOT_EXISTED_SYMBOL;
      } else {
        record.rank = foundedNode.rank;
        record.displayedRank = foundedNode.rank;
      }
    });
    const myTotalVotesAmount = electorVotes.allVotedVotesAmount;
    withdrawableVoteAmount = withdrawableVoteRecords.reduce(
      (total, current) => total + +current.amount,
      0
    );

    const newStatistData = {
      ...statistData,
      ['myTotalVotesAmount']: {
        ...(statistData['myTotalVotesAmount'] || {}),
        ['num']: Number(myTotalVotesAmount) / ELF_DECIMAL,
      },
      ['withdrawableVotesAmount']: {
        ...(statistData['withdrawableVotesAmount'] || {}),
        ['num']: withdrawableVoteAmount / ELF_DECIMAL
      },
    };
    setStatistData(newStatistData);
    processTableData(myVoteRecords, allTeamInfo);
  };

  const fetchTableDataAndStatistData = () => {
    if (!electionContract) return;
    setHasRun(true);
    if (!currentWallet || !currentWallet.address) {
      setHasRun(false);
      return false;
    }
    Promise.all([
      fetchElectorVote(currentWallet, electionContract),
      getAllTeamDesc(),
      fetchAllCandidateInfo(electionContract),
      electionContract.GetElectorVoteWithAllRecords.call({
        value: currentWallet.address,
      }),
    ])
      .then((resArr) => {
        console.log('resArr', resArr)
        processData(resArr);
      })
      .catch((err) => {
        console.error("err", "fetchTableDataAndStatistData", err);
      });
  };

  const getCurrentWallet = () => {
    return checkExtensionLockStatus().then(
      () => {
        setSpinningLoading(true);
        fetchTableDataAndStatistData();
      },
      () => {
        setSpinningLoading(false);
      }
    );
  };

  useEffect(() => {
    if (currentWallet?.address) {
      getCurrentWallet();
    }
  }, [currentWallet?.address]);

  useEffect(() => {
    if (!hasRun) {
      fetchTableDataAndStatistData();
    }
  }, [hasRun]);

  const onLogin = () => {
    getCurrentWallet();
  };
  const { connectWallet } = useConnectWallet();

  const { isLocking } = WebLoginInstance.get().getWebLoginContext();

  const renderNotLogin = () => {
    if (isActivityBrowser()) {
      return (
        <div className="py-[180px] px-[38px] flex flex-col justify-center items-center">
          <span className="mb-[14px] block text-white text-descM15 font-Montserrat">It seems like you are using Portkey App, please login in PC browser</span>
        </div>
      );
    }
    return (
      <div className="py-[180px] px-[38px] flex flex-col justify-center items-center">
        <span className="mb-[14px] block text-white text-descM15 font-Montserrat">It seems like you are not logged in</span>
        <Button onClick={() => connectWallet()} className="!w-[100px]" type="primary" size="small">
          Log In
        </Button>
      </div>
    );
  };

  return (
    <section className="py-6 px-[38px] bg-darkBg">
      {currentWallet?.address ? (
        <Spin spinning={spinningLoading}>
          <StatisticalData data={statistData} />
          <MyVoteRecord data={tableData} />
        </Spin>
      ) : (
        renderNotLogin()
      )}
    </section>
  );
};

const mapStateToProps = (state) => ({
  currentWallet: state.common.currentWallet,
});

export default connect(mapStateToProps)(MyVote);
