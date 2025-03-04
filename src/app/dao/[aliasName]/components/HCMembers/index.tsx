import React, { useEffect, useState } from 'react';
import { curChain } from 'config';
import { fetchHcMembers } from 'api/request';
import { useRequest } from 'ahooks';
import { EProposalActionTabs } from 'pageComponents/proposal-create/type';
import Members from 'components/Members';
import { useRouter } from 'next/navigation';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import { checkCreateProposal } from 'utils/proposal';
import { EDaoGovernanceMechanism } from 'app/(createADao)/create/type';
import { toast } from 'react-toastify';

interface IProps {
  daoRes?: IDaoInfoRes | null;
  aliasName: string;
  createProposalCheck?: (customRouter?: boolean) => Promise<boolean>;
}

const DaoMembers: React.FC<IProps> = (props) => {
  const { daoRes, aliasName } = props;
  const { walletInfo: wallet } = useConnectWallet();

  const daoData = daoRes?.data;
  const {
    data: daoMembersData,
    // error: transferListError,
    loading: daoMembersDataLoading,
    run,
  } = useRequest(
    () => {
      return fetchHcMembers({
        chainId: curChain,
        alias: aliasName,
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
      if (!daoRes) {
        toast.error('The DAO information is not available.');
        setCreateProposalLoading(false);
        return;
      }
      const checkRes = await checkCreateProposal(daoRes, wallet!.address);
      if (checkRes) {
        router.push(`/dao/${aliasName}/proposal/create?tab=${EProposalActionTabs.AddHcMembers}`);
      }
    } catch (error) {
      console.log('handleCreateProposal', error);
    } finally {
      setCreateProposalLoading(false);
    }
  };
  const totalCount = daoMembersData?.data?.length ?? 0;
  if (daoRes?.data?.governanceMechanism === EDaoGovernanceMechanism.Multisig) {
    return null;
  }
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
          <span className="text-[15px] text-white font-Montserrat mb-[4px]">
            {totalCount} Members
          </span>
        </>
      }
    />
  );
};

export default DaoMembers;
