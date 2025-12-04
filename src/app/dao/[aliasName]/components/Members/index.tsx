import React, { useEffect } from 'react';
import { curChain } from 'config';
import { fetchDaoMembers } from 'api/request';
import { useRequest } from 'ahooks';
import { EDaoGovernanceMechanism } from 'app/(createADao)/create/type';
import { EProposalActionTabs } from 'pageComponents/proposal-create/type';
import Members from 'components/Members';

interface IProps {
  daoRes?: IDaoInfoRes | null;
  aliasName: string;
  createProposalCheck?: (customRouter?: boolean) => Promise<boolean>;
}

const DaoMembers: React.FC<IProps> = (props) => {
  const { daoRes, aliasName } = props;
  const daoData = daoRes?.data;
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
        alias: aliasName,
      });
    },
    {
      manual: true,
    },
  );
  useEffect(() => {
    run();
  }, []);
  const lists = (daoMembersData?.data?.data ?? []).map((item) => item.address);
  if (daoRes?.data?.governanceMechanism === EDaoGovernanceMechanism.Token) {
    return null;
  }
  return (
    <Members
      lists={lists}
      isLoading={daoMembersDataLoading}
      totalCount={daoMembersData?.data?.totalCount ?? 0}
      loadMoreUrl={`/dao/${aliasName}/members`}
      managerUrl={`/dao/${aliasName}/proposal/create?tab=${EProposalActionTabs.AddMultisigMembers}`}
      descriptionNode={
        <>
          <h2 className="text-[15px] text-white mb-[4px]">
            {daoMembersData?.data?.totalCount} Members
          </h2>
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
