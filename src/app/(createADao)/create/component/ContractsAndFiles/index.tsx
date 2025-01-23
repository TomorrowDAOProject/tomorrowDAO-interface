import { useContext, useMemo } from 'react';
import { Typography, FontWeightEnum } from 'aelf-design';
import { Form } from 'antd';
import IPFSUpload from 'components/IPFSUpload';
import './index.css';
import { StepEnum, StepsContext } from '../../type';
import { useRegisterForm, validatorCreate } from '../utils';

const { Title } = Typography;

const FILE_LIMIT = '20 MB';
const MAX_FILE_COUNT = 20;
const MAX_FILE_NAME_LENGTH = 128;
export default function ContractsAndFiles() {
  const [form] = Form.useForm();
  useRegisterForm(form, StepEnum.step3);
  const { stepForm } = useContext(StepsContext);

  const fileList = Form.useWatch('files', form) ?? [];

  const isUploadDisabled = useMemo(() => {
    return fileList.length >= MAX_FILE_COUNT;
  }, [fileList.length]);

  const uploadTips = useMemo(() => {
    if (isUploadDisabled) {
      return (
        <p>
          You have reached the maximum limit of {MAX_FILE_COUNT} files. Please consider removing
          some files before uploading a new one. If you need further assistance, you can join
          TMRWDAO&apos;s
          <a href="https://t.me/tmrwdao" target="_blank" rel="noreferrer" className="px-[4px]">
            Telegram
          </a>
          group.
        </p>
      );
    } else {
      return (
        <>
          <p>Format supported: PDF.</p>
          <p>Size: Less than {FILE_LIMIT}. </p>
        </>
      );
    }
  }, [isUploadDisabled]);

  return (
    <div className="contracts-and-files">
      <Title className="primary-text" level={6} fontWeight={FontWeightEnum.Medium}>
        Documentation
      </Title>
      <Title className="secondary-text">
        It is recommended to upload at least a project whitepaper and roadmap
      </Title>
      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
        requiredMark={false}
        scrollToFirstError={true}
        onValuesChange={(_a, values) => {
          stepForm[StepEnum.step3].submitedRes = values;
        }}
      >
        <Form.Item
          name={'files'}
          validateFirst={true}
          rules={[
            {
              required: true,
              type: 'array',
              message: 'Add at least one documentation',
            },
            validatorCreate(
              (v) => v.length > 20,
              `You have reached the maximum limit of 20 files. Please consider removing some files before uploading a new one. If you need further assistance, you can join TMRWDAO's Telegram group.`,
            ),
          ]}
          valuePropName="fileList"
          initialValue={[]}
        >
          <IPFSUpload
            className="upload"
            isAntd
            accept=".pdf"
            fileLimit={FILE_LIMIT}
            maxCount={MAX_FILE_COUNT}
            fileNameLengthLimit={MAX_FILE_NAME_LENGTH}
            uploadIconColor="#1A1A1A"
            uploadText="Click to Upload"
            tips={uploadTips}
            disabled={isUploadDisabled}
          />
        </Form.Item>
      </Form>
    </div>
  );
}
