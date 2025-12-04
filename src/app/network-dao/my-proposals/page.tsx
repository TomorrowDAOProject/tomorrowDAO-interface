'use client';
import dynamicReq from 'next/dynamic';
import React from 'react';
import { ConfigProvider } from 'antd';
const PageIndex = dynamicReq(() => import('./_page'), { ssr: false });

export default function Page() {
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
    <PageIndex />
  </ConfigProvider>)
}
