import { useRequest } from 'ahooks';
import { fetchHcMembers } from 'api/request';
import { curChain } from 'config';
import DeleteMembers from '../DeleteMembers';
interface IDeleteMultisigMembersProps {
  daoId: string;
  form: any;
}
function DeleteMultisigMembers(props: IDeleteMultisigMembersProps) {
  const { daoId, form } = props;
  const { errors } = form.formState;
  const { data: daoMembersData, loading: daoMembersDataLoading } = useRequest(() => {
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
      errorMessage={errors?.removeHighCouncils?.value?.message}
    />
  );
}

export default DeleteMultisigMembers;
