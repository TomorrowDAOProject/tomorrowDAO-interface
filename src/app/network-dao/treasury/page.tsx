'use client';
import React from 'react';
import { treasuryAccountAddress, networkDaoId } from 'config';
import { Result } from 'antd';
import { useChainSelect } from 'hooks/useChainSelect';
import dynamicReq from 'next/dynamic';
import { SkeletonList } from 'components/Skeleton';
const PageIndex = dynamicReq(() => import('pageComponents/treasury'), {
  ssr: false,
  loading: () => <SkeletonList />,
});

export default function Page() {
  const { isSideChain } = useChainSelect();
  return isSideChain ? <Result
  className="px-4 lg:px-8"
  status="warning"
  title="The current content is only displayed under aelf MainChain, please switch the chain"
/> : <PageIndex address={treasuryAccountAddress} title="Network DAO Treasury" isNetworkDao={true} daoId={networkDaoId}/>;
}
