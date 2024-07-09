import React, { useEffect, useState } from 'react';
import { curChain } from 'config';
import { fetchHcMembers } from 'api/request';
import { useRequest } from 'ahooks';
import { EProposalActionTabs } from 'app/proposal/deploy/[aliasName]/type';
import Members from 'components/Members';
import { useRouter } from 'next/navigation';

interface IProps {
  daoData: IDaoInfoData;
  aliasName?: string;
  createProposalCheck?: (customRouter?: boolean) => Promise<boolean>;
}

const DaoMembers: React.FC<IProps> = (props) => {
  const { daoData, aliasName, createProposalCheck } = props;

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
  const router = useRouter();
  const [createProposalLoading, setCreateProposalLoading] = useState(false);
  useEffect(() => {
    run();
  }, []);
  const handleCreateProposal = async () => {
    setCreateProposalLoading(true);
    try {
      const checkRes = await createProposalCheck?.(true);
      if (checkRes) {
        router.push(`/proposal/deploy/${aliasName}?tab=${EProposalActionTabs.AddHcMembers}`);
      }
    } catch (error) {
      console.log('handleCreateProposal', error);
    } finally {
      setCreateProposalLoading(false);
    }
  };
  const totalCount = daoMembersData?.data?.length ?? 0;
  return (
    <Members
      lists={daoMembersData?.data ?? []}
      isLoading={daoMembersDataLoading}
      totalCount={totalCount}
      loadMoreUrl={`/dao/${aliasName}/hc-members`}
      cardTitle="High Council Members"
      onCreatePoposal={handleCreateProposal}
      createButtonLoading={createProposalLoading}
      descriptionNode={
        <>
          <h2 className="card-title-lg mb-[4px]">{totalCount} Members</h2>
        </>
      }
    />
  );
};

export default DaoMembers;
