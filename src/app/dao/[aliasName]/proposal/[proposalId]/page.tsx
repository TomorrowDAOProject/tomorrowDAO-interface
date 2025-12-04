import React from 'react';
import PageIndex from 'pageComponents/proposal-detail';
import { curChain } from 'config';
import { fetchProposalDetail } from 'api/request';
import { serverGetSSRData } from 'utils/ssr';
import { ServerError } from 'components/ServerError';

async function getInitData(proposalId: string) {
  const params: IProposalDetailReq = {
    proposalId,
    chainId: curChain,
  };
  const res = await fetchProposalDetail(params);
  return {
    proposalDetailData: res.data,
  };
}
interface IPageProps {
  params: {
    proposalId: string;
  };
}
export default async function Page(props: IPageProps) {
  const proposalId = props.params.proposalId;
  const initData = await serverGetSSRData(() => getInitData(proposalId));
  if (initData.data) {
    return <PageIndex ssrData={initData.data} />;
  }
  return <ServerError error={initData.error} />;
}
