import { useContext, useMemo } from 'react';
import { Typography, FontWeightEnum } from 'aelf-design';
import { Form } from 'antd';
import IPFSUpload from 'components/IPFSUpload';
import './index.css';
import { StepEnum, StepsContext } from '../../type';
import { useRegisterForm } from '../utils';

const { Title } = Typography;

const FILE_LIMIT = '20M';
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
      return `You have reached the upload limit of ${MAX_FILE_COUNT} files. Please remove an existing file to upload a new one, or add the telegram group if you need assistance with managing your files.`;
    } else {
      return `Only supports .pdf format less than ${FILE_LIMIT}.`;
    }
  }, [isUploadDisabled]);

  return (
    <div className="contracts-and-files">
      <Title className="primary-text" level={6} fontWeight={FontWeightEnum.Medium}>
        Documentation
      </Title>
      <Title className="secondary-text">
        It is recommended to upload at least a white paper and a roadmap.
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
              min: 1,
              max: 20,
              message: `You have reached the maximum limit of 20 files. Please consider removing some files before uploading a new one. If you need further assistance, you can join TMRWDAO's Telegram group.`,
            },
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
