import React, { useEffect } from 'react';
import { curChain } from 'config';
import { fetchHcMembers } from 'api/request';
import { useRequest } from 'ahooks';
import { EProposalActionTabs } from 'app/proposal/deploy/[aliasName]/type';
import Members from 'components/Members';

interface IProps {
  daoData: IDaoInfoData;
  aliasName?: string;
}

const DaoMembers: React.FC<IProps> = (props) => {
  const { daoData, aliasName } = props;

  const {
    data: daoMembersData,
    // error: transferListError,
    loading: daoMembersDataLoading,
    run,
  } = useRequest(
    () => {
      return fetchHcMembers({
        chainId: curChain,
        daoId: daoData?.id,
      });
    },
    {
      manual: true,
    },
  );
  useEffect(() => {
    run();
  }, []);
  const totalCount = daoMembersData?.data?.length ?? 0;
  return (
    <Members
      lists={daoMembersData?.data ?? []}
      isLoading={daoMembersDataLoading}
      totalCount={totalCount}
      managerUrl={`/proposal/deploy/${aliasName}?tab=${EProposalActionTabs.AddHcMembers}`}
      loadMoreUrl={`/dao/${aliasName}/hc-members`}
      descriptionNode={
        <>
          <h2 className="card-title-lg mb-[4px]">{totalCount} Members</h2>
          <span className="dao-members-normal-text text-Neutral-Secondary-Text">high Council</span>
        </>
      }
    />
  );
};

export default DaoMembers;
