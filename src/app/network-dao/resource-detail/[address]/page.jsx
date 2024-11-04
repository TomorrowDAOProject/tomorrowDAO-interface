'use client';
import React from 'react';
import { ConfigProvider, Result } from 'antd';
import dynamicReq from 'next/dynamic';
import { useChainSelect } from 'hooks/useChainSelect';
import { useParams } from 'next/navigation';
const PageIndex = dynamicReq(() => import('./_page'), { ssr: false });

export default function Page() {
  const { address } = useParams();
  const { isSideChain } = useChainSelect();
  return (
    <ConfigProvider prefixCls="antExplorer"
    theme={{
      token: {
        controlHeight: 32
      },
      components: {
        Input: {
          paddingBlock: 4
        },
      },
    }}
    >
      {
        isSideChain ? <Result
        className="px-4 lg:px-8"
        status="warning"
        title="The current content is only displayed under aelf MainChain, please switch the chain"
      /> :<PageIndex address={address} />
      }
      
    </ConfigProvider>
  );
}
