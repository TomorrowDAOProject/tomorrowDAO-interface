'use client';
import React from 'react';
import dynamicReq from 'next/dynamic';
import { Result, ConfigProvider } from 'antd';
import { allowPathMap } from '../constants/index';
import { useChainSelect } from 'hooks/useChainSelect';

const PageIndex = dynamicReq(() => import('./_page'), { ssr: false });

interface IProps {
  params: {
    path: string;
  };
}
export default function Page(props: IProps) {
  const path = props.params.path;
  if (!Object.keys(allowPathMap).includes(path)) {
    return (
      <Result status="404" title="404" subTitle="Sorry, the page you visited does not exist." />
    );
  }
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
      /> :  <PageIndex pagePath={path} />
      }
    </ConfigProvider>
  );
}
