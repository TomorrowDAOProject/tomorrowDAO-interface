import React from 'react';
import PageIndex from 'pageComponents/home';
import { fetchDaoList } from 'api/request';
import { curChain } from 'config';
import { Metadata } from 'next';
import { serverGetSSRData } from 'utils/ssr';
import { ServerError } from 'components/ServerError/index';

async function getInitDaoList() {
  const [communityDaoRes, verifiedDaoRes] = await Promise.all([
    fetchDaoList({
      skipCount: 0,
      maxResultCount: 6,
      chainId: curChain,
      daoType: 1,
    }),
    fetchDaoList({
      skipCount: 0,
      maxResultCount: 1000,
      chainId: curChain,
      daoType: 0,
    }),
  ]);
  return {
    verifiedDaoList: verifiedDaoRes.data.items,
    daoList: communityDaoRes.data.items,
    daoHasData: communityDaoRes.data.items.length < communityDaoRes.data.totalCount,
  };
}

export default async function Page() {
  const initData = await serverGetSSRData(() => getInitDaoList());
  if (initData.data) {
    return <PageIndex ssrData={initData.data} />;
  }
  return <ServerError error={initData.error} />;
}
export const metadata: Metadata = {
  title: 'Explore TMRWDAO: Discover Decentralised Projects',
  description:
    'Dive into TMRWDAO’s ecosystem. Explore AI-powered, decentralised projects and connect with a global community driving DeFi and decentralised governance.',
};
