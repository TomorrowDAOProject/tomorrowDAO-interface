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
            <div className="text-[10px] leading-[12px]">
              There is no limit on the number of addresses on your multisig. Addresses can create
              proposals, create and approve transactions, and suggest changes to the DAO settings
              after creation.
            </div>
          }
        >
          <span className="flex items-center text-descM15 text-white font-Montserrat gap-[8px]">
            Add Multisig Members Address
            <i className="tmrwdao-icon-document text-[18px] text-white" />
          </span>
        </Tooltip>
      }
    />
  );
}

export default AddMultisigMembers;
