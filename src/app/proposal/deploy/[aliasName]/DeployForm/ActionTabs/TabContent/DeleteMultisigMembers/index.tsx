import { useMemo } from 'react';
import { useRequest } from 'ahooks';
import { fetchDaoMembers } from 'api/request';
import { curChain } from 'config';
import { FormInstance } from 'antd';
import DeleteMembers from '../DeleteMembers';
interface IDeleteMultisigMembersProps {
  daoId: string;
  form: FormInstance;
}
const removeNamePath = ['removeMembers', 'value'];
function DeleteMultisigMembers(props: IDeleteMultisigMembersProps) {
  const { daoId, form } = props;

  const {
    data: daoMembersData,
    // error: transferListError,
    loading: daoMembersDataLoading,
  } = useRequest(() => {
    return fetchDaoMembers({
      SkipCount: 0,
      MaxResultCount: 6,
      ChainId: curChain,
      DAOId: daoId,
    });
  });

  const lists = useMemo(() => {
    return daoMembersData?.data?.data?.map((item) => item.address) ?? [];
  }, [daoMembersData]);

  return (
    <DeleteMembers
      lists={lists}
      form={form}
      removeNamePath={removeNamePath}
      isLoading={daoMembersDataLoading}
      overLimitErrorText="A multisig requires members"
    />
  );
}

export default DeleteMultisigMembers;
