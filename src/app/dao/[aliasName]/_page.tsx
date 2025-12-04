'use client';
import React from 'react';
import DaoDetail from './TmrwDaoDetails';

interface Props {
  ssrData: {
    daoInfo: IDaoInfoRes;
    ProposalListResData: IProposalListResData;
  };
  aliasName: string;
}
export default function DaoDetailPage(props: Props) {
  const { ssrData } = props;
  return <DaoDetail aliasName={props.aliasName} ssrData={ssrData} />;
}
