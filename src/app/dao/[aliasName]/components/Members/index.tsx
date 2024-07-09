import React, { useEffect, useRef, useState } from 'react';
import { Form } from 'antd';
import { useWebLogin } from 'aelf-web-login';
import { curChain, explorer } from 'config';
import { fetchDaoMembers } from 'api/request';
import { useRequest } from 'ahooks';
import { SkeletonLine } from 'components/Skeleton';
import { Button, HashAddress } from 'aelf-design';
import { EDaoGovernanceMechanism } from 'app/(createADao)/create/type';
import Link from 'next/link';
import './index.css';
import { EProposalActionTabs } from 'app/proposal/deploy/[aliasName]/type';

interface IProps {
  daoData: IDaoInfoData;
  aliasName?: string;
  createProposalCheck?: (customRouter?: boolean) => Promise<boolean>;
}
const LoadCount = 5;

const DaoMembers: React.FC<IProps> = (props) => {
  const { daoData, aliasName, createProposalCheck } = props;
  const {
    data: daoMembersData,
    // error: transferListError,
    loading: daoMembersDataLoading,
    run,
  } = useRequest(
    () => {
      return fetchDaoMembers({
        SkipCount: 0,
        MaxResultCount: 6,
        ChainId: curChain,
        DAOId: daoData?.id,
      });
    },
    {
      manual: true,
    },
  );
  const { wallet } = useWebLogin();
  useEffect(() => {
    run();
  }, []);
  return (
    <Members
      lists={lists}
      isLoading={daoMembersDataLoading}
      totalCount={daoMembersData?.data?.totalCount ?? 0}
      loadMoreUrl={`/dao/${aliasName}/members`}
      managerUrl={`/proposal/deploy/${aliasName}?tab=${EProposalActionTabs.AddMultisigMembers}`}
      descriptionNode={
        <>
          <h2 className="card-title-lg mb-[4px]">{daoMembersData?.data?.totalCount} Members</h2>
          <span className="dao-members-normal-text text-Neutral-Secondary-Text">
            {daoData?.governanceMechanism === EDaoGovernanceMechanism.Token
              ? 'Token-based'
              : 'Wallet-based'}
          </span>
        </>
      }
    />
  );
};

export default DaoMembers;
