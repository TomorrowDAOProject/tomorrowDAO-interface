import React from 'react';
import { useEffect, useState } from 'react';
import { Table, HashAddress } from 'aelf-design';
import { ConfigProvider } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { useSelector } from 'react-redux';
import { fetchVoteHistory } from 'api/request';
import { EVoteOption } from 'types/vote';
import NoData from './NoData';
import { curChain } from 'config';
import { useRequest } from 'ahooks';
import { useSearchParams } from 'next/navigation';
import dayjs from 'dayjs';

const defaultPageSize = 20;
export default function RecordTable() {
  const searchParams = useSearchParams();
  const { walletInfo } = useSelector((store: any) => store.userInfo);

  const [tableParams, setTableParams] = useState<{ page: number; pageSize: number }>({
    page: 1,
    pageSize: defaultPageSize,
  });
  const {
    data: voteHistoryData,
    // error: voteHistoryError,
    loading: voteHistoryLoading,
    run,
  } = useRequest(
    () => {
      return fetchVoteHistory({
        address: walletInfo.address,
        chainId: curChain,
        skipCount: (tableParams.page - 1) * tableParams.pageSize,
        maxResultCount: tableParams.pageSize,
        daoId: searchParams.get('daoId') ?? '',
      });
    },
    {
      manual: true,
    },
  );

  const columns: ColumnsType<IVoteHistoryItem> = [
    {
      title: 'Time',
      dataIndex: 'timeStamp',
      sorter: true,
      defaultSortOrder: 'descend',
      render(time) {
        return <span>{dayjs(time).format('YYYY-MM-DD HH:mm:ss')}</span>;
      },
    },
    {
      title: 'Proposal Name',
      dataIndex: 'proposalTitle',
      render: (text) => <div>{text}</div>,
    },
    {
      title: 'proposalId',
      dataIndex: 'proposalId',
      render(text) {
        return (
          <HashAddress
            className="pl-[4px]"
            ignorePrefixSuffix={true}
            preLen={8}
            endLen={11}
            address={text}
          ></HashAddress>
        );
      },
    },
    {
      title: 'My Operation',
      dataIndex: 'myOption',
      filters: [
        { text: 'All', value: '' },
        { text: 'Member', value: 'Member' },
        { text: 'Candidate', value: 'Candidate' },
      ],
      render(option) {
        return <span>{EVoteOption[option]}</span>;
      },
    },
    {
      title: 'Votes',
      dataIndex: 'voteNum',
    },
    {
      title: 'transactionId',
      dataIndex: 'transactionId',
      render(text) {
        return (
          <HashAddress
            className="pl-[4px]"
            ignorePrefixSuffix={true}
            preLen={8}
            endLen={11}
            address={text}
          ></HashAddress>
        );
      },
    },
    {
      title: 'executer',
      dataIndex: 'executer',
    },
  ];

  const pageChange = (page: number, pageSize?: number) => {
    setTableParams({
      page,
      pageSize: pageSize ?? defaultPageSize,
    });
  };

  const pageSizeChange = (page: number, pageSize: number) => {
    setTableParams({
      page,
      pageSize,
    });
  };

  const handleRowClassName = (): string => {
    return 'customRow';
  };
  useEffect(() => {
    run();
  }, [tableParams]);

  return (
    <ConfigProvider renderEmpty={() => <NoData></NoData>}>
      <Table
        scroll={{ x: 800 }}
        className="custom-table-style"
        columns={columns as any}
        loading={voteHistoryLoading}
        pagination={{
          ...tableParams,
          total: voteHistoryData?.data?.total ?? 0,
          pageChange,
          pageSizeChange,
        }}
        dataSource={voteHistoryData?.data?.items ?? []}
        rowClassName={handleRowClassName}
      ></Table>
    </ConfigProvider>
  );
}
