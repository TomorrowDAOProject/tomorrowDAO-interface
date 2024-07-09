import { memo, useMemo, useState } from 'react';
import BoxWrapper from './BoxWrapper';
import { FontWeightEnum, HashAddress, Search, Table, Typography } from 'aelf-design';
import { TVotingOption } from './type';
import { ColumnsType } from 'antd/es/table';
import thousandsNumber from 'utils/thousandsNumber';
import Link from 'next/link';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { explorer, sideChainSuffix } from 'config';

const columns: ColumnsType<IProposalDetailDataVoteTopListItem> = [
  {
    width: 320,
    title: <Typography.Text className="text-Neutral-Secondary-Text">Voter</Typography.Text>,
    dataIndex: 'voter',
    render: (text) => {
      return <HashAddress address={text} preLen={8} endLen={9} chain={sideChainSuffix} />;
    },
  },
  {
    width: 320,
    title: (
      <Typography.Text className="text-Neutral-Secondary-Text">Transaction ID</Typography.Text>
    ),
    dataIndex: 'transactionId',
    render: (text) => {
      return (
        <Link href={`${explorer}/tx/${text}`}>
          <HashAddress ignorePrefixSuffix={true} preLen={8} endLen={9} address={text} />
        </Link>
      );
    },
  },
  {
    width: 200,
    title: <Typography.Text className="text-Neutral-Secondary-Text">Result</Typography.Text>,
    dataIndex: 'option',
    render: (text) => {
      return (
        <Typography.Text
          fontWeight={FontWeightEnum.Medium}
          className={clsx(
            text === TVotingOption.Approved
              ? 'text-approve'
              : text === TVotingOption.Rejected
              ? 'text-rejection'
              : 'text-abstention',
          )}
        >
          {text}
        </Typography.Text>
      );
    },
  },
  {
    width: 200,
    title: <Typography.Text className="text-Neutral-Secondary-Text">Votes</Typography.Text>,
    dataIndex: 'amount',
    render: (text) => {
      return (
        <Typography.Text fontWeight={FontWeightEnum.Medium}>
          {thousandsNumber(text)}
        </Typography.Text>
      );
    },
  },
  {
    title: <Typography.Text className="text-Neutral-Secondary-Text">Time</Typography.Text>,
    dataIndex: 'voteTime',
    align: 'right',
    width: 200,
    render: (text) => {
      return <Typography.Text>{dayjs(text).format('YYYY-MM-DD HH:mm:ss')}</Typography.Text>;
    },
  },
];
interface IVoteResultTableProps {
  voteTopList: IProposalDetailDataVoteTopListItem[];
}
const defaultPageSize = 20;
const VoteResultTable = (props: IVoteResultTableProps) => {
  const { voteTopList } = props;
  const [tableParams, setTableParams] = useState<{ page: number; pageSize: number }>({
    page: 1,
    pageSize: defaultPageSize,
  });

  const pageChange = (page: number, pageSize: number) => {
    setTableParams({
      page,
      pageSize,
    });
  };
  const lists = useMemo(() => {
    const { page, pageSize } = tableParams;
    return voteTopList?.slice((page - 1) * pageSize, page * pageSize) ?? [];
  }, [tableParams, voteTopList]);
  return (
    <BoxWrapper>
      <div className="flex justify-between pb-6">
        <Typography.Title level={6} fontWeight={FontWeightEnum.Medium}>
          Voting Results
        </Typography.Title>
        <div>
          <Search
            inputSize="small"
            onClear={() => {
              //
            }}
            onSelectChange={() => {
              //
            }}
            onPressEnter={() => {
              //
            }}
          />
        </div>
      </div>
      <Table
        rowKey={'transactionId'}
        columns={columns as any}
        scroll={{ x: 'max-content' }}
        pagination={{
          ...tableParams,
          total: voteTopList?.length ?? 0,
          onChange: pageChange,
        }}
        dataSource={lists}
      ></Table>
    </BoxWrapper>
  );
};

export default memo(VoteResultTable);
