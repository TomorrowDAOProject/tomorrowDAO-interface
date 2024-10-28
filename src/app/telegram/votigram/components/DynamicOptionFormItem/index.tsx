import { Form, FormInstance, Button } from 'antd';
import { useUpdate } from 'ahooks';
import {
  AddCircleOutlined,
  DeleteOutlined,
  MinusCircleOutlined,
  EditOutlined,
} from '@aelf-design/icons';
import './index.css';
import { FormListFieldData } from 'antd/lib/form/FormList';
import { useState, useRef } from 'react';
import { FormListProps } from 'antd/es/form/FormList';
import { NamePath } from 'antd/es/form/interface';
import { EOptionType } from 'pageComponents/proposal-create-option/type';
import CommonDrawer, { ICommonDrawerRef } from '../../components/CommonDrawer';
import CreateVoteOptionForm, { IOptionFormSubmitValue } from '../../components/CreateVoteForm';
import VoteItem from '../VoteItem';
import { ISubmitFile } from 'types';

interface IFormListFullItemValue {
  title: string;
  icon?: ISubmitFile[];
  description?: string;
  longDescription?: string;
  url?: string;
  screenshots?: ISubmitFile[];
}
interface IFormListDymanicProps {
  name: NamePath;
  initialValue: IFormListFullItemValue[];
  form: FormInstance;
  rules?: FormListProps['rules'];
  optionType?: EOptionType;
}
interface IFormItemsProps {
  field: FormListFieldData;
  form: FormInstance;
  total: number;
  index: number;
  formValue: IFormListFullItemValue;
  onRemove?: () => void;
  onEdit?: () => void;
}
function FormListFullItems(props: IFormItemsProps) {
  const { field, onRemove, total, index, form, formValue, onEdit } = props;
  const voteItem = {
    ...formValue,
    icon: formValue?.icon?.[0]?.url,
    screenshots: formValue?.screenshots?.map((item) => item.url),
    alias: field.name.toString(),
  };
  return (
    <div className="form-option-render">
      <div className="mb-[16px] flex items-center justify-between">
        <span>Option</span>
        <span onClick={onRemove} className="text-[20px]">
          <MinusCircleOutlined />
        </span>
      </div>
      <div className="form-option-render-update">
        <VoteItem
          canVote={false}
          index={index}
          showVoteAndLike={false}
          showRankIndex={false}
          item={{
            ...voteItem,
          }}
        />
        <Button type="text" onClick={onEdit} className="edit-icon">
          <EditOutlined />
        </Button>
      </div>
    </div>
  );
}
enum EOptionSubmitType {
  add = 'add',
  edit = 'edit',
}
interface IOptionSubmitInfo {
  type: EOptionSubmitType;
  fieldName?: number;
}
const defaultOptionSubmitInfo: IOptionSubmitInfo = {
  type: EOptionSubmitType.add,
};
function FormListDymanic(props: IFormListDymanicProps) {
  const { name, initialValue, form, rules, optionType } = props;

  const update = useUpdate();

  const options = Form.useWatch('options', { form });

  const createVoteOptionDrawerRef = useRef<ICommonDrawerRef>(null);
  const submitType = useRef<IOptionSubmitInfo>(defaultOptionSubmitInfo);
  const handleSubmit = (values: IOptionFormSubmitValue) => {
    const { type, fieldName } = submitType.current;
    if (type === EOptionSubmitType.add) {
      form.setFieldValue(name, [...form.getFieldValue(name), values]);
      update();
    } else {
      form.setFieldValue([name, fieldName], values);
      update();
    }
    createVoteOptionDrawerRef.current?.close();
    form.validateFields([name]);
  };
  const [initialValues, setInitialValues] = useState<any>([]);
  const handleEdit = (fieldName: number) => {
    createVoteOptionDrawerRef.current?.open();
    submitType.current = {
      type: EOptionSubmitType.edit,
      fieldName,
    };
    const formValue = form.getFieldValue([name, fieldName]) as IOptionFormSubmitValue;
    setInitialValues(formValue);
    // createOptionFormRef.current?.form.setFieldsValue(convertValue);
  };

  return (
    <div className="votigram-create-dynamic-form-list">
      <Form.Item
        required
        labelCol={{
          span: 24,
        }}
        label={
          <span className="flex justify-between w-full">
            <span>
              Options
              <span className="form-item-label-custom-required-mark"> *</span>
            </span>
            {options?.length === 0 && (
              <span className="text-[#F4AC33] text-[14px]">
                Please add at least
                <span className="font-semibold"> 2 </span>
                options
              </span>
            )}
          </span>
        }
        shouldUpdate={true}
      >
        <Form.List name={name} initialValue={initialValue} rules={[...(rules ?? [])]}>
          {(fields, { add, remove }, { errors }) => {
            return (
              <>
                {fields.map((field, index) => {
                  return (
                    <Form.Item key={field.key} className={`${optionType} dynamic-form-item-wrap`}>
                      <FormListFullItems
                        form={form}
                        field={field}
                        total={fields.length}
                        formValue={form.getFieldValue([name, field.name])}
                        onRemove={() => {
                          remove(field.name);
                        }}
                        onEdit={() => {
                          handleEdit(field.name);
                        }}
                        index={index}
                      />
                    </Form.Item>
                  );
                })}

                <div className="flex justify-between lg:items-center items-start lg:flex-row flex-col">
                  <div className="dynamic-form-buttons text-neutralTitle">
                    <Button
                      className="dynamic-form-buttons-item"
                      type="text"
                      onClick={() => {
                        submitType.current = {
                          type: EOptionSubmitType.add,
                        };
                        setInitialValues({});
                        createVoteOptionDrawerRef.current?.open();
                      }}
                      icon={<AddCircleOutlined className="text-[16px] " />}
                    >
                      <span className="card-sm-text-bold ">Add option</span>
                    </Button>
                    <Button
                      type="text"
                      onClick={() => {
                        form.setFieldValue(name, []);
                        form.validateFields([name]);
                      }}
                      className="dynamic-form-buttons-item"
                      icon={<DeleteOutlined className="text-[16px]" />}
                    >
                      <span className="card-sm-text-bold ">Delete all</span>
                    </Button>
                  </div>
                  <div className="card-sm-text text-baseBorder lg:mt-0 mt-[16px]">
                    <span className="text-[#51FF00] font-bold">{fields.length}</span> Options in
                    Total
                  </div>
                </div>
                {!!errors.length && (
                  <div className="error-text">
                    <Form.ErrorList errors={errors} />
                  </div>
                )}
              </>
            );
          }}
        </Form.List>
      </Form.Item>
      <CommonDrawer
        title={`Add Option`}
        ref={createVoteOptionDrawerRef}
        drawerProps={{
          destroyOnClose: true,
        }}
        bodyClassname="create-vote-option-drawer"
        headerClassname="create-vote-option-drawer-header"
        body={
          <div className="">
            <CreateVoteOptionForm onSubmit={handleSubmit} initialValues={initialValues} />
          </div>
        }
      />
    </div>
  );
}

export default FormListDymanic;
