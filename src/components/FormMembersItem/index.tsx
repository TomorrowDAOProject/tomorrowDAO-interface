import { Form, FormInstance } from 'antd';
import { Input, Tooltip, Button } from 'aelf-design';
import { AddCircleOutlined, DeleteOutlined, MinusCircleOutlined } from '@aelf-design/icons';
import { ReactComponent as QuestionIcon } from 'assets/imgs/question-icon.svg';
import './index.css';
import { curChain } from 'config';

interface ValidatorRule {
  validator: (rule: any, value: any) => Promise<void>;
}
interface IFormMembersProps {
  name: string | string[];
  initialValue: string[];
  form: FormInstance;
  hiddenExtraWhenEmpty?: boolean;
  titleNode?: React.ReactNode;
  emptyNode?: React.ReactNode;
  footNode?: React.ReactNode;
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
    rules,
    disableInput = false,
  } = props;
  const fields = Form.useWatch(name, form);

  const showNullWhenEmpty = hiddenExtraWhenEmpty && !fields?.length;
  return (
    <>
      <div>
        {showNullWhenEmpty ? null : titleNode ? (
          titleNode
        ) : (
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
              Multisig Members Address
              <QuestionIcon className="cursor-pointer " width={16} height={16} />
            </span>
          </Tooltip>
        )}
      </div>
      <Form.List
        name={name}
        rules={[
          {
            validator: async (_, lists) => {
              if (!lists || lists.length < 1) {
                return Promise.reject(new Error('At least input one address'));
              }
            },
          },
          ...(rules ?? []),
        ]}
        initialValue={initialValue}
      >
        {(fields, { add, remove }, { errors }) => (
          <>
            {emptyNode && !fields?.length
              ? emptyNode
              : fields.map((field, index) => (
                  <Form.Item
                    // label={index === 0 ? 'Passengers' : ''}
                    required={false}
                    key={field.key}
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
                      <Input placeholder={`Enter ELF_..._${curChain}`} disabled={disableInput} />
                    </Form.Item>
                    {fields.length > 1 ? (
                      <div className="text-[24px] cursor-pointer">
                        <MinusCircleOutlined
                          className="delete-dynamic-form-item-icon-small delete-dynamic-form-item-icon-with-hover"
                          onClick={() => remove(field.name)}
                        />
                      </div>
                    ) : null}
                  </Form.Item>
                ))}

            <div className="dynamic-form-buttons text-neutralTitle">
              {showNullWhenEmpty ? null : footNode ? (
                footNode
              ) : (
                <>
                  <Button
                    className="dynamic-form-buttons-item"
                    type="default"
                    size="medium"
                    onClick={() => add()}
                    icon={<AddCircleOutlined className="text-[16px] " />}
                  >
                    <span className="card-sm-text-bold ">Add address</span>
                  </Button>
                  <Button
                    type="default"
                    size="medium"
                    onClick={() => {
                      form.setFieldValue(name, []);
                    }}
                    className="dynamic-form-buttons-item"
                    icon={<DeleteOutlined className="text-[16px]" />}
                  >
                    <span className="card-sm-text-bold ">Delete all</span>
                  </Button>
                </>
              )}
            </div>
            {!!errors.length && (
              <div className="error-text">
                <Form.ErrorList errors={errors} />
              </div>
            )}
          </>
        )}
      </Form.List>
      {showNullWhenEmpty ? null : (
        <div className="mt-[32px]">
          <div className="flex justify-between">
            <span className="flex items-center form-item-title pb-[8px] justify-between">
              Total Addresses
            </span>
            <span className="text-[16px] leading-[24px] font-medium text-neutralPrimaryText">
              {fields?.length ?? initialValue.length}
            </span>
          </div>
          <div className="text-[12px] leading-[20px] text-Neutral-Secondary-Text mb-[32px]">
            Your connected wallet has been automatically added to the list. You can remove it if
            you&apos;d like.
          </div>
        </div>
      )}
    </>
  );
}

export default FormMembersItem;
