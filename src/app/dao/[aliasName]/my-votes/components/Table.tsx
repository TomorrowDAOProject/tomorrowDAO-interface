import React, { useRef } from 'react';
import { useEffect, useState } from 'react';
import { Table, HashAddress } from 'aelf-design';
import { ConfigProvider } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { fetchDaoInfo, fetchVoteHistory } from 'api/request';
import { EVoteOption } from 'types/vote';
import NoData from 'components/NoData';
import { curChain, explorer } from 'config';
import { useRequest } from 'ahooks';
import { useParams } from 'next/navigation';
import dayjs from 'dayjs';
import Link from 'next/link';
import breadCrumb from 'utils/breadCrumb';
import BigNumber from 'bignumber.js';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import LoadingComponent from 'components/LoadingComponent';

const defaultPageSize = 20;
const allValue = 'All';
export default function RecordTable() {
  const { walletInfo: wallet } = useConnectWallet();

  const { aliasName } = useParams<{ aliasName: string }>();
  const runFetchVoteHistoryRef = useRef<() => void>();

  const [tableParams, setTableParams] = useState<{ page: number; pageSize: number }>({
    page: 1,
    pageSize: defaultPageSize,
  });
  const {
    data: voteHistoryData,
    error: voteHistoryError,
    loading: voteHistoryLoading,
    run,
  } = useRequest(
    async () => {
      const daoInfoRes = await fetchDaoInfo({ chainId: curChain, alias: aliasName });
      const daoId = daoInfoRes?.data?.id;
      return fetchVoteHistory({
        address: wallet?.address,
        chainId: curChain,
        skipCount: (tableParams.page - 1) * tableParams.pageSize,
        maxResultCount: tableParams.pageSize,
        daoId: daoId,
      });
    },
    {
      manual: true,
    },
  );
  runFetchVoteHistoryRef.current = run;

  useEffect(() => {
    breadCrumb.updateMyVotesPage(aliasName);
  }, [aliasName]);
  const columns: ColumnsType<IVoteHistoryItem> = [
    {
      title: 'Time',
      dataIndex: 'timeStamp',
      width: 207,
      sorter: (a, b) => {
        return dayjs(a.timeStamp).unix() - dayjs(b.timeStamp).unix();
      },
      defaultSortOrder: 'descend',
      showSorterTooltip: false,
      render(time) {
        return (
          <span className="font-Montserrat text-white font-medium">
            {dayjs(time).format('YYYY-MM-DD HH:mm:ss')}222
          </span>
        );
      },
    },
    {
      title: 'Proposal Name',
      dataIndex: 'proposalTitle',
      width: 200,
      render: (text, record) => {
        const renderProposalNode = (
          <div className="text-white font-medium font-Montserrat">{text}</div>
        );
        return (
          <Link href={`/dao/${aliasName}/proposal/${record.proposalId}`}>{renderProposalNode}</Link>
        );
      },
    },
    {
      title: 'Vote',
      dataIndex: 'myOption',
      className: 'vote-option-column',
      width: 116,
      filterMultiple: false,
      filters: [
        { text: 'All', value: allValue },
        { text: 'Approve', value: 0 },
        { text: 'Reject', value: 1 },
        { text: 'Abstain', value: 2 },
      ],
      onFilter: (value, record) => {
        if (value === allValue) {
          return true;
        }
        return record.myOption === value;
      },
      render(option) {
        return (
          <span className={`vote-record-${option} font-medium`}>
            {EVoteOption[option].toLocaleLowerCase().charAt(0).toUpperCase() +
              EVoteOption[option].toLocaleLowerCase().slice(1)}
          </span>
        );
      },
    },
    {
      title: 'Votes',
      dataIndex: 'voteNumAfterDecimals',
      width: 206,
      render(voteNum) {
        return (
          <span className="text-white font-medium font-Montserrat">
            {BigNumber(voteNum).toFormat()}
          </span>
        );
      },
    },
    {
      title: 'Txn Hash',
      dataIndex: 'transactionId',
      render(transactionId) {
        return (
          <Link href={`${explorer}/tx/${transactionId}`}>
            <HashAddress
              className="pl-[4px] my-record-tx-hash"
              ignorePrefixSuffix={true}
              preLen={8}
              endLen={11}
              address={transactionId}
              primaryIconColor={'#989DA0'}
              addressHoverColor={'white'}
              addressActiveColor={'white'}
            ></HashAddress>
          </Link>
        );
      },
    },
  ];

  const pageChange = (page: number, pageSize: number) => {
    setTableParams({
      page,
      pageSize,
    });
  };

  const handleRowClassName = (): string => {
    return 'customRow';
  };
  useEffect(() => {
    if (wallet?.address) {
      runFetchVoteHistoryRef?.current?.();
    }
  }, [tableParams, wallet?.address]);

  return (
    <ConfigProvider renderEmpty={() => <NoData></NoData>}>
      <Table
        scroll={{ x: 'max-content' }}
        className="custom-table-style"
        columns={columns as any}
        loading={{
          spinning: voteHistoryLoading,
          indicator: (
            <LoadingComponent
              className="-my-3 md:my-0 scale-[0.7] md:scale-[1.0]"
              size={36}
              strokeWidth={4}
            />
          ),
        }}
        pagination={{
          ...tableParams,
          total: voteHistoryData?.data?.totalCount ?? 0,
          onChange: pageChange,
        }}
        dataSource={voteHistoryData?.data?.items ?? []}
        rowClassName={handleRowClassName}
      ></Table>
    </ConfigProvider>
  );
}
