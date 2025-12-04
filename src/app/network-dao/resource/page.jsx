'use client';
import React from 'react';
import { ConfigProvider, Result } from 'antd';
import { useChainSelect } from 'hooks/useChainSelect';
import dynamicReq from 'next/dynamic';
const PageIndex = dynamicReq(() => import('./_page'), { ssr: false });

export default function Page(props) {
  const { isSideChain } = useChainSelect();
    return (<ConfigProvider prefixCls="antExplorer"
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
       /> :  <PageIndex />
    }
    </ConfigProvider>)
}