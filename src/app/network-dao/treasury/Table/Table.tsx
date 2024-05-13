import { useEffect, useState } from 'react';
import { Table, HashAddress } from 'aelf-design';
import { ConfigProvider, Tag, Tooltip } from 'antd';
import { ColumnsType } from 'antd/es/table';
import Link from 'next/link';
import NoData from './NoData';
import { treasuryAccountAddress } from 'config';
import { useRequest } from 'ahooks';
import { fetchAddressTransferList } from 'api/request';
import useResponsive from 'hooks/useResponsive';
import { getFormattedDate } from 'utils/time';
import { numberFormatter } from 'utils/numberFormatter';

const checkIsOut = (address: string, record: AddressTransferListDataListItem) => {
  const { from, to, isCrossChain } = record;
  if (isCrossChain === 'Transfer' || isCrossChain === 'no') {
    if (from === address) {
      return true;
    }
    return false;
  }
  // isCrossChain: Receive
  if (to === address) {
    return false;
  }
  return true;
};
const defaultPageSize = 20;
export default function RecordTable() {
  const [timeFormat, setTimeFormat] = useState('Age');
  // const { isLG } = useResponsive();

  const [tableParams, setTableParams] = useState<{ page: number; pageSize: number }>({
    page: 1,
    pageSize: defaultPageSize,
  });
  const {
    data: transferListData,
    // error: transferListError,
    loading: transferListLoading,
    run,
  } = useRequest(
    () => {
      return fetchAddressTransferList({
        address: treasuryAccountAddress,
        pageSize: tableParams.pageSize,
        pageNum: tableParams.page,
      });
    },
    {
      manual: true,
    },
  );
  const handleFormatChange = () => {
    setTimeFormat(timeFormat === 'Age' ? 'Date Time' : 'Age');
  };

  const columns: ColumnsType<AddressTransferListDataListItem> = [
    {
      title: 'Txn Hash',
      dataIndex: 'txId',
      render(hash) {
        return (
          <span className="txn-hash">
            <Link href={`/tx/${hash}`}>{hash.slice(0, 15)}...</Link>
          </span>
        );
      },
    },
    {
      dataIndex: 'action',
      title: 'Method',
      render: (text) => {
        return (
          <Tooltip title={text} overlayClassName="table-item-tooltip__white">
            <div className="method">{text}</div>
          </Tooltip>
        );
      },
    },
    {
      dataIndex: 'time',
      title: (
        <div className="time" onClick={handleFormatChange}>
          {timeFormat}
        </div>
      ),
      render: (text) => {
        return <div>{getFormattedDate(text, timeFormat)}</div>;
      },
    },
    {
      title: 'From',
      dataIndex: 'from',
      render(from, record) {
        const isOut = checkIsOut(treasuryAccountAddress, record);
        return (
          <div className="from">
            <HashAddress address={from} preLen={8} endLen={8} />
          </div>
        );
      },
    },
    {
      title: 'Interacted With (To )',
      dataIndex: 'to',
      render(to, record) {
        return (
          <div className="to">
            <HashAddress address={to} preLen={8} endLen={8} />
          </div>
        );
      },
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      render(amount) {
        return `${numberFormatter(amount)}`;
      },
    },
    {
      title: 'Token',
      dataIndex: 'symbol',
      render(symbol) {
        return <div className="token">{symbol}</div>;
      },
    },
    {
      title: 'Txn Fee',
      dataIndex: 'txFee',
      align: 'right',
      render(fee, record) {
        const { symbol } = record;
        return <div>{fee[symbol] ? `${fee[symbol]}${symbol}` : '-'}</div>;
      },
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
  useEffect(() => {
    run();
  }, [tableParams]);

  const handleRowClassName = (): string => {
    return 'customRow';
  };

  return (
    <ConfigProvider renderEmpty={() => <NoData></NoData>}>
      <Table
        scroll={{ x: 800 }}
        className="custom-table-style"
        columns={columns as any}
        loading={transferListLoading}
        pagination={{
          ...tableParams,
          total: transferListData?.data?.total ?? 0,
          pageChange,
          pageSizeChange,
        }}
        dataSource={transferListData?.data?.list ?? []}
        rowClassName={handleRowClassName}
      ></Table>
    </ConfigProvider>
  );
}
