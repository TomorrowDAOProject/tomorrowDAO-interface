import { useEffect, useRef, useState } from 'react';
import { Table } from 'aelf-design';
import { ConfigProvider } from 'antd';
import publicKeyToAddress from 'app/network-dao/_src/utils/publicKeyToAddress';
import addressFormat from 'app/network-dao/_src/utils/addressFormat';
import { useSelector } from 'react-redux';
import io from 'socket.io-client';
import NoData from 'components/NoData';
import { consensusDPoSAddr, electionContractAddr, SOCKET_URL_NEW } from 'config';
import { callMainNetViewContract } from 'contract/callContract';
import { explorerServer } from 'api/axios';
import dayjs from 'dayjs';
import { useAsyncEffect } from 'ahooks';
import LinkNetworkDao from 'components/LinkNetworkDao';
import { ELF_DECIMAL } from 'app/network-dao/vote/constants';
import Tooltip from 'components/Tooltip';
import Spin from 'components/Spin';
import Divider from 'components/Divider';

const TableItemCount = 20;

export default function HighCounCilTab() {
  const { walletInfo } = useSelector((store: any) => store.userInfo);
  const socketRef = useRef<any>();
  const [nodeList, setNodeList] = useState<any>();
  const [loading, setLoading] = useState(false);
  const nodeListRef = useRef([]);
  const producedBlocksRef = useRef<any>();
  nodeListRef.current = nodeList;

  const getAllTeamDesc = async () => {
    return explorerServer.get('/explorer-api/vote/getAllTeamDesc', {
      params: {
        isActive: true,
      },
    });
  };
  const fetchCurrentRoundInformation = async () => {
    return callMainNetViewContract('GetCurrentRoundInformation', '', consensusDPoSAddr);
  };
  const fetchElectorVote = async () => {
    return callMainNetViewContract(
      'GetElectorVoteWithRecords',
      { value: walletInfo.address },
      electionContractAddr,
    );
  };
  const fetchTotal = async () => {
    const res = await callMainNetViewContract('GetCandidates', '', electionContractAddr);
    const total = res?.value?.length || 0;
    return total;
  };
  const fetchCurrentMinerPubkeyList = async () => {
    return callMainNetViewContract('GetCurrentMinerPubkeyList', '', consensusDPoSAddr);
  };
  const processNodesData = (resArr: any) => {
    const producedBlocks = producedBlocksRef.current;
    let totalActiveVotesAmount = 0;
    const nodeInfos = resArr[0] || [];
    // need to count history and current producedBlocks together
    const { realTimeMinersInformation } = resArr[1] || [];
    nodeInfos.forEach((ele: any) => {
      const history = +ele.candidateInformation.producedBlocks;
      const current =
        +realTimeMinersInformation[ele.candidateInformation.pubkey]?.producedBlocks || 0;
      ele.candidateInformation.producedBlocks = history + current;
    });
    const { activeVotingRecords } = resArr[3] || {};
    let teamInfos = null;
    if (resArr[2].code === 0) {
      teamInfos = resArr[2].data;
    }
    const BPNodes = resArr[4].pubkeys;
    // add node name, add my vote amount
    nodeInfos.forEach((item: any) => {
      // compute totalActiveVotesAmount
      // FIXME: It will result in some problem when getPageable can only get 20 nodes info at most in one time
      totalActiveVotesAmount += +item.obtainedVotesAmount;
      // add node name
      const teamInfo = teamInfos.find(
        (team: any) => team.public_key === item.candidateInformation.pubkey,
      );
      // get address from pubkey
      item.candidateInformation.address = publicKeyToAddress(item.candidateInformation.pubkey);
      item.candidateInformation.formattedAddress = addressFormat(item.candidateInformation.address);
      if (teamInfo === undefined) {
        // todo: use address instead after api modified
        item.candidateInformation.name = item.candidateInformation.formattedAddress;
      } else {
        item.candidateInformation.name = teamInfo.name;
      }

      // judge node type
      if (BPNodes.indexOf(item.candidateInformation.pubkey) !== -1) {
        item.candidateInformation.nodeType = 'BP';
      } else {
        item.candidateInformation.nodeType = 'Candidate';
      }
      // add my vote amount
      if (!activeVotingRecords) {
        item.candidateInformation.myTotalVoteAmount = '-';
        item.candidateInformation.myRedeemableVoteAmountForOneCandidate = '-';
        return;
      }
      // todo: use the method filterUserVoteRecordsForOneCandidate in voteUtil instead
      const myVoteRecordsForOneCandidate = activeVotingRecords.filter(
        (votingRecord: any) => votingRecord.candidate === item.candidateInformation.pubkey,
      );
      const myTotalVoteAmount = myVoteRecordsForOneCandidate.reduce(
        (total: any, current: any) => total + +current.amount,
        0,
      );
      // todo: use the method computeUserRedeemableVoteAmountForOneCandidate in voteUtil instead
      const myRedeemableVoteAmountForOneCandidate = myVoteRecordsForOneCandidate
        .filter((record: any) => record.unlockTimestamp.seconds <= dayjs().unix())
        .reduce((total: any, current: any) => total + +current.amount, 0);

      item.candidateInformation.myTotalVoteAmount = myTotalVoteAmount || '-';
      item.candidateInformation.myRedeemableVoteAmountForOneCandidate =
        myRedeemableVoteAmountForOneCandidate || '-';
      if (producedBlocks) {
        item.candidateInformation.producedBlocks = producedBlocks[item.candidateInformation.pubkey];
      } else {
        item.candidateInformation.producedBlocks = 0;
      }
    });

    return nodeInfos
      .map((item: any) => {
        const votedRate =
          totalActiveVotesAmount === 0
            ? 0
            : ((item.obtainedVotesAmount / totalActiveVotesAmount) * 100).toFixed(2);
        return {
          ...item.candidateInformation,
          obtainedVotesAmount: item.obtainedVotesAmount,
          votedRate,
        };
      })
      .filter((item: any) => item.isCurrentCandidate)
      .sort((a: any, b: any) => b.obtainedVotesAmount - a.obtainedVotesAmount) // todo: is it accurate?
      .map((item: any, index: any) => ({
        ...item,
        rank: index + 1,
        terms: item.terms.length,
      }));
  };
  const fetchAllCandidateInfo = async () => {
    const total = await fetchTotal();
    let start = 0;
    let result: any = [];
    while (start <= total) {
      // eslint-disable-next-line no-await-in-loop
      const res = await callMainNetViewContract(
        'GetPageableCandidateInformation',
        {
          start,
          length: TableItemCount,
        },
        electionContractAddr,
      );
      result = result.concat(res ? res.value : []);
      start += 20;
    }
    return result;
  };

  useEffect(() => {
    socketRef.current = io(SOCKET_URL_NEW, {
      path: '/new-socket',
    });
    socketRef.current?.on('produced_blocks', (data: any) => {
      producedBlocksRef.current = data;
      const nodeList = nodeListRef.current;
      if (!nodeList || !nodeList.length) {
        return;
      }
      const newNodeList = nodeList.map((item: any) => {
        item.producedBlocks = data[item.pubkey];
        return item;
      });
      setNodeList(newNodeList);
    });
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);
  useAsyncEffect(async () => {
    try {
      setLoading(true);
      const resArr = await Promise.all([
        fetchAllCandidateInfo(),
        fetchCurrentRoundInformation(),
        getAllTeamDesc(),
        fetchElectorVote(),
        fetchCurrentMinerPubkeyList(),
      ]);
      const processedNodesData = processNodesData(resArr);
      setNodeList(processedNodesData);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  }, []);
  const nodeListCols = [
    {
      title: 'Rank',
      dataIndex: 'rank',
      key: 'rank',
      defaultSortOrder: 'ascend',
      sorter: (a: any, b: any) => a.rank - b.rank,
      fixed: 'left',
    },
    {
      title: 'Node Name',
      dataIndex: 'name',
      key: 'nodeName',
      render: (text: any, record: any) => (
        <Tooltip title={text}>
          <LinkNetworkDao
            className="text-descM10 font-Montserrat !text-secondaryMainColor"
            href={{
              pathname: '/vote/team',
              query: {
                pubkey: record.pubkey,
              },
            }}
          >
            {text}
          </LinkNetworkDao>
        </Tooltip>
      ),
    },
    {
      title: 'Node Type',
      dataIndex: 'nodeType',
      key: 'nodeType',
      // todo: write the sorter after the api is ready
      // sorter: (a, b) => a.nodeType - b.nodeType
    },
    {
      title: 'Terms',
      dataIndex: 'terms',
      key: 'terms',
      sorter: (a: any, b: any) => a.terms - b.terms,
    },
    {
      title: 'Produce Blocks',
      dataIndex: 'producedBlocks',
      key: 'producedBlocks',
      sorter: (a: any, b: any) => a.producedBlocks - b.producedBlocks,
    },
    {
      title: 'Obtain Votes',
      dataIndex: 'obtainedVotesAmount',
      key: 'obtainedVotesCount',
      sorter: (a: any, b: any) => a.obtainedVotesAmount - b.obtainedVotesAmount,
      render: (value: any) => Number.parseFloat((value / ELF_DECIMAL).toFixed(2)).toLocaleString(),
    },
    {
      title: 'Voted Rate',
      key: 'votedRate',
      dataIndex: 'votedRate',
      render: (value: any) =>
        // <Progress percent={value} status="active" strokeColor="#fff" />
        `${value}%`,
      sorter: (a: any, b: any) => a.votedRate - b.votedRate,
    },
  ];
  return (
    <>
      <div className="py-6 px-[38px]">
        <span className="block mb-6 text-[15px] font-Unbounded font-light text-white -tracking-[0.6px]">
          High Council Members
        </span>
        <Divider />
        <Spin spinning={loading}>
          <ConfigProvider renderEmpty={() => <NoData></NoData>}>
            <Table
              scroll={{ x: true }}
              rowKey="rank"
              columns={nodeListCols as any}
              dataSource={nodeList}
            ></Table>
          </ConfigProvider>
        </Spin>
        {/* <Typography.Text fontWeight={FontWeightEnum.Medium}>-num- Members in Total</Typography.Text> */}
      </div>
    </>
  );
}
