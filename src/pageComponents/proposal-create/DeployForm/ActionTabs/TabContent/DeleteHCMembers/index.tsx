import { useRequest } from 'ahooks';
import { fetchHcMembers } from 'api/request';
import { curChain } from 'config';
import { FormInstance } from 'antd';
import DeleteMembers from '../DeleteMembers';
interface IDeleteMultisigMembersProps {
  daoId: string;
  form: FormInstance;
}
function DeleteMultisigMembers(props: IDeleteMultisigMembersProps) {
  const { daoId, form } = props;

  const {
    data: daoMembersData,
    // error: transferListError,
    loading: daoMembersDataLoading,
  } = useRequest(() => {
    return fetchHcMembers({
      chainId: curChain,
      daoId,
    });
  });

  return (
    <DeleteMembers
      lists={daoMembersData?.data ?? []}
      form={form}
      removeNamePath={'removeHighCouncils.value'}
      isLoading={daoMembersDataLoading}
    />
  );
}

export default DeleteMultisigMembers;
