'use client';
import React, { useEffect } from 'react';
import { memo } from 'react';
import './index.css';
import HeaderInfo from './components/HeaderInfo';
import VoteInfo from './components/VoteInfo';
import StatusInfo from './components/StatusInfo';
import VoteResultTable from './components/VoteResultTable';
import { ProposalTab } from './components/ProposalTab';
import { useParams } from 'next/navigation';
import ErrorResult from 'components/ErrorResult';
import breadCrumb from 'utils/breadCrumb';
import Discussion from './components/Discussion';
import { useRouter } from 'next/navigation';
import { ReactComponent as ArrowRight } from 'assets/revamp-icon/arrow-right.svg';

interface IProposalDetailsProps {
  ssrData: {
    proposalDetailData: IProposalDetailData;
  };
}
const ProposalDetails = (props: IProposalDetailsProps) => {
  const { proposalDetailData } = props.ssrData;
  const { proposalId } = useParams<{ proposalId: string }>();
  const daoId = proposalDetailData?.daoId ?? '';
  const aliasName = proposalDetailData?.alias;
  const router = useRouter();

  useEffect(() => {
    if (aliasName) {
      breadCrumb.updateProposalInformationPage(aliasName);
    }
  }, [aliasName]);

  useEffect(() => {
    console.log('ssrData', props.ssrData);
  }, []);
  console.log('proposalDetailData', proposalDetailData);

  return (
    <div className="proposal-details-wrapper">
      {!proposalDetailData.daoId ? (
        <ErrorResult />
      ) : (
        <>
          <div className="text-white font-Montserrat flex items-center gap-2">
            <span
              className="text-lightGrey text-[15px] cursor-pointer"
              onClick={() => router.push('/')}
            >
              Home
            </span>
            <ArrowRight />
            <span
              className="text-lightGrey text-[15px] cursor-pointer"
              onClick={() => router.push('/explore')}
            >
              Explore
            </span>
            <ArrowRight />
            <span className="text-[14px]">{proposalDetailData?.alias}</span>
          </div>
          {proposalDetailData && (
            <HeaderInfo proposalDetailData={proposalDetailData} proposalId={proposalId} />
          )}
          <VoteInfo proposalDetailData={proposalDetailData} daoId={daoId} />

          <div className="border border-fillBg8 border-solid rounded-lg bg-darkBg">
            <ProposalTab proposalDetailData={proposalDetailData} />
          </div>

          <StatusInfo proposalDetailData={proposalDetailData} />
          <VoteResultTable daoId={proposalDetailData.daoId} proposalId={proposalId} />
          {proposalDetailData && (
            <Discussion proposalId={proposalId} daoId={proposalDetailData?.daoId ?? ''} />
          )}
        </>
      )}
    </div>
  );
};

export default memo(ProposalDetails);
