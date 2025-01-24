'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Tabs } from 'aelf-design';
import { message } from 'antd';
import { useSelector } from 'react-redux';
import useResponsive from 'hooks/useResponsive';
import HighCounCilTable from './components/HighCouncilTable';
// import DaoInfo from './components/DaoInfo';
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
  const {
    data: daoData,
    error: daoError,
    loading: daoLoading,
  } = useRequest(async () => {
    if (!aliasName && !props.daoId) {
      message.error('aliasName or daoId is required');
      return null;
    }
    return fetchDaoInfo({ chainId: curChain, alias: aliasName, daoId: props.daoId });
  });
  const { walletInfo } = useSelector((store: any) => store.userInfo);
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
        size="medium"
        type="primary"
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
          <div className="tab-all-proposals">
            <div className={`tab-all-proposals-header `}>
              <h3 className="title">Proposals</h3>
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

  const handleChangeHCparams = useCallback(() => {
    setTabKey(TabKey.HC);
  }, []);
  useEffect(() => {
    breadCrumb.updateDaoDetailPage(aliasName, daoData?.data?.metadata?.name);
  }, [aliasName, daoData?.data?.metadata?.name]);

  const tabCom = useMemo(() => {
    return (
      <Tabs
        size={isLG ? 'small' : 'middle'}
        activeKey={tabKey}
        items={tabItems}
        onChange={handleTabChange}
      />
    );
  }, [isLG, tabItems, tabKey]);

  return (
    <div className="dao-detail">
      <div>
        {/* <DaoInfo
          data={(daoData?.data ?? {}) as IDaoInfoData}
          isLoading={daoLoading}
          isError={!daoData?.data.id}
          onChangeHCParams={handleChangeHCparams}
          daoId={daoId}
          aliasName={aliasName}
        /> */}

        <div className="dao-detail-content network-dao">
          <div className={`dao-detail-content-left`}>
            <div className={`dao-detail-content-left-tab`}>{tabCom}</div>
            {tabKey === TabKey.PROPOSALS && <ExplorerProposalList />}
          </div>
        </div>
      </div>
    </div>
  );
}
