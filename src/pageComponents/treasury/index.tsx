'use client';
import React from 'react';
import { Divider, ConfigProvider, Tabs } from 'antd';
import { HashAddress, IHashAddressProps, Table } from 'aelf-design';
import TransferTable from './Table/Table';
import { TableProps } from 'antd/es/table';
import useTokenListData from 'hooks/useTokenListData';
import Symbol from 'components/Symbol';
import './index.css';
import Link from 'next/link';
import { explorer, mainExplorer } from 'config';
import { isSideChain } from 'utils/chain';
import TreasuryNoTxGuide from 'components/TreasuryNoTxGuide';
import { divDecimals } from 'utils/calculate';
import BigNumber from 'bignumber.js';
import { fetchAddressTransferList } from 'api/request';
import { useRequest } from 'ahooks';
import NoData from 'components/NoData';
interface ITransparentProps {
  address: string;
  isNetworkDao: boolean;
  daoId?: string;
  aliasName?: string;
  currentChain?: string;
  title: React.ReactNode;
}
export default function Transparent(props: ITransparentProps) {
  const { address, currentChain, title, isNetworkDao, daoId, aliasName } = props;
  const { tokenList, totalValueUSD, tokenListLoading } = useTokenListData({
    daoId,
    alias: aliasName,
    currentChain,
  });

  const columns: TableProps<ITreasuryAssetsResponseDataItem>['columns'] = [
    {
      title: 'Token',
      dataIndex: 'symbol',
      align: 'left',
      className: 'treasury-table-column-clear-pl',
      render(token) {
        return (
          <span className="token-pair">
            <Symbol symbol={token} />
          </span>
        );
      },
    },
    {
      title: 'Balance',
      dataIndex: 'amount',
      className: 'table-header-sorter-left',
      showSorterTooltip: false,
      render(amount, record) {
        return (
          <span>
            {divDecimals(amount, record.decimal).toFormat()} {record.symbol}
          </span>
        );
      },
    },
    {
      title: 'Value',
      dataIndex: 'usdValue',
      defaultSortOrder: 'descend',
      // sortIcon,
      sorter: (a, b) => Number(a.usdValue) - Number(b.usdValue),
      render(value) {
        return (
          <span>$ {value === 0 ? value : BigNumber(value).toFormat(2, BigNumber.ROUND_FLOOR)}</span>
        );
      },
    },
  ];
  const { data: transferList, loading: queryTransferListLoading } = useRequest(async () => {
    const pageQuery = {
      pageSize: 20,
      pageNum: 1,
    };
    const params: IAddressTransferListReq = {
      address,
      ...pageQuery,
    };
    const [tokenTransfer, nftTransfer] = await Promise.all([
      fetchAddressTransferList(params, currentChain),
      fetchAddressTransferList(
        {
          ...params,
          isNft: true,
        },
        currentChain,
      ),
    ]);
    return tokenTransfer.data.total + nftTransfer.data.total > 0;
  });
  const isShowGuide = !transferList && !queryTransferListLoading && !isNetworkDao;
  return (
    <div className="treasury-page-content">
      <div className="card-shape pt-6">
        <div className="flex justify-between lg:flex-row flex-col card-px">
          <span className="text-Primary-Text leading-[32px] font-medium text-[24px]">{title}</span>
          <span className="flex lg:flex-row flex-col">
            <span className="text-Neutral-Secondary-Text leading-[22px] text-[14px] flex pr-[4px]">
              Treasury Assets Address:
            </span>
            <Link
              href={`${isSideChain(currentChain) ? explorer : mainExplorer}/address/${address}`}
              target="_blank"
            >
              <HashAddress
                className="treasury-address"
                address={address}
                chain={currentChain as IHashAddressProps['chain']}
                preLen={8}
                endLen={9}
              />
            </Link>
          </span>
        </div>
        <Divider className="mb-2 lg:mb-6" />
        {isShowGuide ? (
          <div className="pt-[16px] mb-[64px]">
            <TreasuryNoTxGuide address={address} />
          </div>
        ) : (
          <>
            <div className="card-px">
              <div className="text-Neutral-Secondary-Text text-[14px] flex items-center font-500 h-[22px]">
                Treasury Balance
              </div>
              <div className=" text-neutralTitle text-[24px] flex items-center font-500 h-[32px] mt-[8px]">
                $ {totalValueUSD}
              </div>
            </div>
            <div className="mt-6">
              <ConfigProvider renderEmpty={() => <NoData />}>
                <Table
                  className="full-table treasury-token-list-table table-td-sm table-header-normal"
                  columns={columns as any}
                  dataSource={tokenList ?? []}
                  loading={tokenListLoading}
                  scroll={{
                    x: true,
                  }}
                ></Table>
              </ConfigProvider>
            </div>
          </>
        )}

        <div></div>
      </div>
      {!isShowGuide && (
        <div className="mt-[20px] card-shape pt-[20px] full-table-wrap">
          <h2 className="pb-[20px] card-px">All Income and Expenses</h2>
          <Tabs
            defaultActiveKey="1"
            size="small"
            className="treasury-tab"
            items={[
              {
                key: '1',
                label: 'Token Transfers',
                children: (
                  <TransferTable address={address} currentChain={currentChain} isNft={false} />
                ),
              },
              {
                key: '2',
                label: 'NFT Transfers',
                children: (
                  <TransferTable address={address} currentChain={currentChain} isNft={true} />
                ),
              },
            ]}
          />
        </div>
      )}
    </div>
  );
}
