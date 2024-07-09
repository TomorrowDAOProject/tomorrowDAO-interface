import React, { useEffect, useState } from 'react';
import { Table, HashAddress } from 'aelf-design';
import { ConfigProvider, Tag, Tooltip } from 'antd';
import { ColumnsType } from 'antd/es/table';
import Link from 'next/link';
// import NoData from './NoData';
import { explorer, mainExplorer } from 'config';
import { useRequest } from 'ahooks';
import { fetchAddressTransferList } from 'api/request';
// import useResponsive from 'hooks/useResponsive';
import { getFormattedDate } from 'utils/time';
import { numberFormatter } from 'utils/numberFormatter';
import { TokenIconMap } from 'constants/token';
import NoData from './NoData';
import { checkIsOut } from 'utils/transaction';
import { isSideChain } from 'utils/chain';

const defaultPageSize = 20;
interface IRecordTableProps {
  address: string;
  isNft: boolean;
  currentChain?: string;
}
export default function RecordTable(props: IRecordTableProps) {
  const { address, currentChain, isNft } = props;
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
      const params: IAddressTransferListReq = {
        address,
        pageSize: tableParams.pageSize,
        pageNum: tableParams.page,
      };
      if (isNft) {
        params.isNft = isNft;
      }
      return fetchAddressTransferList(params, currentChain);
    },
    {
      manual: true,
    },
  );
  const handleFormatChange = () => {
    setTimeFormat(timeFormat === 'Age' ? 'Date Time' : 'Age');
  };

  const columns: ColumnsType<IAddressTransferListDataListItem> = [
    {
      title: 'Txn Hash',
      dataIndex: 'txId',
      width: 168,
      className: 'treasury-table-column-clear-pl ',
      render(hash) {
        return (
          <span className="txn-hash">
            <Link
              href={`${isSideChain(currentChain) ? explorer : mainExplorer}/tx/${hash}`}
              target="_blank"
            >
              <HashAddress
                className="card-xsm-text text-neutralTitle dao-tx-hash "
                address={hash}
                ignorePrefixSuffix
                hasCopy={true}
              />
              {/* <span>{hash.slice(0, 15)}...</span> */}
            </Link>
          </span>
        );
      },
    },
    {
      dataIndex: 'action',
      title: 'Method',
      width: 128,
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
      width: 144,
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
      width: 228,
      render(from, record) {
        return (
          <div className="from">
            <Link
              href={`${isSideChain(currentChain) ? explorer : mainExplorer}/address/${from}`}
              target="_blank"
            >
              <HashAddress className="treasury-address" address={from} preLen={8} endLen={9} />
            </Link>
          </div>
        );
      },
    },
    {
      title: 'Interacted With (To )',
      dataIndex: 'to',
      width: 280,
      render(to, record) {
        const isOut = checkIsOut(address, record);
        return (
          <div className="to flex">
            <Tag color={isOut ? 'error' : 'success'} className="w-[36px] flex justify-center">
              {isOut ? 'out' : 'in'}
            </Tag>
            <Link
              href={`${isSideChain(currentChain) ? explorer : mainExplorer}/address/${to}`}
              target="_blank"
            >
              <HashAddress className="treasury-address" address={to} preLen={8} endLen={9} />
            </Link>
          </div>
        );
      },
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      width: 180,
      render(amount) {
        return `${numberFormatter(amount)}`;
      },
    },
    {
      title: 'Token',
      dataIndex: 'symbol',
      // width: 200,
      render(symbol) {
        return (
          <Link href={`${isSideChain(currentChain) ? explorer : mainExplorer}/token/${symbol}`}>
            <div className="token flex items-center">
              {TokenIconMap[symbol] && (
                <img src={TokenIconMap[symbol]} className="token-logo pr-[2px]" alt="" />
              )}
              {symbol}
            </div>
          </Link>
        );
      },
    },
    // {
    //   title: 'Txn Fee',
    //   dataIndex: 'txFee',
    //   align: 'right',
    //   width: 150,
    //   render(fee, record) {
    //     const { symbol } = record;
    //     return <div>{fee[symbol] ? `${fee[symbol]}${symbol}` : '-'}</div>;
    //   },
    // },
  ];

  const pageChange = (page: number, pageSize: number) => {
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
        scroll={{ x: 'max-content' }}
        className="custom-table-style"
        columns={columns as any}
        loading={transferListLoading}
        pagination={{
          ...tableParams,
          total: transferListData?.data?.total ?? 0,
          onChange: pageChange,
        }}
        dataSource={transferListData?.data?.list ?? []}
        rowClassName={handleRowClassName}
      ></Table>
    </ConfigProvider>
  );
}
