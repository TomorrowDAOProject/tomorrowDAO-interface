import { useMemo } from 'react';
import { Typography, FontWeightEnum } from 'aelf-design';
import './index.css';
import { StepEnum } from '../../type';
import { useRegisterForm } from '../utils';
import { Controller, useForm } from 'react-hook-form';
import FormItem from 'components/FormItem';
import Upload from 'components/Upload';

const { Title } = Typography;

const FILE_LIMIT = '20 MB';
const MAX_FILE_COUNT = 20;
export default function ContractsAndFiles() {
  const form = useForm({
    defaultValues: {
      files: [],
    },
  });
  const {
    watch,
    control,
    formState: { errors },
  } = form;
  useRegisterForm(form, StepEnum.step3);

  const fileList = watch('files') ?? [];

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
      <form>
        <FormItem label="Logo" errorText={errors?.files?.message}>
          <Controller
            name="files"
            control={control}
            rules={{
              required: 'Add at least one documentation',
              validate: {
                validator: (v) =>
                  v.length <= 20 ||
                  `You have reached the maximum limit of 20 files. Please consider removing some files before uploading a new one. If you need further assistance, you can join TMRWDAO's Telegram group.`,
              },
            }}
            render={({ field }) => (
              <Upload
                accept=".pdf"
                className="mx-auto"
                needCheckImgSize
                fileLimit={FILE_LIMIT}
                uploadText="Click to Upload"
                tips={uploadTips}
                onFinish={({ url }) => {
                  const newFiles = [...fileList, url];
                  field.onChange(newFiles);
                }}
              />
            )}
          />
        </FormItem>
      </form>
    </div>
  );
}
