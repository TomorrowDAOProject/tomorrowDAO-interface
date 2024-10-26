import React, { useEffect, useMemo, useState } from 'react';
import { Upload, IUploadProps } from 'aelf-design';
import { RefreshOutlined } from '@aelf-design/icons';
import { GetProp, UploadFile, UploadProps, message } from 'antd';
import ImgCrop, { ImgCropProps } from 'antd-img-crop';
import clsx from 'clsx';
import { fileUplaod } from 'api/request';
export type TFileType = Parameters<GetProp<IUploadProps, 'beforeUpload'>>[0];
import { checkImgRatio } from 'utils/checkImgSize';
import './index.css';
import { CloseIcon } from 'components/Icons';
import { RcFile } from 'antd/es/upload';

const COMMON_UPLOAD_INPUT_ID = 'common-upload-input-id';

export interface IFUploadProps extends Omit<IUploadProps, 'onChange'> {
  maxFileCount?: number;
  fileLimit?: string;
  fileNameLengthLimit?: number;
  fileList?: UploadFile[];
  isAntd?: boolean;
  needCheckImgSize?: boolean;
  needCrop?: boolean;
  ratio?: number | [number, number];
  ratioErrorText?: string;
  onChange?: (fileList: UploadFile[]) => void;
  extensions?: string[];
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
const AWSUpload: React.FC<IFUploadProps> = ({
  isAntd = false,
  needCheckImgSize = false,
  fileList,
  maxFileCount = 10,
  fileLimit = '1 MB',
  fileNameLengthLimit,
  onChange,
  tips,
  uploadText,
  uploadIconColor,
  disabled,
  ratio,
  ratioErrorText,
  needCrop,
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
  const acceptCheck = (file: RcFile) => {
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const acceptExt = props?.extensions ?? [];
    console.log('acceptExt', acceptExt, fileExt, file);
    if (acceptExt.length && !acceptExt.includes(fileExt ?? '')) {
      return false;
    }
    return true;
  };

  const onBeforeUpload = async (file: TFileType) => {
    let result = true;
    console.log('onBeforeUpload', file);

    const acceptCheckResult = props?.extensions ? acceptCheck(file) : true;
    console.log('acceptCheckResult', acceptCheckResult, props?.extensions);
    if (!acceptCheckResult) {
      message.error('The file format is incorrect, please upload the correct file format');
      return false;
    }

    const isLteLimit = file.size <= handleLimit(fileLimit);
    if (!isLteLimit) {
      const contentType = needCheckImgSize ? 'Image' : 'File';
      message.error(
        `${contentType} too large. Please upload an ${contentType} no larger than ${fileLimit}`,
      );
    }
    result = acceptCheckResult && isLteLimit;

    if (needCheckImgSize) {
      const checkSize = await checkImgRatio(file, ratio ?? 0);
      if (!checkSize) {
        message.error(ratioErrorText ?? 'Please upload an image with a aspect ratio.');
      }
      result = result && checkSize;
    }

    if (fileNameLengthLimit) {
      const isLengthLteLimit = file.name.length <= fileNameLengthLimit;
      if (!isLengthLteLimit) {
        message.error(
          `The filename is too long, please shorten it to ${fileNameLengthLimit} characters.`,
        );
      }
      result = result && isLengthLteLimit;
    }

    return result;
  };

  const onCustomRequest: IUploadProps['customRequest'] = async ({ file, onSuccess, onError }) => {
    try {
      const uploadData = await fileUplaod({
        file: file as File,
      });
      if (!uploadData?.data) {
        onError?.(new Error('upload failed'));
        return;
      }
      const fileUrl = uploadData?.data ?? '';
      onSuccess?.({ url: fileUrl });
    } catch (error) {
      message.error(`Please check your internet connection and try again.`);
      onError?.(error as Error);
    } finally {
      //
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
    maxCount: maxFileCount,
  };

  const Wrap = needCrop ? ImgCrop : React.Fragment;

  const imgCropRatio = Array.isArray(ratio) ? ratio[1] : ratio;
  const imgCropProps: Partial<ImgCropProps> = {
    aspect: imgCropRatio,
    showReset: true,
    zoomSlider: true,
    resetText: (<RefreshOutlined />) as unknown as string,
    modalTitle: 'Picture Editor',
    modalProps: {
      closeIcon: <CloseIcon />,
    },
    modalClassName: 'tg-common-modal tg-common-modal-crop',
    beforeCrop: (file) => {
      const res = acceptCheck(file);
      return res;
    },
  };
  const wrapProps = needCrop ? imgCropProps : {};

  return (
    <div className="aws-upload-wrap">
      <Wrap {...wrapProps}>
        <Upload {...commonProps} {...uploadButtonProps} showUploadButton={showUploadBtn} />
      </Wrap>
    </div>
  );
};

export default AWSUpload;
