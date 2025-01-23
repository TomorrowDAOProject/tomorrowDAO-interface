import { memo, useEffect, useState } from 'react';
import { HashAddress, Table } from 'aelf-design';
import { ConfigProvider } from 'antd';
import { ColumnsType } from 'antd/es/table';
import Link from 'next/link';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { curChain, explorer, sideChainSuffix } from 'config';
import NoData from 'components/NoData';
import { fetchVoteHistory } from 'api/request';
import { useRequest } from 'ahooks';
import { EVoteOption } from 'types/vote';
import BigNumber from 'bignumber.js';

const columns: ColumnsType<IVoteHistoryItem> = [
  {
    width: 328,
    title: 'Voter',
    dataIndex: 'voter',
    render: (text) => {
      return (
        <a href={`${explorer}/address/${text}`} target="_blank" rel="noreferrer">
          <HashAddress
            address={text}
            preLen={8}
            endLen={9}
            chain={sideChainSuffix}
            className="card-sm-text-bold"
          />
        </a>
      );
    },
  },
  {
    width: 344,
    title: 'Transaction ID',
    dataIndex: 'transactionId',
    render: (text) => {
      return (
        <Link href={`${explorer}/tx/${text}`} target="_blank">
          <HashAddress
            className="card-sm-text-bold"
            ignorePrefixSuffix={true}
            preLen={8}
            endLen={9}
            address={text}
          />
        </Link>
      );
    },
  },
  {
    width: 224,
    title: 'Result',
    dataIndex: 'myOption',
    render: (text) => {
      return (
        <span
          className={clsx(
            'card-sm-text-bold',
            text === EVoteOption.APPROVED
              ? 'text-approve'
              : text === EVoteOption.REJECTED
              ? 'text-rejection'
              : 'text-abstention',
          )}
        >
          {EVoteOption[text]}
        </span>
      );
    },
  },
  {
    width: 224,
    title: 'Votes',
    dataIndex: 'amount',
    render: (_, record) => {
      return (
        <span className="card-sm-text-bold">
          {BigNumber(record.voteNumAfterDecimals).toFormat()}
        </span>
      );
    },
  },
  {
    title: 'Time',
    dataIndex: 'timeStamp',
    align: 'right',
    render: (text) => {
      return (
        <span className="card-sm-text font-normal">
          {dayjs(text).format('YYYY-MM-DD HH:mm:ss')}
        </span>
      );
    },
  },
];
interface IVoteResultTableProps {
  daoId: string;
  proposalId: string;
}
const defaultPageSize = 20;
const VoteResultTable = (props: IVoteResultTableProps) => {
  const { daoId, proposalId } = props;
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
      return fetchVoteHistory({
        proposalId: proposalId,
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

  const pageChange = (page: number, pageSize: number) => {
    setTableParams({
      page,
      pageSize,
    });
  };
  useEffect(() => {
    run();
  }, [run, tableParams]);
  return (
    <div className="border border-fillBg8 border-solid rounded-lg bg-darkBg px-[24px] py-[25px]">
      <div className="flex justify-between">
        <span className="text-[18px] font-[500] font-Montserrat text-white mb-[20px]">
          Voting Results
        </span>
      </div>
      <ConfigProvider renderEmpty={() => <NoData></NoData>}>
        <Table
          rowKey={'transactionId'}
          columns={columns as any}
          scroll={{ x: 'max-content' }}
          pagination={{
            ...tableParams,
            total: voteHistoryData?.data?.totalCount ?? 0,
            onChange: pageChange,
          }}
          loading={voteHistoryLoading}
          dataSource={voteHistoryData?.data?.items}
        ></Table>
      </ConfigProvider>
    </div>
  );
};

export default memo(VoteResultTable);
