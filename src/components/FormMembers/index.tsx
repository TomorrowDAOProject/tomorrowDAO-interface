import { AddCircleOutlined, DeleteOutlined, MinusCircleOutlined } from '@aelf-design/icons';
import { ReactComponent as QuestionIcon } from 'assets/imgs/question-icon.svg';
import './index.css';
import { curChain } from 'config';
import Button from 'components/Button';
import Tooltip from 'components/Tooltip';
import Input from 'components/Input';
import { Controller, UseFormReturn } from 'react-hook-form';
import FormItem from 'components/FormItem';
import { useState } from 'react';
import clsx from 'clsx';

interface ValidatorRule {
  validator: (rule: any, value: any) => Promise<void>;
}
interface IFormMembersProps {
  name: string;
  initialValue: string[];
  form: UseFormReturn;
  hiddenExtraWhenEmpty?: boolean;
  titleNode?: React.ReactNode;
  emptyNode?: React.ReactNode;
  footNode?: React.ReactNode;
  rules?: ValidatorRule[];
  disableInput?: boolean;
}
function FormMembers(props: IFormMembersProps) {
  const { name, initialValue, form } = props;
  const { watch, control } = form;
  const fields = watch(name);
  const [addressList, setAddressList] = useState<string[]>(initialValue);

  const showNullWhenEmpty = !fields?.length;

  const removeItem = (index: number) => {
    if (addressList.length <= 1) return;
    const originList = [...addressList];
    originList.splice(index, 1);
    setAddressList(originList);
  };

  const addItem = () => {
    const originList = [...addressList, ''];
    setAddressList(originList);
  };
  return (
    <>
      <FormItem
        label={
          <Tooltip
            title={
              <div>
                There is no limit on the number of addresses on your multisig. Addresses can create
                proposals, create and approve transactions, and suggest changes to the DAO settings
                after creation.
              </div>
            }
          >
            <span className="flex items-center text-descM15 text-white font-Montserrat gap-[8px]">
              Multisig Members Address
              <i className="tmrwdao-icon-document text-[18px] text-white" />
            </span>
          </Tooltip>
        }
      >
        {addressList.map((address, index) => (
          <Controller
            key={`${address}_${index}`}
            name={name}
            control={control}
            rules={{
              required: 'Address is required',
              validate: {
                validator: (value) => {
                  if (value.endsWith(`AELF`)) {
                    return 'Must be a SideChain address';
                  }
                  if (!value.startsWith(`ELF`) || !value.endsWith(curChain)) {
                    return 'Must be a valid address';
                  }
                },
              },
            }}
            render={({ field }) => (
              <div className="flex items-center">
                <Input
                  {...field}
                  value={address}
                  placeholder={`Enter ELF_..._${curChain}`}
                  onChange={(value) => {
                    const newList = [...addressList];
                    newList[index] = value;
                    setAddressList(newList);
                    field.onChange(newList);
                  }}
                />
                <i
                  className={clsx(
                    'tmrwdao-icon-circle-minus text-white text-[22px] ml-[6px] cursor-pointer',
                    {
                      'text-darkGray': addressList.length <= 1,
                    },
                  )}
                  onClick={() => removeItem(index)}
                />
              </div>
            )}
          />
        ))}

        {/* <Form.Item
                required={false}
                key={`${field}_${index}`}
                className="dynamic-form-item-wrap"
              >
                <Form.Item
                  {...field}
                  validateFirst
                  rules={[
                    {
                      required: true,
                      message: 'Address is required',
                    },
                    {
                      validator: (_, value) => {
                        return new Promise<void>((resolve, reject) => {
                          if (value.endsWith(`AELF`)) {
                            reject(new Error('Must be a SideChain address'));
                          }
                          if (!value.startsWith(`ELF`) || !value.endsWith(curChain)) {
                            reject(new Error('Must be a valid address'));
                          }
                          resolve();
                        });
                      },
                    },
                  ]}
                  noStyle
                >
                  <Input placeholder={`Enter ELF_..._${curChain}`} />
                </Form.Item>
                {fields.length > 1 ? (
                  <div className="text-[24px] cursor-pointer">
                    <MinusCircleOutlined
                      className="delete-dynamic-form-item-icon-small delete-dynamic-form-item-icon-with-hover"
                      onClick={() => remove(field.name)}
                    />
                  </div>
                ) : null}
              </Form.Item> */}
        <div className="dynamic-form-buttons text-neutralTitle">
          {showNullWhenEmpty ? null : (
            <>
              <Button className="!py-[2px] !text-[12px]" type="default" onClick={() => addItem()}>
                <i className="tmrwdao-icon-circle-add text-[22px] mr-[6px]" />
                Add Address
              </Button>
              <Button
                className="!py-[2px] !text-[12px]"
                type="default"
                onClick={() => {
                  form.setValue(name, []);
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

export default FormMembers;
