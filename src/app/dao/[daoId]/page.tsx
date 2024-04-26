'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Tabs, Typography, FontWeightEnum, Button, Pagination } from 'aelf-design';
import { Form, message } from 'antd';
import useResponsive from 'hooks/useResponsive';
import ProposalsItem from './components/ProposalsItem';
import HighCounCilTab from './components/HighCouncilTab';
import DaoInfo from './components/DaoInfo';
import ExecutdProposals from './components/ExecutdProposals';
import MyRecords from './components/MyRecords';
import MyInfo from './components/MyInfo';
import Filter from './components/Filter';
import { useRequest } from 'ahooks';
import { HCType, IProposalTableParams, TabKey, ProposalStatus } from './type';
import { ProposalType } from 'types';
import Link from 'next/link';
import { fetchDaoInfo, fetchProposalList } from 'api/request';
import { store } from 'redux/store';
import './page.css';

interface IProps {
  params: { daoId: string };
}
export default function DeoDetails(props: IProps) {
  const daoId = props.params.daoId;
  const info = store.getState().elfInfo.elfInfo;
  const { isLG, isSM } = useResponsive();

  const [form] = Form.useForm();
  const [tabKey, setTabKey] = useState(TabKey.PROPOSALS);
  const [hcType, setHcType] = useState(HCType.MEMBER);

  const {
    data: daoData,
    error: daoError,
    loading: daoLoading,
  } = useRequest(async () => {
    if (!daoId) {
      message.error('daoId is required');
      return null;
    }
    return fetchDaoInfo({ daoId, chainId: info.curChain });
  });
  // const [daoDetail, setDaoDetail] = useState<IDaoDetail>(data);
  // const [proposalList, setProposalList] = useState<IProposalsItem[]>(list);

  const [tableParams, setTableParams] = useState<IProposalTableParams>({
    // proposalType: ProposalType.ALL,
    proposalStatus: ProposalStatus.ALL,
    content: '',
    pagination: {
      current: 1,
      pageSize: 20,
      total: 0,
    },
  });
  const fetchProposalListWithParams = async () => {
    const { proposalType, proposalStatus } = tableParams;
    console.log('tableParams.pagination.current', tableParams.pagination.current);
    const params: ProposalListReq = {
      daoId: daoId,
      chainId: info.curChain,
      skipCount:
        (tableParams.pagination.current ?? 1 - 1) * (tableParams.pagination.pageSize ?? 20),
      maxResultCount: tableParams.pagination.pageSize,
    };
    if (proposalType !== ProposalType.ALL) {
      params.proposalType = proposalType;
    }
    if (proposalStatus !== ProposalStatus.ALL) {
      params.proposalStatus = proposalStatus;
    }
    console.log('tableParams', tableParams);
    if (tableParams.content) {
      params.content = tableParams.content;
    }
    const listRes = await fetchProposalList(params);
    return listRes;
  };
  const {
    data: proposalData,
    error: proposalError,
    loading: proposalLoading,
    run,
  } = useRequest(fetchProposalListWithParams, {
    manual: true,
  });

  const rightContent = useMemo(() => {
    return (
      <>
        <MyInfo isLogin={true}></MyInfo>
      </>
    );
  }, []);

  const tabItems = useMemo(() => {
    const items = [
      {
        key: TabKey.PROPOSALS,
        label: 'All Proposals',
        children: (
          <div className="tab-all-proposals">
            <div className="tab-all-proposals-header">
              <Typography.Title fontWeight={FontWeightEnum.Medium} level={6}>
                Proposals
              </Typography.Title>
              <Link href={`/proposal/deploy/${daoData?.data?.id}`}>
                <Button size="medium" type="primary">
                  Deploy
                </Button>
              </Link>
            </div>
            <Filter form={form} tableParams={tableParams} onChangeTableParams={setTableParams} />
          </div>
        ),
      },
      {
        key: TabKey.HC,
        label: 'High Council',
        children: <HighCounCilTab hcType={hcType} onChangeHcType={setHcType} />,
      },
    ];
    if (!isLG) {
      return items;
    } else {
      return [
        ...items,
        {
          key: TabKey.MYINFO,
          label: 'My Info',
          children: rightContent,
        },
      ];
    }
  }, [form, tableParams, hcType, isLG, rightContent, daoData]);

  const pageChange = useCallback((page: number) => {
    console.log('page', page);
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
    console.log('pageSize', page, pageSize);
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
    console.log('key', key);
    setTabKey(key as TabKey);
  };

  const handleChangeHCparams = useCallback((type: HCType) => {
    setHcType(type);
    console.log('click type', type);
    setTabKey(TabKey.HC);
  }, []);

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
    run();
  }, [tableParams]);

  return (
    <div className="dao-detail">
      <div className="max-w-[1360px] mx-auto ">
        {daoData?.data && <DaoInfo data={daoData.data} onChangeHCParams={handleChangeHCparams} />}
        <div className="dao-detail-content">
          <div className={` ${isSM ? 'w-full' : 'dao-detail-content-left'}`}>
            <div className="dao-detail-content-left-tab">{tabCom}</div>
            {tabKey === TabKey.PROPOSALS && (
              <div>
                {proposalData?.data.items.map((item) => (
                  <ProposalsItem key={item.proposalId} data={item} />
                ))}
                <Pagination
                  {...tableParams.pagination}
                  pageChange={pageChange}
                  pageSizeChange={pageSizeChange}
                />
              </div>
            )}
            {isLG && tabKey === TabKey.MYINFO && (
              <>
                <ExecutdProposals />
                <MyRecords />
              </>
            )}
          </div>

          {!isLG && (
            <div className="dao-detail-content-right">
              {rightContent}
              <ExecutdProposals />
              <MyRecords />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}