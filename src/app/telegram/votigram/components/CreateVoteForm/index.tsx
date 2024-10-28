import { Form, Button } from 'antd';
import { Input } from 'aelf-design';
import { UpOutlined, DownOutlined } from '@aelf-design/icons';
import AWSUpload from 'components/S3Upload';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { FormInstance } from 'antd/lib';
import { ISubmitFile } from 'types';
import useInputForceRender from '../../hook/use-input-force-render';
import { uploadImageAccept } from '../../const';
export interface IOptionFormSubmitValue {
  title: string;
  icon?: ISubmitFile[];
  description?: string;
  longDescription?: string;
  url?: string;
  screenshots?: ISubmitFile[];
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
  const domWrapRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const handleOpen = () => {
    setIsOpen(!isOpen);
  };

  const handleFormSubmit = async () => {
    try {
      const res = await form.validateFields();
      props.onSubmit(res);
    } catch (error) {
      console.log('error', error);
    }
  };
  useImperativeHandle(ref, () => ({
    form,
  }));
  useEffect(() => {
    form.setFieldsValue(initialValues);
  }, [initialValues, form]);
  useInputForceRender(domWrapRef);
  return (
    <div ref={domWrapRef}>
      <Form
        form={form}
        layout="vertical"
        name="votigram-create-vote-option-form"
        autoComplete="off"
        requiredMark={false}
        scrollToFirstError
      >
        <Form.Item
          name={'title'}
          label={
            <span>
              Name
              <span className="form-item-label-custom-required-mark"> *</span>
            </span>
          }
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
          <Input placeholder={`Enter a name for the option (20 characters max). `} />
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
              accept={uploadImageAccept}
              extensions={['png', 'jpg', 'jpeg']}
              maxFileCount={1}
              needCheckImgSize
              fileLimit="10 MB"
              fileLimitTip="5 MB"
              needCrop
              ratio={1}
              ratioErrorText="The ratio of the image is incorrect, please upload an image with a ratio of 1:1"
              tips={
                <span className="TMRWDAO-upload-button-upload-tips">
                  Formats supported: PNG and JPG.
                  <br />
                  Ratio: 1:1, less than 5 MB.
                </span>
              }
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
              accept={uploadImageAccept}
              extensions={['png', 'jpg', 'jpeg']}
              maxFileCount={9}
              fileLimit="10 MB"
              fileLimitTip="5 MB"
              tips={
                <span className="TMRWDAO-upload-button-upload-tips">
                  Formats supported: PNG and JPG.
                  <br />
                  less than 5 MB.
                </span>
              }
            />
          </Form.Item>
        </div>
        <div>
          <Button type="primary" onClick={handleFormSubmit}>
            Confirm
          </Button>
        </div>
      </Form>
    </div>
  );
});
export default CreateVoteOptionForm;
