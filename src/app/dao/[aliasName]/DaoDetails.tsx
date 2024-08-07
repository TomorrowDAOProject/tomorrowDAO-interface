'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Tabs, Pagination } from 'aelf-design';
import { Form, message } from 'antd';
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
import { IProposalTableParams, TabKey } from './type';
import { fetchDaoInfo, fetchProposalList } from 'api/request';
import { curChain } from 'config';
import { ALL } from './constants';
import Link from 'next/link';
import ErrorResult from 'components/ErrorResult';
import useNetworkDaoRouter from 'hooks/useNetworkDaoRouter';
import { useRouter } from 'next/navigation';
import { ButtonCheckLogin } from 'components/ButtonCheckLogin';
import breadCrumb from 'utils/breadCrumb';
import ExplorerProposalList, {
  ExplorerProposalListFilter,
} from '../../network-dao/ExplorerProposalList';
import { useChainSelect } from 'hooks/useChainSelect';
import getChainIdQuery from 'utils/url';
import DaoMembers from './components/Members';
import HcMembers from './components/HCMembers';
import './page.css';
import { EDaoGovernanceMechanism } from 'app/(createADao)/create/type';
import { checkCreateProposal } from 'utils/proposal';
import NoData from 'components/NoData';

interface IProps {
  daoId?: string;
  aliasName?: string;
  isNetworkDAO?: boolean;
}
interface IMyInfoContentProps {
  daoId?: string;
  isTokenGovernanceMechanism?: boolean;
  className?: string;
}
const MyInfoContent = (props: IMyInfoContentProps) => {
  const { daoId, isTokenGovernanceMechanism, className } = props;
  return daoId && isTokenGovernanceMechanism ? (
    <MyInfo daoId={daoId} isShowVote={false} clssName={className} />
  ) : null;
};
export default function DeoDetails(props: IProps) {
  const { aliasName, isNetworkDAO } = props;
  const { isLG } = useResponsive();

  const { isMainChain } = useChainSelect();
  const [form] = Form.useForm();
  // todo
  const [tabKey, setTabKey] = useState(TabKey.PROPOSALS);
  const networkDaoRouter = useNetworkDaoRouter();

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
  const daoId = daoData?.data?.id;
  // const aliasName = aliasName;
  const previousTableParams = usePrevious(tableParams);
  const fetchProposalListWithParams = async (preData: IProposalListRes | null) => {
    const { proposalType, proposalStatus } = tableParams;
    if (!aliasName) {
      console.log(1);
      message.error('aliasName is required');
      return null;
    }
    const params: IProposalListReq = {
      alias: aliasName,
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
  const previousProposalDataRef = useRef<IProposalListRes | null>();
  const handleCreateProposalRef = useRef<(customRouter?: boolean) => Promise<boolean>>();
  previousProposalDataRef.current = proposalData;

  const isTokenGovernanceMechanism =
    daoData?.data?.governanceMechanism === EDaoGovernanceMechanism.Token;
  const router = useRouter();
  const isShowMyInfo = daoId && isTokenGovernanceMechanism;

  const handleCreateProposal = async () => {
    if (!daoData) return false;
    setCreateProposalLoading(true);
    const checkRes = await checkCreateProposal(daoData, walletInfo.address);
    setCreateProposalLoading(false);
    if (!checkRes) {
      return false;
    }
    if (isNetworkDAO) {
      const chainIdQuery = getChainIdQuery();
      networkDaoRouter.push(`/apply?${chainIdQuery.chainIdQueryString}`);
    } else {
      router.push(`/proposal/deploy/${aliasName}`);
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
    if (daoData?.data?.isNetworkDAO && isMainChain) {
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
      if (!daoData?.data?.isNetworkDAO) {
        if (isShowMyInfo) {
          finalItems.push({
            key: TabKey.MYINFO,
            label: 'My Info',
            children: (
              <MyInfoContent
                daoId={daoId}
                isTokenGovernanceMechanism={isTokenGovernanceMechanism}
                className="border-0  px-[16px] pt-[8px] pb-[24px] lg:mb-[16px] mb-0"
              />
            ),
          });
        }
        finalItems.push({
          key: TabKey.TREASURY,
          label: 'Treasury',
          children: <Treasury daoRes={daoData} aliasName={aliasName} />,
        });
        if (daoData?.data?.governanceMechanism === EDaoGovernanceMechanism.Multisig && aliasName) {
          finalItems.push({
            key: TabKey.DAOMEMBERS,
            label: 'Members',
            children: daoData?.data ? (
              <DaoMembers daoRes={daoData} aliasName={aliasName} />
            ) : (
              <span></span>
            ),
          });
        }
        if (daoData?.data?.governanceMechanism === EDaoGovernanceMechanism.Token && aliasName) {
          finalItems.push({
            key: TabKey.HCMEMBERS,
            label: 'High Council Members',
            children: daoData?.data ? (
              <HcMembers daoRes={daoData} aliasName={aliasName} />
            ) : (
              <span></span>
            ),
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
    daoData,
    isMainChain,
    isLG,
    isShowMyInfo,
    aliasName,
    daoId,
    isTokenGovernanceMechanism,
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

  useEffect(() => {
    if (isNetworkDAO) {
      return;
    }
    run(previousProposalDataRef.current ?? null);
  }, [tableParams, run, isNetworkDAO]);

  return (
    <div className="dao-detail">
      <div>
        <DaoInfo
          data={(daoData?.data ?? {}) as IDaoInfoData}
          isLoading={daoLoading}
          isError={daoError}
          onChangeHCParams={handleChangeHCparams}
          daoId={daoId}
          aliasName={aliasName}
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
                    return (
                      <Link
                        key={item.proposalId}
                        href={{
                          pathname: `/dao/${aliasName}/proposal/${item.proposalId}`,
                        }}
                      >
                        <ProposalsItem
                          data={item}
                          governanceMechanism={daoData?.data.governanceMechanism}
                        />
                      </Link>
                    );
                  })
                ) : (
                  <NoData />
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
                {walletInfo.address && daoId && aliasName && (
                  <ExecutdProposals
                    daoId={daoId}
                    address={walletInfo.address}
                    aliasName={aliasName}
                  />
                )}
                {walletInfo.address && daoId && (
                  <MyRecords daoId={daoId} isNetworkDAO={isNetworkDAO} aliasName={aliasName} />
                )}
              </>
            )}
          </div>

          {!isLG && !isNetworkDAO && (
            <div className="dao-detail-content-right">
              {!isNetworkDAO && (
                <Treasury
                  daoRes={daoData}
                  createProposalCheck={handleCreateProposal}
                  aliasName={aliasName}
                />
              )}
              {aliasName && !isNetworkDAO && (
                <DaoMembers
                  createProposalCheck={handleCreateProposal}
                  daoRes={daoData}
                  aliasName={aliasName}
                />
              )}
              {aliasName && !isNetworkDAO && (
                <HcMembers
                  createProposalCheck={handleCreateProposal}
                  daoRes={daoData}
                  aliasName={aliasName}
                />
              )}
              <MyInfoContent
                daoId={daoId}
                isTokenGovernanceMechanism={isTokenGovernanceMechanism}
                className="border lg:mb-[16px] mb-0"
              />
              {walletInfo.address && daoId && aliasName && (
                <ExecutdProposals
                  daoId={daoId}
                  address={walletInfo.address}
                  aliasName={aliasName}
                />
              )}
              {walletInfo.address && daoId && aliasName && (
                <MyRecords daoId={daoId} isNetworkDAO={isNetworkDAO} aliasName={aliasName} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
