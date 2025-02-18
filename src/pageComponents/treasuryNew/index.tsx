'use client';
import React, { useState } from 'react';
import { Divider, ConfigProvider, Tabs } from 'antd';
import { IHashAddressProps, Table } from 'aelf-design';
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
import LoadingComponent from 'components/LoadingComponent';
import HashAddress from 'components/HashAddress';
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
        console.log('token', token);
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
      showSorterTooltip: false,
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

  const [activeIndex, setActiveIndex] = useState(0);
  return (
    <div className="treasury-page-content">
      <div className="card-shape border-solid border-[1px] border-fillBg8 rounded-lg bg-darkBg mb-[25px]">
        <div className="flex justify-between lg:flex-row flex-col border-0 border-b border-solid border-fillBg8 xl:px-[32px] lg:px-[32px] md:px-[32px] px-[22px] py-[17px]">
          <span className="text-white leading-normal font-Unbounded text-[15px]">{title}</span>
          <span className="flex lg:items-center lg:flex-row flex-col">
            <span className="text-lightGrey text-[12px] pr-[4px] font-Montserrat">
              Treasury Assets Address:
            </span>
            <Link
              href={`${isSideChain(currentChain) ? explorer : mainExplorer}/address/${address}`}
              target="_blank"
            >
              <HashAddress
                className="treasury-address text-[12px] text-white"
                address={address}
                chain={currentChain as IHashAddressProps['chain']}
                preLen={8}
                endLen={9}
                iconColor="#989DA0"
                iconSize="18px"
                primaryIconColor={'#989DA0'}
                addressHoverColor={'white'}
                addressActiveColor={'white'}
              />
            </Link>
          </span>
        </div>
        {isShowGuide ? (
          <div className="pt-[16px] mb-[64px]">
            <TreasuryNoTxGuide address={address} />
          </div>
        ) : (
          <div className="xl:px-[38px] lg:px-[38px] md:px-[38px] px-[22px] py-[24px]">
            <div className="text-lightGrey text-[13px]">
              <div className="text-lightGrey text-[14px] flex items-center h-[22px]">
                Treasury Balance
              </div>
              <div className="text-white text-[18px] flex items-center font-Montserrat font-medium h-[32px] mt-[8px]">
                $ {totalValueUSD}
              </div>
            </div>
            <div className="mt-6">
              <ConfigProvider renderEmpty={() => <NoData />}>
                <Table
                  className="full-table treasury-token-list-table table-td-sm table-header-normal no-mask"
                  columns={columns as any}
                  dataSource={tokenList ?? []}
                  loading={{
                    spinning: tokenListLoading,
                    indicator: (
                      <LoadingComponent
                        className="-my-3 md:my-0 scale-[0.7] md:scale-[1.0]"
                        size={36}
                        strokeWidth={4}
                      />
                    ),
                  }}
                  scroll={{
                    x: true,
                  }}
                ></Table>
              </ConfigProvider>
            </div>
          </div>
        )}

        <div></div>
      </div>
      {!isShowGuide && (
        <div className="mt-[26px] full-table-wrap border-solid border-[1px] border-fillBg8 rounded-lg bg-darkBg mb-[25px]">
          <div className="text-white leading-normal font-Unbounded text-[15px] border-0 border-b border-solid border-fillBg8 xl:px-[32px] lg:px-[32px] md:px-[32px] px-[22px] py-[17px]">
            All Income and Expenses
          </div>
          <div className="flex items-center gap-2 font-Montserrat border-0 border-b border-solid border-fillBg8 cursor-pointer">
            <div
              className={`text-white text-[14px] py-[17px] px-[32px] ${
                activeIndex == 0 ? 'border-0 border-b-2 border-solid border-mainColor' : ''
              }`}
              onClick={() => setActiveIndex(0)}
            >
              Token Transfers
            </div>
            <div
              className={`text-white text-[14px] py-[17px] px-[32px] ${
                activeIndex == 1 ? 'border-0 border-b-2 border-solid border-mainColor' : ''
              }`}
              onClick={() => setActiveIndex(1)}
            >
              NFT Transfers
            </div>
          </div>

          {activeIndex == 0 && (
            <div className="xl:px-[38px] lg:px-[38px] md:px-[38px] px-[22px] py-[24px]">
              <TransferTable address={address} currentChain={currentChain} isNft={false} />
            </div>
          )}
          {activeIndex == 1 && (
            <div className="xl:px-[38px] lg:px-[38px] md:px-[38px] px-[22px] py-[24px]">
              <TransferTable address={address} currentChain={currentChain} isNft={true} />
            </div>
          )}
          {/* <Tabs
            defaultActiveKey="1"
            size="small"
            className="treasury-tab"
            items={[
              {
                key: '1',
                label: 'Token Transfers',
                children: (
                 
                ),
              },
              {
                key: '2',
                label: 'NFT Transfers',
                children: (
                  
                ),
              },
            ]}
          /> */}
        </div>
      )}
    </div>
  );
}
