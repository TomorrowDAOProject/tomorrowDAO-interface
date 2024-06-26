'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Tabs, Typography, FontWeightEnum, Pagination } from 'aelf-design';
import { Form, message, Empty } from 'antd';
import { useSelector } from 'react-redux';
import { SkeletonList } from 'components/Skeleton';
import useResponsive from 'hooks/useResponsive';
import ProposalsItem from './components/ProposalsItem';
import HighCounCilTable from './components/HighCouncilTable';
import DaoInfo from './components/DaoInfo';
import ExecutdProposals from './components/ExecutdProposals';
import MyRecords from './components/MyRecords';
import MyInfo from './components/MyInfo';
import Filter from './components/Filter';
import Treasury from './components/Treasury';
import { useRequest, usePrevious } from 'ahooks';
import { GetBalanceByContract, GetTokenInfo } from 'contract/callContract';
import { IProposalTableParams, TabKey } from './type';
import LinkNetworkDao from 'components/LinkNetworkDao';
import { fetchDaoInfo, fetchProposalList } from 'api/request';
import { curChain } from 'config';
import { ALL, TMRWCreateProposal } from './constants';
import Link from 'next/link';
import ErrorResult from 'components/ErrorResult';
import useNetworkDaoRouter from 'hooks/useNetworkDaoRouter';
import { useRouter } from 'next/navigation';
import { divDecimals } from 'utils/calculate';
import { ButtonCheckLogin } from 'components/ButtonCheckLogin';
import breadCrumb from 'utils/breadCrumb';
import { eventBus, ResultModal } from 'utils/myEvent';
import { CommonOperationResultModalType } from 'components/CommonOperationResultModal';
import { INIT_RESULT_MODAL_CONFIG } from 'components/ResultModal';
import useUpdateHeaderDaoInfo from 'hooks/useUpdateHeaderDaoInfo';
import ExplorerProposalList, {
  ExplorerProposalListFilter,
} from '../../network-dao/ExplorerProposalList';
import { useChainSelect } from 'hooks/useChainSelect';
import getChainIdQuery from 'utils/url';
import DaoMembers from './components/Members';
import './page.css';
import { EDaoGovernanceMechanism } from 'app/(createADao)/create/type';

interface IProps {
  daoId: string;
  isNetworkDAO?: boolean;
}
export default function DeoDetails(props: IProps) {
  const { daoId, isNetworkDAO } = props;
  const { isLG } = useResponsive();

  const { isMainChain } = useChainSelect();
  const [form] = Form.useForm();
  // todo
  const [tabKey, setTabKey] = useState(TabKey.PROPOSALS);

  const {
    data: daoData,
    error: daoError,
    loading: daoLoading,
  } = useRequest(async () => {
    if (!daoId) {
      message.error('daoId is required');
      return null;
    }
    return fetchDaoInfo({ daoId, chainId: curChain });
  });
  const { walletInfo } = useSelector((store: any) => store.userInfo);
  // const [daoDetail, setDaoDetail] = useState<IDaoDetail>(data);
  // const [proposalList, setProposalList] = useState<IProposalsItem[]>(list);

  const [tableParams, setTableParams] = useState<IProposalTableParams>({
    content: '',
    pagination: {
      current: 1,
      pageSize: 20,
      total: 0,
    },
  });
  const previousTableParams = usePrevious(tableParams);
  useUpdateHeaderDaoInfo(daoId);
  const fetchProposalListWithParams = async (preData: IProposalListRes | null) => {
    const { proposalType, proposalStatus } = tableParams;
    const params: IProposalListReq = {
      daoId: daoId,
      chainId: curChain,
      skipCount:
        ((tableParams.pagination.current ?? 1) - 1) * (tableParams.pagination.pageSize ?? 20),
      maxResultCount: tableParams.pagination.pageSize,
      isNetworkDAO,
    };
    // skip ALL
    if (proposalType !== ALL && proposalType) {
      params.proposalType = proposalType;
    }
    // skip ALL
    if (proposalStatus !== ALL && proposalStatus) {
      params.proposalStatus = proposalStatus;
    }
    // search content
    if (tableParams.content) {
      params.content = tableParams.content;
    }
    // when pagesize change pagination.current will be 1
    if (tableParams.pagination.current !== 1 && preData?.data) {
      const prePageNo = previousTableParams?.pagination.current;
      const currentPageNo = tableParams.pagination.current;
      if (
        typeof prePageNo === 'number' &&
        typeof currentPageNo === 'number' &&
        prePageNo > currentPageNo
      ) {
        params.pageInfo = {
          ...(preData.data.previousPageInfo ?? {}),
        };
      } else {
        params.pageInfo = {
          ...(preData.data.nextPageInfo ?? {}),
        };
      }
    }
    const listRes = await fetchProposalList(params);
    return listRes;
  };
  const [createProposalLoading, setCreateProposalLoading] = useState(false);
  const {
    data: proposalData,
    error: proposalError,
    loading: proposalLoading,
    run,
  } = useRequest(fetchProposalListWithParams, {
    manual: true,
  });
  const previousProposalDataRef = useRef<IProposalListRes | undefined>();
  const handleCreateProposalRef = useRef<(customRouter?: boolean) => Promise<boolean>>();
  previousProposalDataRef.current = proposalData;

  const networkDaoRouter = useNetworkDaoRouter();
  const router = useRouter();
  const rightContent = useMemo(() => {
    return <MyInfo daoId={daoId} />;
  }, [daoId]);

  const handleCreateProposal = async (customRouter?: boolean) => {
    setCreateProposalLoading(true);
    const [balanceInfo, tokenInfo] = await Promise.all([
      GetBalanceByContract(
        {
          symbol: daoData?.data.governanceToken || 'ELF',
          owner: walletInfo.address,
        },
        { chain: curChain },
      ),
      GetTokenInfo(
        {
          symbol: daoData?.data.governanceToken || 'ELF',
        },
        { chain: curChain },
      ),
    ]);
    const proposalThreshold = daoData?.data?.governanceSchemeThreshold?.proposalThreshold;
    const decimals = tokenInfo?.decimals;
    setCreateProposalLoading(false);
    if (
      proposalThreshold &&
      balanceInfo.balance < proposalThreshold &&
      daoData?.data?.governanceToken
    ) {
      const requiredToken = divDecimals(proposalThreshold, decimals).toString();
      eventBus.emit(ResultModal, {
        open: true,
        type: CommonOperationResultModalType.Warning,
        primaryContent: 'Insufficient Governance Tokens',
        secondaryContent: (
          <div>
            {/* <div>Minimum Token Proposal Requirement: {requiredToken}</div> */}
            <div>
              Your Governance Token:{' '}
              {divDecimals(balanceInfo.balance, tokenInfo?.decimals || '8').toNumber()}
            </div>
            <div>
              Can&apos;t create a proposal, you need hold at least {requiredToken}{' '}
              {daoData?.data.governanceToken}. Transfer tokens to your wallet.
            </div>
          </div>
        ),
        footerConfig: {
          buttonList: [
            {
              children: <span>OK</span>,
              onClick: () => {
                eventBus.emit(ResultModal, INIT_RESULT_MODAL_CONFIG);
              },
            },
          ],
        },
      });
      return false;
    }
    if (customRouter) {
      return true;
    }
    if (isNetworkDAO) {
      const chainIdQuery = getChainIdQuery();
      networkDaoRouter.push(`/apply?${chainIdQuery.chainIdQueryString}`);
    } else {
      router.push(`/proposal/deploy/${daoId}`);
    }
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
          <div className={`tab-all-proposals `}>
            <div className={`tab-all-proposals-header `}>
              <h3 className="title">Proposals</h3>
              {CreateButton}
            </div>
            {!isNetworkDAO && (
              <Filter form={form} tableParams={tableParams} onChangeTableParams={setTableParams} />
            )}
            {isNetworkDAO && <ExplorerProposalListFilter />}
          </div>
        ),
      },
    ];
    if (daoData?.data.isNetworkDAO && isMainChain) {
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
      if (!daoData?.data.isNetworkDAO) {
        finalItems.push(
          {
            key: TabKey.MYINFO,
            label: 'My Info',
            children: rightContent,
          },
          {
            key: TabKey.TREASURY,
            label: 'Treasury',
            children: daoData?.data ? (
              <Treasury
                daoData={daoData.data}
                createProposalCheck={handleCreateProposalRef.current}
              />
            ) : (
              <span></span>
            ),
          },
        );
        if (daoData?.data?.governanceMechanism === EDaoGovernanceMechanism.Multisig) {
          finalItems.push({
            key: TabKey.DAOMEMBERS,
            label: 'Members',
            children: daoData?.data ? <DaoMembers daoData={daoData.data} /> : <span></span>,
          });
        }
      }
      return finalItems;
    }
  }, [
    createProposalLoading,
    daoLoading,
    isNetworkDAO,
    form,
    tableParams,
    daoData?.data,
    isMainChain,
    isLG,
    rightContent,
  ]);

  const pageChange = useCallback((page: number) => {
    setTableParams((state) => {
      return {
        ...state,
        pagination: {
          ...state.pagination,
          current: page,
        },
      };
    });
  }, []);

  const pageSizeChange = useCallback((page: number, pageSize: number) => {
    setTableParams((state) => {
      return {
        ...state,
        pagination: {
          ...state.pagination,
          current: page,
          pageSize,
        },
      };
    });
  }, []);

  const handleTabChange = (key: string) => {
    setTabKey(key as TabKey);
  };

  const handleChangeHCparams = useCallback(() => {
    setTabKey(TabKey.HC);
  }, []);
  useEffect(() => {
    breadCrumb.updateDaoDetailPage(daoId, daoData?.data?.metadata?.name);
  }, [daoId, daoData?.data?.metadata?.name]);

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

  useEffect(() => {
    run(previousProposalDataRef.current ?? null);
  }, [tableParams, run]);

  return (
    <div className="dao-detail">
      <div>
        <DaoInfo
          data={daoData?.data}
          isLoading={daoLoading}
          isError={daoError}
          onChangeHCParams={handleChangeHCparams}
          daoId={daoId}
        />

        <div className="dao-detail-content">
          <div className={`dao-detail-content-left`}>
            <div className={`dao-detail-content-left-tab`}>{tabCom}</div>
            {tabKey === TabKey.PROPOSALS && !isNetworkDAO && (
              <div>
                {proposalLoading ? (
                  <SkeletonList />
                ) : proposalError ? (
                  <div>
                    <ErrorResult />
                  </div>
                ) : proposalData?.data?.items?.length ? (
                  proposalData?.data?.items?.map((item) => {
                    // tmrw
                    if (item.proposalSource === TMRWCreateProposal) {
                      if (isNetworkDAO) {
                        return (
                          <LinkNetworkDao
                            key={item.proposalId}
                            href={`/proposal-detail-tmrw/${item.proposalId}`}
                          >
                            <ProposalsItem data={item} />
                          </LinkNetworkDao>
                        );
                      }
                      return (
                        <Link key={item.proposalId} href={`/proposal/${item.proposalId}`}>
                          <ProposalsItem data={item} />
                        </Link>
                      );
                    }
                    return (
                      <LinkNetworkDao
                        key={item.proposalId}
                        href={{
                          pathname: `/proposal-detail`,
                          query: {
                            proposalId: item.proposalId,
                          },
                        }}
                      >
                        <ProposalsItem data={item} />
                      </LinkNetworkDao>
                    );
                  })
                ) : (
                  <Empty description="No results found" />
                )}
                <Pagination
                  {...tableParams.pagination}
                  total={proposalData?.data?.totalCount ?? 0}
                  pageChange={pageChange}
                  pageSizeChange={pageSizeChange}
                  showLast={!isNetworkDAO}
                />
              </div>
            )}
            {tabKey === TabKey.PROPOSALS && isNetworkDAO && <ExplorerProposalList />}
            {/* < 1024 */}
            {isLG && tabKey === TabKey.MYINFO && (
              <>
                {walletInfo.address && (
                  <ExecutdProposals daoId={daoId} address={walletInfo.address} />
                )}
                {walletInfo.address && <MyRecords daoId={daoId} isNetworkDAO={isNetworkDAO} />}
              </>
            )}
          </div>

          {!isLG && !isNetworkDAO && (
            <div className="dao-detail-content-right">
              {daoData?.data && !isNetworkDAO && (
                <Treasury daoData={daoData.data} createProposalCheck={handleCreateProposal} />
              )}
              {daoData?.data &&
                !isNetworkDAO &&
                daoData.data.governanceMechanism === EDaoGovernanceMechanism.Multisig && (
                  <DaoMembers daoData={daoData.data} />
                )}
              {rightContent}
              {walletInfo.address && (
                <ExecutdProposals daoId={daoId} address={walletInfo.address} />
              )}
              {walletInfo.address && <MyRecords daoId={daoId} isNetworkDAO={isNetworkDAO} />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
