import { useMemo } from 'react';
import { useRequest } from 'ahooks';
import { fetchDaoMembers } from 'api/request';
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
    return fetchDaoMembers({
      SkipCount: 0,
      MaxResultCount: 6,
      ChainId: curChain,
      alias: daoId,
    });
  });

  const lists = useMemo(() => {
    return daoMembersData?.data?.data?.map((item) => item.address) ?? [];
  }, [daoMembersData]);

  return (
    <DeleteMembers
      lists={lists}
      form={form}
      removeNamePath="removeMembers.value"
      isLoading={daoMembersDataLoading}
      errorMessage={errors?.removeMembers?.value?.message}
    />
  );
}

export default DeleteMultisigMembers;
