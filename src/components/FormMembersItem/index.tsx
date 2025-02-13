import './index.css';
import { curChain } from 'config';
import Button from 'components/Button';
import Tooltip from 'components/Tooltip';
import Input from 'components/Input';
import FormItem from 'components/FormItem';
import { Controller } from 'react-hook-form';
import clsx from 'clsx';

interface ValidatorRule {
  validator: (rule: any, value: any) => Promise<void>;
}
interface IFormMembersProps {
  name: string;
  initialValue: string[];
  form: any;
  hiddenExtraWhenEmpty?: boolean;
  titleNode?: React.ReactNode;
  emptyNode?: React.ReactNode;
  footNode?: React.ReactNode;
  errorMessage?: string;
  rules?: ValidatorRule[];
  disableInput?: boolean;
}
function FormMembersItem(props: IFormMembersProps) {
  const {
    name,
    initialValue,
    form,
    hiddenExtraWhenEmpty = false,
    titleNode,
    emptyNode,
    footNode,
    errorMessage,
    disableInput = false,
  } = props;
  const { control, watch, setValue } = form;
  const fields = watch(name);

  const showNullWhenEmpty = hiddenExtraWhenEmpty && !fields?.length;
  return (
    <>
      <FormItem
        className="!mb-[30px]"
        label={
          showNullWhenEmpty ? null : titleNode ? (
            titleNode
          ) : (
            <Tooltip
              title={
                <div className="text-[10px] leading-[12px]">
                  There is no limit on the number of addresses on your multisig. Addresses can
                  create proposals, create and approve transactions, and suggest changes to the DAO
                  settings after creation.
                </div>
              }
            >
              <span className="flex items-center text-descM15 text-white font-Montserrat gap-[8px]">
                Multisig Members Address
                <i className="tmrwdao-icon-information text-[18px] text-white" />
              </span>
            </Tooltip>
          )
        }
        errorText={errorMessage}
      >
        {emptyNode && !fields?.length
          ? emptyNode
          : fields.map((address: string, index: number) => (
              <Controller
                key={`${address}_${index}`}
                name={name}
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
                        const newList = [...fields];
                        newList[index] = value;
                        console.log('newList', newList);
                        field.onChange(newList);
                      }}
                      disabled={disableInput}
                      isError={
                        address.endsWith(`AELF`) ||
                        !address.startsWith(`ELF`) ||
                        !address.endsWith(curChain)
                      }
                    />
                    <i
                      className={clsx(
                        'tmrwdao-icon-circle-minus text-white text-[22px] ml-[6px] cursor-pointer',
                        {
                          '!text-darkGray': fields.length <= 1,
                        },
                      )}
                      onClick={() => {
                        if (fields.length <= 1) return;
                        const originList = [...fields];
                        originList.splice(index, 1);
                        setValue(name, originList);
                      }}
                    />
                  </div>
                )}
              />
            ))}
        <div className="flex items-center gap-[9px]">
          {showNullWhenEmpty ? null : footNode ? (
            footNode
          ) : (
            <>
              <Button
                className="!py-1 !text-[12px]"
                type="default"
                onClick={() => {
                  const originList = [...fields, ''];
                  setValue(name, originList);
                }}
              >
                <i className="tmrwdao-icon-circle-add text-[22px] mr-[6px]" />
                Add Address
              </Button>
              <Button
                className="!py-1 !text-[12px]"
                type="default"
                onClick={() => {
                  setValue(name, ['']);
                }}
              >
                <i className="tmrwdao-icon-delete text-[22px] mr-[6px]" />
                Delete All
              </Button>
            </>
          )}
        </div>
      </FormItem>

      {showNullWhenEmpty ? null : (
        <div className="mt-[32px]">
          <div className="flex justify-between">
            <span className="flex items-center pb-[8px] justify-between text-descM15 text-white font-Montserrat">
              Total Addresses
            </span>
            <span className="text-descM16 text-white font-Montserrat">
              {fields?.length ?? initialValue.length}
            </span>
          </div>
          <div className="text-descM12 text-Neutral-Secondary-Text mb-[32px]">
            Your connected wallet has been automatically added to the list. You can remove it if
            you&apos;d like.
          </div>
        </div>
      )}
    </>
  );
}

export default FormMembersItem;
