import React, { useEffect, useState } from 'react';
import { Table, IHashAddressProps } from 'aelf-design';
import { ConfigProvider, Tooltip } from 'antd';
import { ColumnsType } from 'antd/es/table';
import Link from 'next/link';
import { explorer, mainExplorer } from 'config';
import { useRequest } from 'ahooks';
import { fetchAddressTransferList } from 'api/request';
import { getFormattedDate } from 'utils/time';
import { numberFormatter } from 'utils/numberFormatter';
import NoData from 'components/NoData';
import { checkIsOut } from 'utils/transaction';
import { isSideChain } from 'utils/chain';
import Symbol from 'components/Symbol';
import LoadingComponent from 'components/LoadingComponent';
import HashAddress from 'components/HashAddress';

const defaultPageSize = 20;
interface IRecordTableProps {
  address: string;
  isNft: boolean;
  currentChain?: string;
}
export default function RecordTable(props: IRecordTableProps) {
  const { address, currentChain, isNft } = props;
  const timeFormat = 'Timestamp';

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

  const columns: ColumnsType<IAddressTransferListDataListItem> = [
    {
      title: 'Txn Hash',
      dataIndex: 'transactionId',
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
                className="text-white !text-[12px]"
                address={hash}
                ignorePrefixSuffix
                preLen={13}
                endLen={0}
                iconColor="#989DA0"
                iconSize="14px"
                primaryIconColor={'#989DA0'}
                addressHoverColor={'white'}
                addressActiveColor={'white'}
                isHash={true}
              />
            </Link>
          </span>
        );
      },
    },
    {
      dataIndex: 'method',
      title: 'Method',
      render: (text) => {
        return (
          <Tooltip title={text} overlayClassName="table-item-tooltip__white">
            <div className="method-tag">{text}</div>
          </Tooltip>
        );
      },
    },
    {
      dataIndex: 'dateTime',
      title: <div className="time">{timeFormat}</div>,
      render: (text) => {
        console.log('text', text, timeFormat, getFormattedDate(text, timeFormat));
        return <div>{getFormattedDate(text, timeFormat)}</div>;
      },
    },
    {
      title: 'From',
      dataIndex: 'from',
      render(from, record) {
        return (
          <div className="from">
            <Link
              href={`${isSideChain(currentChain) ? explorer : mainExplorer}/address/${
                record?.from?.address
              }`}
              target="_blank"
            >
              <HashAddress
                className="text-white !text-[12px]"
                chain={currentChain as IHashAddressProps['chain']}
                address={record?.from?.address}
                preLen={8}
                endLen={9}
                iconColor="#989DA0"
                iconSize="14px"
                primaryIconColor={'#989DA0'}
                addressHoverColor={'white'}
                addressActiveColor={'white'}
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
      className: 'interactive-withto',
      render(to, record) {
        return (
          <div className="to flex interactive-withto-address">
            <Link
              href={`${isSideChain(currentChain) ? explorer : mainExplorer}/address/${
                record?.to?.address
              }`}
              target="_blank"
            >
              <HashAddress
                chain={currentChain as IHashAddressProps['chain']}
                className="text-white !text-[12px]"
                address={record?.to?.address}
                preLen={8}
                endLen={9}
                iconColor="#989DA0"
                iconSize="14px"
                primaryIconColor={'#989DA0'}
                addressHoverColor={'white'}
                addressActiveColor={'white'}
              />
            </Link>
          </div>
        );
      },
    },
    {
      title: 'Amount',
      dataIndex: 'quantity',
      render(quantity) {
        return `${numberFormatter(quantity)}`;
      },
    },
    {
      title: 'Token',
      dataIndex: 'symbol',
      align: 'right',
      render(symbol) {
        return (
          <Link
            href={`${isSideChain(currentChain) ? explorer : mainExplorer}/token/${symbol}`}
            target="_blank"
          >
            <Symbol symbol={symbol} className="treasury-token text-right justify-end" />
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
  useEffect(() => {
    run();
  }, [run, tableParams]);

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
