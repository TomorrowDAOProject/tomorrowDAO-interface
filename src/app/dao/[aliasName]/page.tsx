import React from 'react';
import PageIndex from './_page';
import { fetchDaoInfo, fetchProposalList } from 'api/request';
import { curChain } from 'config';
import { DEFAULT_PAGESIZE } from './constants';
console.log('DEFAULT_PAGESIZE', DEFAULT_PAGESIZE);
interface Props {
  params: { aliasName: string };
}
async function getSSRData(aliasName: string) {
  const params: IProposalListReq = {
    alias: aliasName,
    chainId: curChain,
    skipCount: 0,
    maxResultCount: DEFAULT_PAGESIZE,
  };
  console.log('params 1', params, DEFAULT_PAGESIZE);
  const [proposalListRes, daoInfoRes] = await Promise.all([
    fetchProposalList(params),
    fetchDaoInfo({
      chainId: curChain,
      alias: aliasName,
    }),
  ]);
  return {
    daoInfo: daoInfoRes,
    ProposalListResData: proposalListRes.data,
  };
}
export default async function Page(props: Props) {
  const aliasName = props.params.aliasName;
  const initData = await getSSRData(aliasName);
  return <PageIndex aliasName={aliasName} ssrData={initData} />;
}
