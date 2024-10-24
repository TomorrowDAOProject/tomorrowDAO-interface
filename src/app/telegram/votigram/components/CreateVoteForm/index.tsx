import { Form, Button } from 'antd';
import { Input } from 'aelf-design';
import { UpOutlined, DownOutlined } from '@aelf-design/icons';
import AWSUpload from 'components/S3Upload';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { FormInstance } from 'antd/lib';
export interface IOptionFormSubmitValue {
  title: string;
  icon?: string;
  description?: string;
  longDescription?: string;
  url?: string;
  screenshots?: string[];
}
interface ICreateFormProps {
  onSubmit: (values: IOptionFormSubmitValue) => void;
  initialValues?: IOptionFormSubmitValue;
}
export interface ICreateFormRef {
  form: FormInstance;
}
const CreateVoteOptionForm = forwardRef<ICreateFormRef, ICreateFormProps>((props, ref) => {
  const { initialValues } = props;
  const [form] = Form.useForm();
  const [isOpen, setIsOpen] = useState(false);
  const handleOpen = () => {
    setIsOpen(!isOpen);
  };

  const handleFormSubmit = async () => {
    try {
      const res = await form.validateFields();
      const submitValues: IOptionFormSubmitValue = {
        ...res,
        icon: res?.icon?.[0]?.url,
        screenshots: res?.screenshots?.map((item: any) => item.url),
      };
      props.onSubmit(submitValues);
    } catch (error) {
      console.log('error', error);
    }
  };
  useImperativeHandle(ref, () => ({
    form,
  }));
  useEffect(() => {
    const convertValue = {
      ...initialValues,
      icon: initialValues?.icon
        ? [{ url: initialValues.icon, uid: initialValues.icon, name: 'icon.png', status: 'done' }]
        : [],
      screenshots: initialValues?.screenshots?.map((item, i) => ({
        url: item,
        uid: item,
        name: i + '.png',
        status: 'done',
      })),
    };
    form.setFieldsValue(convertValue);
  }, [initialValues, form]);
  return (
    <Form
      form={form}
      layout="vertical"
      name="votigram-create-vote-option-form"
      autoComplete="off"
      scrollToFirstError
    >
      <Form.Item
        name={'title'}
        label="Name"
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
      <div
        onClick={handleOpen}
        className={`flex-center mt-[16px] cursor-pointer optional-form-expand ${
          isOpen ? 'mb-[16px]' : ''
        }`}
      >
        <span className="pr-[4px]">Optional</span> {isOpen ? <UpOutlined /> : <DownOutlined />}
      </div>
      <div className={`${isOpen ? 'block' : 'hidden'}`}>
        <Form.Item name={'icon'} label={'Logo'} valuePropName="fileList">
          <AWSUpload
            accept=".png,.jpg,.jpeg"
            maxFileCount={1}
            tips={'Formats supported: PNG and JPG. Ratio: 1:1, less than 1 MB'}
            needCheckImgSize
            needCrop
            ratio={1}
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
          name={'description'}
          label="Summary"
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
          name={'longDescription'}
          label="Description"
        >
          <Input.TextArea
            placeholder={`Enter a description for the option(1000 characters max). `}
          />
        </Form.Item>
        <Form.Item
          name={'url'}
          label="URL"
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
          name={'screenshots'}
          label={'Image'}
          valuePropName="fileList"
          className="dymaic-form-item-screenshots"
        >
          <AWSUpload
            accept=".png,.jpg,.jpeg"
            maxFileCount={9}
            tips={`Formats supported: PNG and JPG. less than 1 MB. `}
          />
        </Form.Item>
      </div>
      <div>
        <Button type="primary" onClick={handleFormSubmit}>
          Confirm
        </Button>
      </div>
    </Form>
  );
});
export default CreateVoteOptionForm;
