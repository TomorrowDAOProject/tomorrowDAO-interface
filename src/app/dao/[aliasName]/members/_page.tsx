'use client';
import React, { useEffect, useState } from 'react';
import { curChain } from 'config';
import { useRequest } from 'ahooks';
import breadCrumb from 'utils/breadCrumb';
import { fetchDaoInfo, fetchDaoMembers } from 'api/request';
import { EProposalActionTabs } from 'pageComponents/proposal-create/type';
import { toast } from 'react-toastify';
import MembersPage from 'pageComponents/members';
import './index.css';
interface ITreasuryDetailsProps {
  aliasName?: string;
}
const defaultPageSize = 20;
export default function TreasuryDetails(props: ITreasuryDetailsProps) {
  const { aliasName } = props;
  const [tableParams, setTableParams] = useState<{ page: number; pageSize: number }>({
    page: 1,
    pageSize: defaultPageSize,
  });

  const {
    data: daoData,
    error: daoError,
    loading: daoLoading,
  } = useRequest(async () => {
    if (!aliasName) {
      toast.error('aliasName is required');
      return null;
    }
    return fetchDaoInfo({ chainId: curChain, alias: aliasName });
  });
  const {
    data: daoMembersData,
    // error: transferListError,
    loading: daoMembersDataLoading,
    run,
  } = useRequest(
    async (daoId) => {
      return fetchDaoMembers({
        SkipCount: tableParams.pageSize * (tableParams.page - 1),
        MaxResultCount: tableParams.pageSize,
        ChainId: curChain,
        DAOId: daoId,
      });
    },
    {
      manual: true,
    },
  );
  const daoId = daoData?.data?.id;

  useEffect(() => {
    breadCrumb.updateMembersPage(aliasName);
  }, [aliasName]);

  const pageChange = (page: number, pageSize: number) => {
    setTableParams({
      page,
      pageSize,
    });
  };
  useEffect(() => {
    if (!daoId) return;
    run(daoId);
  }, [tableParams, daoId, run]);
  const lists = (daoMembersData?.data?.data ?? []).map((item) => item.address);
  return (
    <MembersPage
      totalCount={daoMembersData?.data?.totalCount ?? 0}
      isLoading={daoLoading || daoMembersDataLoading}
      managerUrl={`/dao/${aliasName}/proposal/create?tab=${EProposalActionTabs.AddMultisigMembers}`}
      lists={lists}
      pagination={{
        current: tableParams.page,
        pageSize: tableParams.pageSize,
        total: daoMembersData?.data?.totalCount ?? 0,
        onChange: pageChange,
      }}
    />
  );
}
