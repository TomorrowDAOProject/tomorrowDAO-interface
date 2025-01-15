import { forwardRef, LegacyRef, ReactNode, useRef, useState } from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import LoadingComponent from '../LoadingComponent';
import pinFileToIPFS from 'components/PinFileToIPFS';
import { toast } from 'react-toastify';
import { checkImgSize } from 'utils/checkImgSize';

interface IUploadProps {
  extensions?: string[];
  fileLimit?: string;
  className?: string;
  needCheckImgSize?: boolean;
  children?: ReactNode;
  uploadText?: string;
  tips?: string;
  fileNameLengthLimit?: number;
  onFinish?(data: { url: string }): void;
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

const readFile = (file: File) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(reader.result), false);
    reader.readAsDataURL(file);
  });
};

const Upload = (
  {
    className,
    children,
    uploadText,
    tips,
    fileLimit = '1 MB',
    needCheckImgSize,
    fileNameLengthLimit,
    onFinish,
  }: IUploadProps,
  ref: LegacyRef<HTMLInputElement>,
) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>();

  const handleClick = () => {
    if (!loading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const onBeforeUpload = async (file: File) => {
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageDataUrl = (await readFile(file)) as string;
      setImageSrc(imageDataUrl);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      handleUpload(file);
    }
  };

  const handleUpload = async (file: File) => {
    const result = onBeforeUpload(file);
    if (!result) return;
    try {
      setLoading(true);
      const uploadData = await pinFileToIPFS(file as File);
      if (!uploadData.cid) {
        toast.error('upload no hash');
        return;
      }
      const fileUrl = uploadData?.url ?? '';
      onFinish?.({ url: fileUrl });
    } catch (error) {
      toast.error(`Please check your internet connection and try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={clsx(
        'relative w-full h-[250px] p-[11px] flex flex-col items-center justify-center bg-fillBg8 rounded-[12px] border-none cursor-pointer overflow-hidden',
        className,
      )}
      onClick={handleClick}
    >
      {imageSrc ? (
        <Image src={imageSrc} className="w-full h-full object-cover" alt="Banner" />
      ) : children ? (
        children
      ) : (
        <>
          <i className="tmrwdao-icon-upload text-[28px] text-white" />
          {uploadText && (
            <span className="mt-[11px] mb-1 font-Unbounded text-[15px] font-light text-white -tracking-[0.6px]">
              {uploadText}
            </span>
          )}
          {tips && (
            <span className="font-Montserrat text-center text-[11px] text-lightGrey leading-[17.6px] text-white whitespace-pre-wrap">
              {tips}
            </span>
          )}
        </>
      )}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".png, .jpg, .jpeg"
        onChange={handleFileChange}
      />

      {loading && <LoadingComponent className="absolute top-0 left-0 right-0 bottom-0 z-10" />}
    </div>
  );
};

export default forwardRef(Upload);
