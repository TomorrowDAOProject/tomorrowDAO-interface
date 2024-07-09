import { useRequest } from 'ahooks';
import { fetchHcMembers } from 'api/request';
import { curChain } from 'config';
import { FormInstance } from 'antd';
import DeleteMembers from '../DeleteMembers';
interface IDeleteMultisigMembersProps {
  daoId: string;
  form: FormInstance;
}
const removeNamePath = ['removeHighCouncils', 'value'];
function DeleteMultisigMembers(props: IDeleteMultisigMembersProps) {
  const { daoId, form } = props;

  const {
    data: daoMembersData,
    // error: transferListError,
    loading: daoMembersDataLoading,
  } = useRequest(() => {
    return fetchHcMembers({
      chainId: curChain,
      daoId: daoId,
    });
  });

  return (
    <DeleteMembers
      lists={daoMembersData?.data ?? []}
      form={form}
      removeNamePath={removeNamePath}
      isLoading={daoMembersDataLoading}
    />
  );
}

export default DeleteMultisigMembers;
