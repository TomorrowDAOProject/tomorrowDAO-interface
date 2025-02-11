'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pagination } from 'aelf-design';
import Tabs from 'components/Tabs';
import { useSelector } from 'react-redux';
import { SkeletonList } from 'components/Skeleton';
import useResponsive from 'hooks/useResponsive';
import ProposalsItem from './components/ProposalsItem';
import DaoInfo from './components/DaoInfo';
import ExecutdProposals from './components/ExecutdProposals';
import MyRecords from './components/MyRecords';
import MyInfo from './components/MyInfo';
import Filter from './components/Filter';
import Treasury from './components/Treasury';
import { useRequest } from 'ahooks';
import { IProposalTableParams, TabKey } from './type';
import { fetchProposalList } from 'api/request';
import { curChain } from 'config';
import { ALL, DEFAULT_PAGESIZE, createOptionsDaoAlias } from './constants';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ButtonCheckLogin } from 'components/ButtonCheckLogin';
import breadCrumb from 'utils/breadCrumb';
import DaoMembers from './components/Members';
import HcMembers from './components/HCMembers';
import './page.css';
import { EDaoGovernanceMechanism } from 'app/(createADao)/create/type';
import { checkCreateProposal } from 'utils/proposal';
import NoData from 'components/NoData';

interface IProps {
  ssrData: {
    daoInfo: IDaoInfoRes;
    ProposalListResData: IProposalListResData;
  };
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
  const { aliasName, ssrData } = props;
  const { daoInfo: daoData, ProposalListResData } = ssrData;
  const { isLG } = useResponsive();

  // const [form] = Form.useForm();
  const [tabKey, setTabKey] = useState(TabKey.PROPOSALS);
  const { walletInfo } = useSelector((store: any) => store.userInfo);
  // const [daoDetail, setDaoDetail] = useState<IDaoDetail>(data);
  // const [proposalList, setProposalList] = useState<IProposalsItem[]>(list);

  const [tableParams, setTableParams] = useState<IProposalTableParams>({
    content: '',
    pagination: {
      current: 1,
      pageSize: DEFAULT_PAGESIZE,
      total: 0,
    },
  });
  const daoId = daoData?.data?.id;
  const fetchProposalListWithParams = async (newTableParams: IProposalTableParams) => {
    const { proposalType, proposalStatus } = newTableParams;
    if (!aliasName) {
      // message.error('aliasName is required');
      return null;
    }
    const params: IProposalListReq = {
      alias: aliasName,
      chainId: curChain,
      skipCount:
        ((newTableParams.pagination.current ?? 1) - 1) * (newTableParams.pagination.pageSize ?? 20),
      maxResultCount: newTableParams.pagination.pageSize,
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
    if (newTableParams.content) {
      params.content = newTableParams.content;
    }
    const listRes = await fetchProposalList(params);
    return listRes;
  };
  const [createProposalLoading, setCreateProposalLoading] = useState(false);
  const [proposalData, setProposalData] = useState<IProposalListResData | null>(
    ProposalListResData,
  );
  const {
    data: newProposalData,
    error: proposalError,
    loading: proposalLoading,
    run,
  } = useRequest(fetchProposalListWithParams, {
    manual: true,
  });
  const previousProposalDataRef = useRef<IProposalListResData | null>();
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
    if (createOptionsDaoAlias.includes(aliasName ?? '')) {
      router.push(`/dao/${aliasName}/proposal/create-option`);
      return true;
    }
    router.push(`/dao/${aliasName}/proposal/create`);
    return true;
  };
  handleCreateProposalRef.current = handleCreateProposal;
  const handleTableParamsChange = useCallback(
    (newTableParams: IProposalTableParams) => {
      setTableParams(newTableParams);
      run(newTableParams);
    },
    [run, setTableParams],
  );

  const handleParamsChange = (params: IProposalTableParams) => {
    handleTableParamsChange({
      ...params,
      pagination: tableParams.pagination ?? {
        current: 1,
        pageSize: DEFAULT_PAGESIZE,
        total: 0,
      },
    });
  };

  const tabItems = useMemo(() => {
    const CreateButton = (
      <ButtonCheckLogin
        size="medium"
        type="primary"
        className="bg-mainColor !h-[32px] !rounded-[42px] py-2 px-[14px] font-Montserrat hover:!bg-transparent hover:!text-mainColor hover:border hover:border-solid hover:border-mainColor"
        loading={createProposalLoading}
        onClick={() => {
          handleCreateProposalRef.current?.();
        }}
        disabled={!daoData.data.id}
      >
        <span className="font-medium text-[12px]">Create a Proposal</span>
      </ButtonCheckLogin>
    );
    const items = [
      {
        key: TabKey.PROPOSALS,
        label: 'All Proposals',
        children: (
          <div className="tab-all-proposals">
            <div className={`tab-all-proposals-header `}>
              <span className="text-white text-[18px] font-Montserrat font-medium">Proposals</span>
              {CreateButton}
            </div>
            <Filter tableParams={tableParams} onChangeTableParams={handleParamsChange} />
          </div>
        ),
      },
    ];
    if (!isLG) {
      return items;
    } else {
      const finalItems = [...items];
      if (isShowMyInfo) {
        finalItems.push({
          key: TabKey.MYINFO,
          label: 'My Info',
          children: (
            <MyInfoContent
              daoId={daoId}
              isTokenGovernanceMechanism={isTokenGovernanceMechanism}
              className="border-0 p-[22px] xl:px-[32px] xl:py-[24px] xl:mb-[16px] lg:px-[32px] lg:py-[24px] lg:mb-[16px] md:px-[32px] md:py-[24px] md:mb-[16px] mb-0"
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

      return finalItems;
    }
  }, [
    createProposalLoading,
    daoData,
    tableParams,
    isLG,
    handleTableParamsChange,
    isShowMyInfo,
    aliasName,
    daoId,
    isTokenGovernanceMechanism,
  ]);

  const pageChange = (page: number) => {
    console.log('page', page);
    const newTableParams: IProposalTableParams = {
      ...tableParams,
      pagination: {
        ...tableParams.pagination,
        current: page,
      },
    };
    handleTableParamsChange(newTableParams);
  };

  const pageSizeChange = (page: number, pageSize: number) => {
    console.log('pageSizeChange', page, pageSize);
    const newTableParams: IProposalTableParams = {
      ...tableParams,
      pagination: {
        ...tableParams.pagination,
        current: page,
        pageSize,
      },
    };
    handleTableParamsChange(newTableParams);
  };

  const handleTabChange = (key: string) => {
    setTabKey(key as TabKey);
  };

  const handleChangeHCparams = useCallback(() => {
    setTabKey(TabKey.HC);
  }, []);
  useEffect(() => {
    breadCrumb.updateDaoDetailPage(aliasName, daoData?.data?.metadata?.name);
  }, [aliasName, daoData?.data?.metadata?.name]);
  useEffect(() => {
    console.log('ssrData', ssrData);
  }, []);

  const tabCom = useMemo(() => {
    return <Tabs activeKey={tabKey} items={tabItems} onChange={handleTabChange} />;
  }, [isLG, tabItems, tabKey]);

  useEffect(() => {
    if (newProposalData) {
      setProposalData(newProposalData.data);
    }
  }, [newProposalData]);

  return (
    <div className="dao-detail">
      <div className="text-white font-Montserrat flex items-center gap-2 pb-[25px]">
        <span
          className="text-lightGrey text-[15px] cursor-pointer"
          onClick={() => router.push('/')}
        >
          Home
        </span>
        <i className="tmrwdao-icon-arrow text-[16px] text-lightGrey" />
        <span
          className="text-lightGrey text-[15px] cursor-pointer"
          onClick={() => router.push('/explore')}
        >
          Explore
        </span>
        <i className="tmrwdao-icon-arrow text-[16px] text-lightGrey" />
        <span className="text-[14px]">{daoData?.data?.metadata?.name}</span>
      </div>
      <div>
        <DaoInfo
          data={(daoData?.data ?? {}) as IDaoInfoData}
          isLoading={false}
          isError={!daoData.data.id}
          onChangeHCParams={handleChangeHCparams}
          daoId={daoId}
          aliasName={aliasName}
        />

        <div className="dao-detail-content">
          <div className={`dao-detail-content-left`}>
            <div className={`dao-detail-content-left-tab`}>{tabCom}</div>
            {tabKey === TabKey.PROPOSALS && (
              <div>
                {proposalLoading ? (
                  <SkeletonList />
                ) : proposalError ? (
                  <div className="text-white font-Montserrat text-center mb-[30px] h-[100px] flex flex-col items-center justify-center">
                    <div className="text-white text-[15px] font-medium mb-[10px]">
                      Something went wrong
                    </div>
                    <div className="text-lightGrey text-[12px]">
                      Please check your network connection, try again later.
                    </div>
                  </div>
                ) : proposalData?.items?.length ? (
                  proposalData?.items?.map((item) => {
                    return (
                      <Link
                        key={item.proposalId}
                        href={{
                          pathname: `/dao/${aliasName}/proposal/${item.proposalId}`,
                        }}
                        prefetch={true}
                      >
                        <ProposalsItem
                          data={item}
                          governanceMechanism={daoData?.data.governanceMechanism}
                        />
                      </Link>
                    );
                  })
                ) : (
                  <div className="mb-[30px]">
                    <NoData />
                  </div>
                )}
                <div className="pagination-wrap">
                  <Pagination
                    {...tableParams.pagination}
                    total={proposalData?.totalCount ?? 0}
                    pageChange={pageChange}
                    pageSizeChange={pageSizeChange}
                    defaultPageSize={DEFAULT_PAGESIZE}
                  />
                </div>
              </div>
            )}
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
                {walletInfo.address && daoId && <MyRecords daoId={daoId} aliasName={aliasName} />}
              </>
            )}
          </div>

          {!isLG && (
            <div className="dao-detail-content-right">
              <Treasury
                daoRes={daoData}
                createProposalCheck={handleCreateProposal}
                aliasName={aliasName}
              />

              {aliasName && (
                <DaoMembers
                  createProposalCheck={handleCreateProposal}
                  daoRes={daoData}
                  aliasName={aliasName}
                />
              )}
              {aliasName && (
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
                <MyRecords daoId={daoId} aliasName={aliasName} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
