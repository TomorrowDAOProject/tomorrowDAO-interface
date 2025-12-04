import React from 'react';
import PageIndex from './_page';
import { curChain } from 'config';
import { getDaoTreasury } from 'api/request';
import { serverGetSSRData } from 'utils/ssr';
import { ServerError } from 'components/ServerError';

async function getInitData(aliasName: string) {
  const res = await getDaoTreasury({
    chainId: curChain,
    alias: aliasName as string,
  });
  return {
    treasuryAddress: res.data,
  };
}
export default async function Page(props: { params: { aliasName: string } }) {
  const aliasName = props.params.aliasName;
  const initData = await serverGetSSRData(() => getInitData(aliasName));
  if (initData.data) {
    return <PageIndex aliasName={aliasName} ssrData={initData.data} />;
  }
  return <ServerError error={initData.error} />;
}
