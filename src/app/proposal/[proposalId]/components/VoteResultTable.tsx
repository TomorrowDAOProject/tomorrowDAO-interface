import { memo, useState } from 'react';
import BoxWrapper from './BoxWrapper';
import { FontWeightEnum, HashAddress, Search, Table, Typography } from 'aelf-design';
import { TVotingOption } from './type';
import { ColumnsType } from 'antd/es/table';
import thousandsNumber from 'utils/thousandsNumber';
import clsx from 'clsx';

const columns: ColumnsType<IProposalDetailDataVoteTopListItem> = [
  {
    width: 320,
    title: <Typography.Text className="text-Neutral-Secondary-Text">Voters</Typography.Text>,
    dataIndex: 'voter',
    render: (text) => {
      return <HashAddress address={text} preLen={8} endLen={9} />;
    },
  },
  {
    width: 320,
    title: (
      <Typography.Text className="text-Neutral-Secondary-Text">Transaction Id</Typography.Text>
    ),
    dataIndex: 'transactionId',
    render: (text) => {
      return <HashAddress ignorePrefixSuffix={true} preLen={8} endLen={9} address={text} />;
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
    render: (text) => {
      return <Typography.Text>{text}</Typography.Text>;
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
              console.log(1);
            }}
            onSelectChange={(obj) => {
              console.log(obj);
            }}
            onPressEnter={() => {
              console.log('enter');
            }}
          />
        </div>
      </div>
      <Table
        columns={columns as any}
        pagination={{
          ...tableParams,
          total: voteTopList?.length ?? 0,
          pageChange,
          pageSizeChange,
        }}
        dataSource={voteTopList ?? []}
      ></Table>
    </BoxWrapper>
  );
};

export default memo(VoteResultTable);
