'use client';
import React, { useMemo } from 'react';
import BigNumber from 'bignumber.js';
import { Divider, ConfigProvider } from 'antd';
import { Table } from 'aelf-design';
import useTokenListData, { ITokenListItem } from '../../../hooks/useTokenListData';
import BoxWrapper from '../../proposal/[proposalId]/components/BoxWrapper';
import TransferTable from './Table/Table';
import { ColumnsType } from 'antd/es/table';
import './index.css';

export default function Transparent() {
  const {
    tokenList,
    // tokenPriceData,
    tokenListLoading,
  } = useTokenListData();
  const totalValueUSD = useMemo(() => {
    let sum = BigNumber(0);
    for (const item of tokenList) {
      if (item.valueUSD) {
        sum = sum.plus(item.valueUSD);
      }
    }
    return sum.decimalPlaces(8, BigNumber.ROUND_DOWN).toFormat();
  }, [tokenList]);
  const columns: ColumnsType<ITokenListItem> = [
    {
      title: 'token',
      dataIndex: 'symbol',
      align: 'left',
      className: 'treasury-token-column',
    },
    {
      title: 'balance',
      dataIndex: 'balance',
      defaultSortOrder: 'descend',
      sorter: (a, b) => Number(a.balance) - Number(b.balance),
      className: 'table-header-sorter-left',
      showSorterTooltip: false,
    },
    {
      title: 'value',
      dataIndex: 'valueUSD',
      render(value) {
        return <span>{value?.decimalPlaces?.(8, BigNumber.ROUND_DOWN)?.toFormat() ?? '-'}</span>;
      },
    },
  ];
  return (
    <div>
      <BoxWrapper>
        Network DAO Transparency Hub
        <Divider className="mb-2 lg:mb-6" />
        <div>
          <div className="text-Neutral-Secondary-Text text-[14px] font-not-italic font-500 h-[22px]">
            Treasury Balance
          </div>
          <div className="self-stretch text-neutralTitle text-[24px] font-not-italic font-500 h-[32px] mt-[8px]">
            $ {totalValueUSD}
          </div>
        </div>
        <div>
          <ConfigProvider>
            <Table
              columns={columns as any}
              dataSource={tokenList ?? []}
              loading={tokenListLoading}
            ></Table>
          </ConfigProvider>
        </div>
        <div></div>
      </BoxWrapper>
      <BoxWrapper className="mt-[20px]">
        <TransferTable />
      </BoxWrapper>
    </div>
  );
}
