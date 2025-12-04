import React, { useEffect, useMemo, useState } from 'react';
import { Upload as AntdUpload } from 'antd';
import { Upload, IUploadProps, UploadButton } from 'aelf-design';
import { GetProp, UploadFile } from 'antd';
import clsx from 'clsx';
import pinFileToIPFS from 'components/PinFileToIPFS';
export type TFileType = Parameters<GetProp<IUploadProps, 'beforeUpload'>>[0];
import { checkImgSize } from 'utils/checkImgSize';
import './index.css';
import { toast } from 'react-toastify';

const COMMON_UPLOAD_INPUT_ID = 'common-upload-input-id';
import { emitLoading } from 'utils/myEvent';

export interface IFUploadProps extends Omit<IUploadProps, 'onChange'> {
  maxFileCount?: number;
  fileLimit?: string;
  fileNameLengthLimit?: number;
  fileList?: UploadFile[];
  isAntd?: boolean;
  needCheckImgSize?: boolean;
  onChange?: (fileList: UploadFile[]) => void;
}

const handleLimit = (limit: string) => {
  const unit_K = 1 * 1024;
  const unit_M = unit_K * 1024;

  if (limit.includes('MB')) {
    return +limit.replace('MB', '') * unit_M;
  }

  if (limit.includes('KB')) {
    return +limit.replace('KB', '') * unit_K;
  }

  return 10 * unit_M;
};
const FUpload: React.FC<IFUploadProps> = ({
  isAntd = false,
  needCheckImgSize = false,
  fileList,
  maxFileCount,
  fileLimit = '1 MB',
  fileNameLengthLimit,
  onChange,
  tips,
  uploadText,
  uploadIconColor,
  disabled,
  ...props
}) => {
  const [showUploadBtn, setShowUploadBtn] = useState<boolean>(false);
  const [inFileList, setFileList] = useState<UploadFile[]>([]);
  useEffect(() => {
    if (!maxFileCount) return setShowUploadBtn(true);
    setShowUploadBtn(inFileList.length < maxFileCount);
  }, [inFileList, maxFileCount]);

  useEffect(() => {
    setFileList(fileList || []);
  }, [fileList]);

  useEffect(() => {
    const input = document.getElementById(COMMON_UPLOAD_INPUT_ID);
    if (input) {
      if (disabled) {
        input.setAttribute('disabled', 'disabled');
      } else {
        input.removeAttribute('disabled');
      }
    }
  }, [disabled]);

  const onFileChange: IUploadProps['onChange'] = (info) => {
    const { file, fileList } = info;

    if (!file?.status) return;

    const newFileList = fileList
      .map((file) => {
        if (file.response) {
          file.url = file.response.url;
        }
        return file;
      })
      .filter((file) => file.status !== 'error');
    onChange?.(newFileList);
  };

  const onBeforeUpload = async (file: TFileType) => {
    let result = true;

    const isLteLimit = file.size <= handleLimit(fileLimit);
    if (!isLteLimit) {
      const contentType = needCheckImgSize ? 'Image' : 'File';
      toast.error(
        `${contentType} too large. Please upload an ${contentType} no larger than ${fileLimit}`,
      );
    }
    result = isLteLimit;

    if (needCheckImgSize) {
      const checkSize = await checkImgSize(file);
      if (!checkSize) {
        toast.error('Please upload an image with the same width and height.');
      }
      result = result && checkSize;
    }

    if (fileNameLengthLimit) {
      const isLengthLteLimit = file.name.length <= fileNameLengthLimit;
      if (!isLengthLteLimit) {
        toast.error(
          `The filename is too long, please shorten it to ${fileNameLengthLimit} characters.`,
        );
      }
      result = result && isLengthLteLimit;
    }

    return result;
  };

  const onCustomRequest: IUploadProps['customRequest'] = async ({ file, onSuccess, onError }) => {
    try {
      emitLoading(true, 'Uploading...');
      const uploadData = await pinFileToIPFS(file as File);
      if (!uploadData.cid) {
        onError?.(new Error('upload no hash'));
        return;
      }
      const fileUrl = uploadData?.url ?? '';
      onSuccess?.({ url: fileUrl });
    } catch (error) {
      toast.error(`Please check your internet connection and try again.`);
      onError?.(error as Error);
    } finally {
      emitLoading(false);
    }
  };

  const uploadButtonProps = useMemo(() => {
    return {
      uploadText,
      tips,
      uploadIconColor,
    };
  }, [uploadText, tips, uploadIconColor]);

  const commonProps = {
    ...props,
    id: COMMON_UPLOAD_INPUT_ID,
    className: clsx(props.className, 'common-upload', disabled && 'common-upload-disabled'),
    fileList: inFileList,
    onChange: onFileChange,
    beforeUpload: onBeforeUpload,
    customRequest: onCustomRequest,
  };

  return isAntd ? (
    <AntdUpload {...commonProps}>
      <UploadButton {...uploadButtonProps} />
    </AntdUpload>
  ) : (
    <Upload {...commonProps} {...uploadButtonProps} showUploadButton={showUploadBtn} />
  );
};

export default FUpload;
