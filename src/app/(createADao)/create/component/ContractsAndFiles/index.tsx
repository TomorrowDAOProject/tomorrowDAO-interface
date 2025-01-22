import { useMemo, useState } from 'react';
import './index.css';
import { StepEnum } from '../../type';
import { useRegisterForm } from '../utils';
import { Controller, useForm } from 'react-hook-form';
import FormItem from 'components/FormItem';
import Upload from 'components/Upload';
import Spinner from 'components/Spinner';
import { shortenFileName } from 'utils/file';

type ReturnUploadType = {
  url: string;
  name: string;
  response: { url: string };
};

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
    setValue,
  } = form;
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  useRegisterForm(form, StepEnum.step3);

  const fileList: ReturnUploadType[] = watch('files') ?? [];

  const isUploadDisabled = useMemo(() => {
    return fileList.length >= MAX_FILE_COUNT;
  }, [fileList.length]);

  const handleFileChange = (file: File) => {
    setFiles((prev) => [...prev, file]);
  };

  const handleRemoveFile = (key: string) => {
    setFiles((prev) => prev.filter((file, index) => `${file.name}_${index}` !== key));
    const updateList: any = fileList.filter((file, index) => `${file.name}_${index}` !== key);
    setValue('files', updateList);
  };

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
    <FormItem
      label={
        <>
          <p className="!mb-[15px] text-descM16 text-white font-Montserrat">Documentation</p>
          <p className="font-Montserrat text-desc12 text-lightGrey font-Montserrat">
            It is recommended to upload at least a project whitepaper and roadmap
          </p>
        </>
      }
      errorText={errors?.files?.message}
    >
      <Controller
        name="files"
        control={control}
        rules={{
          required: false,
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
            onStart={() => setLoading(true)}
            onFileChange={handleFileChange}
            onFinish={(file) => {
              const newFiles = [...fileList, file];
              field.onChange(newFiles);
            }}
          />
        )}
      />
      <div className="mt-[15px]">
        {files?.map(({ name }, index) => (
          <div
            className="flex items-center justify-between py-1 px-3 mt-2"
            key={`${name}_${index}`}
          >
            <div className="flex items-center flex-grow">
              {fileList.filter((item) => item.name === name).length > 0 ? (
                <i className="text-lightGrey tmrwdao-icon-document text-[20px]" />
              ) : loading ? (
                <Spinner size={20} />
              ) : (
                <span className="w-[20px] h-[20px] rounded-[10px] bg-danger leading-[20px] text-center">
                  <i className="tmrwdao-icon-cross text-[12px] text-darkBg" />
                </span>
              )}
              <span className="ml-2 text-lightGrey text-desc12 font-Montserrat">
                {shortenFileName(name)}
              </span>
            </div>
            <i
              className="tmrwdao-icon-delete text-[20px] text-Neutral-Secondary-Text"
              onClick={() => handleRemoveFile(`${name}_${index}`)}
            />
          </div>
        ))}
      </div>
    </FormItem>
  );
}
