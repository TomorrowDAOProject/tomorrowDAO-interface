import FormItem from 'components/FormItem';
import { Controller } from 'react-hook-form';
import Input from 'components/Input';
import { curChain } from 'config';
import Button from 'components/Button';
import clsx from 'clsx';
import Tooltip from 'components/Tooltip';

interface IAddMultisigMembersProps {
  form: any;
}
function AddMultisigMembers(props: IAddMultisigMembersProps) {
  const { form } = props;
  const {
    control,
    watch,
    formState: { errors },
    setValue,
  } = form;
  const addMembersValue = watch('addMembers.value') ?? [];
  return (
    <FormItem
      className="!mb-[30px]"
      label={
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
            Address
            <i className="tmrwdao-icon-information text-[18px] text-lightGrey" />
          </span>
        </Tooltip>
      }
      errorText={errors?.addMembers?.value?.message}
    >
      {addMembersValue.map((address: string, index: number) => (
        <Controller
          key={`${address}_${index}`}
          name="addMembers.value"
          control={control}
          rules={{
            required: 'Address is required',
            validate: {
              validator: (value) => {
                if (value[index].endsWith(`AELF`)) {
                  return 'Must be a SideChain address';
                }
                if (!value[index].startsWith(`ELF`) || !value[index].endsWith(curChain)) {
                  return 'Must be a valid address';
                }
              },
            },
          }}
          render={({ field }) => (
            <div className="flex items-center mb-4">
              <Input
                value={address}
                placeholder={`Enter ELF_..._${curChain}`}
                onBlur={(value) => {
                  const newList = [...addMembersValue];
                  newList[index] = value;
                  field.onChange(newList);
                }}
                isError={
                  !!errors?.addMembers?.value?.message &&
                  (address.endsWith(`AELF`) ||
                    !address.startsWith(`ELF`) ||
                    !address.endsWith(curChain))
                }
              />
              <i
                className={clsx(
                  'tmrwdao-icon-circle-minus text-white text-[22px] ml-[6px] cursor-pointer',
                  {
                    '!text-darkGray': addMembersValue.length <= 1,
                  },
                )}
                onClick={() => {
                  if (addMembersValue.length <= 1) return;
                  const originList = [...addMembersValue];
                  originList.splice(index, 1);
                  setValue('addMembers.value', originList);
                }}
              />
            </div>
          )}
        />
      ))}
      <div className="flex items-center gap-[9px]">
        <Button
          className="!py-1 !text-[12px]"
          type="default"
          onClick={() => {
            const originList = [...addMembersValue, ''];
            setValue('addMembers.value', originList);
          }}
        >
          <i className="tmrwdao-icon-circle-add text-[22px] mr-[6px]" />
          Add Address
        </Button>
        <Button
          className="!py-1 !text-[12px]"
          type="default"
          onClick={() => {
            setValue('addMembers.value', ['']);
          }}
        >
          <i className="tmrwdao-icon-delete text-[22px] mr-[6px]" />
          Delete All
        </Button>
      </div>
    </FormItem>
  );
}

export default AddMultisigMembers;
