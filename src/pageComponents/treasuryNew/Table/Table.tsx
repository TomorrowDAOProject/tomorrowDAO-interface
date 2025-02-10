import React, { useEffect, useState } from 'react';
import { Table, HashAddress, IHashAddressProps } from 'aelf-design';
import { ConfigProvider, Tooltip } from 'antd';
import { ColumnsType } from 'antd/es/table';
import Link from 'next/link';
// import NoData from './NoData';
import { explorer, mainExplorer } from 'config';
import { useRequest } from 'ahooks';
import { fetchAddressTransferList } from 'api/request';
// import useResponsive from 'hooks/useResponsive';
import { getFormattedDate } from 'utils/time';
import { numberFormatter } from 'utils/numberFormatter';
import NoData from 'components/NoData';
import { checkIsOut } from 'utils/transaction';
import { isSideChain } from 'utils/chain';
import Symbol from 'components/Symbol';
import LoadingComponent from 'components/LoadingComponent';

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
  // const handleFormatChange = () => {
  //   setTimeFormat(timeFormat === 'Age' ? 'Date Time' : 'Age');
  // };

  const columns: ColumnsType<IAddressTransferListDataListItem> = [
    {
      title: 'Txn Hash',
      dataIndex: 'txId',
      width: 184,
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
                primaryIconColor={'#989DA0'}
                addressHoverColor={'white'}
                addressActiveColor={'white'}
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
      width: 144,
      render: (text) => {
        return (
          <Tooltip title={text} overlayClassName="table-item-tooltip__white">
            <div className="method-tag">{text}</div>
          </Tooltip>
        );
      },
    },
    {
      dataIndex: 'time',
      width: 144,
      title: <div className="time">{timeFormat}</div>,
      render: (text) => {
        console.log('text', text, timeFormat, getFormattedDate(text, timeFormat));
        return <div>{getFormattedDate(text, timeFormat)}</div>;
      },
    },
    {
      title: 'From',
      dataIndex: 'from',
      width: 198,
      render(from, record) {
        return (
          <div className="from">
            <Link
              href={`${isSideChain(currentChain) ? explorer : mainExplorer}/address/${from}`}
              target="_blank"
            >
              <HashAddress
                className="treasury-address"
                chain={currentChain as IHashAddressProps['chain']}
                address={from}
                preLen={8}
                endLen={9}
              />
            </Link>
          </div>
        );
      },
    },
    {
      title: '',
      dataIndex: 'to',
      width: 52,
      render(to, record) {
        const isOut = checkIsOut(address, record);
        return (
          <div className={`interactive-tag ${isOut ? 'out' : 'in'} w-[36px] flex justify-center`}>
            {isOut ? 'out' : 'in'}
          </div>
        );
      },
    },
    {
      title: 'Interacted With (To)',
      dataIndex: 'to',
      width: 198,
      className: 'interactive-withto',
      render(to, record) {
        const isOut = checkIsOut(address, record);
        return (
          <div className="to flex interactive-withto-address">
            <Link
              href={`${isSideChain(currentChain) ? explorer : mainExplorer}/address/${to}`}
              target="_blank"
            >
              <HashAddress
                chain={currentChain as IHashAddressProps['chain']}
                className="treasury-address"
                address={to}
                preLen={8}
                endLen={9}
              />
            </Link>
          </div>
        );
      },
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      width: 200,
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
          <Link
            href={`${isSideChain(currentChain) ? explorer : mainExplorer}/token/${symbol}`}
            target="_blank"
          >
            <Symbol symbol={symbol} className="treasury-token" />
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

  console.log('columns', columns);

  return (
    <ConfigProvider renderEmpty={() => <NoData></NoData>}>
      <Table
        scroll={{ x: 'max-content' }}
        className="custom-table-style full-table normal-table clear-table-padding no-mask"
        columns={columns as any}
        loading={{
          spinning: transferListLoading,
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
          total: transferListData?.data?.total ?? 0,
          onChange: pageChange,
        }}
        dataSource={transferListData?.data?.list ?? []}
        rowClassName={handleRowClassName}
      ></Table>
    </ConfigProvider>
  );
}
