import { Form, FormInstance } from 'antd';
import { Input, Button } from 'aelf-design';
import {
  AddCircleOutlined,
  DeleteOutlined,
  DownOutlined,
  UpOutlined,
  MinusCircleOutlined,
} from '@aelf-design/icons';
import './index.css';
import { FormListFieldData } from 'antd/lib/form/FormList';
import { useState } from 'react';
import AWSUpload from 'components/S3Upload';
import { FormListProps } from 'antd/es/form/FormList';
import { NamePath } from 'antd/es/form/interface';
import { EOptionType } from '../type';

interface IFormListFullItemValue {
  title: string;
  icon?: string;
  description?: string;
  longDescription?: string;
  url?: string;
  screenshots?: string[];
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
  total: number;
  index: number;
  onRemove?: () => void;
}
function FormListFullItems(props: IFormItemsProps) {
  const { field, onRemove, total, index } = props;
  const [isOpen, setIsOpen] = useState(false);
  const handleOpen = () => {
    setIsOpen(!isOpen);
  };
  return (
    <div className="dynamic-option-item w-full card-shape p-[24px]">
      {total > 1 && (
        <div className="flex justify-between">
          <span className="card-sm-text-bold mb-[16px]">Option {index + 1}</span>
          <span onClick={onRemove}>
            <MinusCircleOutlined className="delete-dynamic-form-item-icon-middle delete-dynamic-form-item-icon-with-hover" />
          </span>
        </div>
      )}
      <Form.Item
        name={[field.name, 'title']}
        label="Name"
        required
        labelCol={{
          span: 4,
        }}
        rules={[
          {
            required: true,
            message: 'The name is required',
          },
          {
            type: 'string',
            max: 20,
            message: 'The name should contain no more than 20 characters.',
          },
        ]}
      >
        <Input placeholder={`Enter a name for the option(20 characters max). `} />
      </Form.Item>
      <div onClick={handleOpen} className="flex-center my-[16px] cursor-pointer">
        <span className="pr-[4px]">Optional</span> {isOpen ? <UpOutlined /> : <DownOutlined />}
      </div>
      <div className={`${isOpen ? 'block' : 'hidden'}`}>
        <Form.Item
          name={[field.name, 'icon']}
          label={'Logo'}
          valuePropName="fileList"
          labelCol={{
            span: 4,
          }}
        >
          <AWSUpload
            accept=".png,.jpg,.jpeg"
            maxFileCount={1}
            tips="Formats supported: PNG and JPG. Ratio: 1:1, less than 10 MB"
            needCheckImgSize
            ratio={1}
            needCrop
            fileLimit="10 MB"
            ratioErrorText="The ratio of the image is incorrect, please upload an image with a ratio of 1:1"
          />
        </Form.Item>
        <Form.Item
          validateFirst
          rules={[
            {
              type: 'string',
              max: 80,
              message: 'The summary should contain no more than 80 characters.',
            },
          ]}
          name={[field.name, 'description']}
          label="Summary"
          labelCol={{
            span: 4,
          }}
        >
          <Input.TextArea placeholder={`Enter a summary for the option(80 characters max). `} />
        </Form.Item>
        <Form.Item
          validateFirst
          rules={[
            {
              type: 'string',
              max: 1000,
              message: 'Enter a description for the option(1000 characters max).',
            },
          ]}
          name={[field.name, 'longDescription']}
          label="Description"
          labelCol={{
            span: 4,
          }}
        >
          <Input.TextArea
            placeholder={`Enter a description for the option(1000 characters max). `}
          />
        </Form.Item>
        <Form.Item
          name={[field.name, 'url']}
          label="URL"
          labelCol={{
            span: 4,
          }}
          rules={[
            {
              type: 'url',
              message: 'Please enter a correct link.',
            },
          ]}
        >
          <Input placeholder={`Enter a link for the option. `} />
        </Form.Item>
        <Form.Item
          name={[field.name, 'screenshots']}
          label="Image"
          valuePropName="fileList"
          labelCol={{
            span: 4,
          }}
          className="dymaic-form-item-screenshots"
        >
          <AWSUpload
            accept=".png,.jpg,.jpeg"
            maxFileCount={9}
            fileLimit="10 MB"
            tips="Formats supported: PNG and JPG. less than 10 MB."
            needCrop
          />
        </Form.Item>
      </div>
    </div>
  );
}
function FormListSimpleItems(props: IFormItemsProps) {
  const { field, onRemove, index } = props;
  return (
    <div className="dynamic-option-simple-item w-full">
      <Form.Item
        name={[field.name, 'title']}
        required
        rules={[
          {
            required: true,
            message: 'The name is required',
          },
          {
            type: 'string',
            max: 20,
            message: 'The name should contain no more than 20 characters.',
          },
        ]}
      >
        <Input placeholder={`Enter a name for the option(20 characters max). `} />
      </Form.Item>
      <div className="flex justify-between">
        <span onClick={onRemove} className="cursor-pointer">
          <MinusCircleOutlined className=" delete-dynamic-form-item-icon-with-hover delete-dynamic-form-item-icon-small" />
        </span>
      </div>
    </div>
  );
}
function FormListDymanic(props: IFormListDymanicProps) {
  const { name, initialValue, form, rules, optionType } = props;

  return (
    <div className="dynamic-form-list">
      <Form.Item required label="Options">
        <Form.List name={name} initialValue={initialValue} rules={[...(rules ?? [])]}>
          {(fields, { add, remove }, { errors }) => {
            return (
              <>
                {fields.map((field, index) => (
                  <Form.Item key={field.key} className={`${optionType} dynamic-form-item-wrap`}>
                    {optionType === EOptionType.advanced ? (
                      <FormListFullItems
                        field={field}
                        total={fields.length}
                        onRemove={() => {
                          remove(field.name);
                        }}
                        index={index}
                      />
                    ) : (
                      <FormListSimpleItems
                        field={field}
                        total={fields.length}
                        onRemove={() => {
                          remove(field.name);
                        }}
                        index={index}
                      />
                    )}
                  </Form.Item>
                ))}

                <div className="flex justify-between lg:items-center items-start lg:flex-row flex-col">
                  <div className="dynamic-form-buttons text-neutralTitle">
                    <Button
                      className="dynamic-form-buttons-item"
                      type="default"
                      size="medium"
                      onClick={() => add()}
                      icon={<AddCircleOutlined className="text-[16px] " />}
                    >
                      <span className="card-sm-text-bold ">Add option</span>
                    </Button>
                    <Button
                      type="default"
                      size="medium"
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
                  <div className="card-sm-text text-Disable-Text lg:mt-0 mt-[16px]">
                    <span className="text-neutralPrimaryText">{fields.length}</span> Options in
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
    </div>
  );
}

export default FormListDymanic;
