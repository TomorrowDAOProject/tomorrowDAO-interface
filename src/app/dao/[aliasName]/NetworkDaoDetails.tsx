'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import useResponsive from 'hooks/useResponsive';
import HighCounCilTable from './components/HighCouncilTable';
import { useRequest } from 'ahooks';
import { TabKey } from './type';
import { fetchDaoInfo } from 'api/request';
import { curChain } from 'config';
import useNetworkDaoRouter from 'hooks/useNetworkDaoRouter';
import { ButtonCheckLogin } from 'components/ButtonCheckLogin';
import breadCrumb from 'utils/breadCrumb';
import ExplorerProposalList, {
  ExplorerProposalListFilter,
} from '../../network-dao/ExplorerProposalList';
import { useChainSelect } from 'hooks/useChainSelect';
import getChainIdQuery from 'utils/url';
import './page.css';
import Tabs from 'components/Tabs';
import { toast } from 'react-toastify';

interface IProps {
  daoId?: string;
  aliasName?: string;
  isNetworkDAO?: boolean;
}

export default function DeoDetails(props: IProps) {
  const { aliasName } = props;
  const { isLG } = useResponsive();

  const { isMainChain } = useChainSelect();
  const [tabKey, setTabKey] = useState(TabKey.PROPOSALS);
  const networkDaoRouter = useNetworkDaoRouter();

  // if is network dao, init request is required
  const { data: daoData, loading: daoLoading } = useRequest(async () => {
    if (!aliasName && !props.daoId) {
      toast.error('aliasName or daoId is required');
      return null;
    }
    return fetchDaoInfo({ chainId: curChain, alias: aliasName, daoId: props.daoId });
  });
  const [createProposalLoading, setCreateProposalLoading] = useState(false);
  const handleCreateProposalRef = useRef<(customRouter?: boolean) => Promise<boolean>>();
  const handleCreateProposal = async () => {
    if (!daoData) return false;
    setCreateProposalLoading(true);
    setCreateProposalLoading(false);
    const chainIdQuery = getChainIdQuery();
    networkDaoRouter.push(`/apply?${chainIdQuery.chainIdQueryString}`);
    return true;
  };
  handleCreateProposalRef.current = handleCreateProposal;
  const tabItems = useMemo(() => {
    const CreateButton = (
      <ButtonCheckLogin
        type="primary"
        size="small"
        loading={createProposalLoading}
        onClick={() => {
          handleCreateProposalRef.current?.();
        }}
        disabled={daoLoading}
      >
        Create a Proposal
      </ButtonCheckLogin>
    );
    const items = [
      {
        key: TabKey.PROPOSALS,
        label: 'All Proposals',
        children: (
          <div className="py-6 px-[38px]">
            <div className="flex justify-between items-center mb-[15px]">
              <h3 className="text-[15px] font-Unbounded font-light text-white -tracking-[0.6px]">
                Proposals
              </h3>
              {CreateButton}
            </div>
            <ExplorerProposalListFilter />
          </div>
        ),
      },
    ];
    if (isMainChain) {
      items.push({
        key: TabKey.HC,
        label: 'High Council',
        children: <HighCounCilTable />,
      });
    }
    if (!isLG) {
      return items;
    } else {
      const finalItems = [...items];
      return finalItems;
    }
  }, [createProposalLoading, daoLoading, isMainChain, isLG]);

  const handleTabChange = (key: string) => {
    setTabKey(key as TabKey);
  };

  useEffect(() => {
    breadCrumb.updateDaoDetailPage(aliasName, daoData?.data?.metadata?.name);
  }, [aliasName, daoData?.data?.metadata?.name]);

  const tabCom = useMemo(() => {
    return <Tabs activeKey={tabKey} items={tabItems} onChange={handleTabChange} />;
  }, [tabItems, tabKey]);

  return (
    <>
      <div className="bg-darkBg mb-[26px] border border-fillBg8 border-solid rounded-[8px]">
        {tabCom}
      </div>
      {tabKey === TabKey.PROPOSALS && <ExplorerProposalList />}
    </>
  );
}
