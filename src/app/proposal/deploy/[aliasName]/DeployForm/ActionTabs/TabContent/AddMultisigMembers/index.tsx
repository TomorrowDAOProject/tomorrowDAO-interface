import { FormInstance, Tooltip } from 'antd';
import FormMembersItem from 'components/FormMembersItem';
import { ReactComponent as QuestionIcon } from 'assets/imgs/question-icon.svg';

interface IAddMultisigMembersProps {
  form: FormInstance;
}
function AddMultisigMembers(props: IAddMultisigMembersProps) {
  const { form } = props;
  return (
    <FormMembersItem
      name={['addHighCouncils', 'value']}
      initialValue={['']}
      form={form}
      titleNode={
        <Tooltip
          title={
            <div>
              There is no limit on the number of addresses on your multisig. Addresses can create
              proposals, create and approve transactions, and suggest changes to the DAO settings
              after creation.
            </div>
          }
        >
          <span className="flex items-center form-item-title gap-[8px] pb-[8px]  w-[max-content]">
            Address
            <QuestionIcon className="cursor-pointer " width={16} height={16} />
          </span>
        </Tooltip>
      }
    />
  );
}

export default AddMultisigMembers;
