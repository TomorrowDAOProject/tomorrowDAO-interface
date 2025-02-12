import { forwardRef, ReactNode, useEffect, useImperativeHandle, useRef, useState } from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import pinFileToIPFS from 'components/PinFileToIPFS';
import { toast } from 'react-toastify';
import { checkImgRatio, checkImgSize } from 'utils/checkImgSize';
import { emitLoading } from 'utils/myEvent';
import Drawer from 'components/Drawer';
import Cropper, { Area } from 'react-easy-crop';
import { getCroppedImg } from 'utils/canvasUtils';
import { blobToFile } from 'utils/file';
import Slider from 'components/Slider';
import Button from 'components/Button';

interface IUploadProps {
  extensions?: string[];
  fileLimit?: string;
  className?: string;
  needCrop?: boolean;
  needCheckImgSize?: boolean;
  children?: ReactNode;
  uploadText?: string;
  accept?: string;
  tips?: ReactNode;
  value?: string;
  preview?: boolean;
  ratio?: number | [number, number];
  ratioErrorText?: string;
  fileNameLengthLimit?: number;
  aspect?: number;
  onStart?(): void;
  verify?(): boolean;
  onFileChange?(file: File): void;
  onFinish?(data: { url: string; name: string; response: { url: string } }): void;
}

export interface IRefHandle {
  reset(): void;
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

const Upload = forwardRef<IRefHandle, IUploadProps>(
  (
    {
      className,
      children,
      uploadText,
      tips,
      accept,
      value,
      ratio,
      aspect,
      preview = true,
      ratioErrorText,
      fileLimit = '1 MB',
      needCheckImgSize,
      fileNameLengthLimit,
      needCrop,
      onStart,
      verify,
      onFileChange,
      onFinish,
    },
    ref,
  ) => {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [loading, setLoading] = useState(false);
    const [imageSrc, setImageSrc] = useState<string>(value || '');
    const [cropping, setCropping] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [croppedImage, setCroppedImage] = useState<Blob | null>();
    const [croppedImageUrl, setCropedImageUrl] = useState<string>();

    const onCropComplete = (_: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    };

    const showCroppedImage = async () => {
      if (!imageSrc || !croppedAreaPixels) return;
      try {
        const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
        if (croppedImage) {
          const file = blobToFile(croppedImage);
          setCropedImageUrl(URL.createObjectURL(croppedImage));
          setCroppedImage(croppedImage);
          handleUpload(file);
          setCropping(false);
          setImageSrc('');
        }
      } catch (error) {
        console.error(error);
      }
    };

    const handleClick = () => {
      if (verify && !verify()) return;
      if (!loading && fileInputRef.current) {
        fileInputRef.current.click();
      }
    };

    const onBeforeUpload = async (file: File) => {
      const isLteLimit = file.size <= handleLimit(fileLimit);
      if (!isLteLimit) {
        const contentType = needCheckImgSize ? 'Image' : 'File';
        toast.error(
          `${contentType} too large. Please upload an ${contentType} no larger than ${fileLimit}`,
        );
        return false;
      }

      if (needCheckImgSize) {
        if (ratio) {
          const checkSize = await checkImgRatio(file, ratio ?? 0);
          if (!checkSize) {
            toast.error(ratioErrorText ?? 'Please upload an image with a aspect ratio.');
            return false;
          }
        } else {
          const checkSize = await checkImgSize(file);
          if (!checkSize) {
            toast.error('Please upload an image with the same width and height.');
            return false;
          }
        }
      }

      if (fileNameLengthLimit) {
        const isLengthLteLimit = file.name.length <= fileNameLengthLimit;
        if (!isLengthLteLimit) {
          toast.error(
            `The filename is too long, please shorten it to ${fileNameLengthLimit} characters.`,
          );
          return false;
        }
      }

      return true;
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        onFileChange?.(file);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        const result = await onBeforeUpload(file);
        if (!result) return;
        if (file?.type?.includes('image')) {
          const imageDataUrl = (await readFile(file)) as string;
          setImageSrc(imageDataUrl);
          if (needCrop) {
            setCropping(true);
            return;
          }
          handleUpload(file);
        } else {
          handleUpload(file);
        }
      }
    };

    const handleUpload = async (file: File) => {
      try {
        setLoading(true);
        emitLoading(true, 'Loading.....');
        onStart?.();
        const uploadData = await pinFileToIPFS(file as File);
        if (!uploadData.cid) {
          toast.error('upload no hash');
          return;
        }
        const fileUrl = uploadData?.url ?? '';
        onFinish?.({ url: fileUrl, name: file.name, response: { url: fileUrl } });
      } catch (error) {
        toast.error(`Please check your internet connection and try again.`);
      } finally {
        emitLoading(false);
        setLoading(false);
      }
    };

    useEffect(() => {
      setImageSrc(value || '');
    }, [value]);

    useImperativeHandle(ref, () => ({
      reset: () => {
        setImageSrc('');
        setCroppedImage(null);
        setCropedImageUrl(undefined);
      },
    }));

    return (
      <>
        <div
          className={clsx(
            'relative p-3 w-full h-[250px] flex flex-col items-center justify-center bg-fillBg8 rounded-[12px] border-none cursor-pointer overflow-hidden',
            className,
          )}
          onClick={handleClick}
        >
          {(imageSrc || croppedImage) && preview ? (
            <Image
              src={imageSrc || croppedImageUrl || ''}
              width={250}
              height={250}
              className="w-full h-full object-contain"
              alt="Banner"
            />
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
                <span className="font-Montserrat text-center text-[11px] text-lightGrey leading-[17.6px] whitespace-pre-wrap">
                  {tips}
                </span>
              )}
            </>
          )}
          <input
            type="file"
            ref={fileInputRef}
            className="!hidden"
            accept={accept || '.png, .jpg, .jpeg'}
            onChange={handleFileChange}
          />
        </div>
        <Drawer
          isVisible={cropping}
          direction="bottom"
          onClose={() => setCropping(false)}
          rootClassName="p-6 md:!w-[668px] !h-[534px] bg-darkBg h-screen rounded-none"
        >
          <div className="w-full h-full">
            <span className="mb-6 block font-Montserrat text-descM16 text-white text-center">
              Picture Editor
            </span>
            <div className="relative h-[326px] bg-neutralHoverBg">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                rotation={rotation}
                onCropChange={setCrop}
                onRotationChange={setRotation}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div className="flex items-center justify-center gap-3 mt-6 mb-8">
              <i
                className="tmrwdao-icon-minus text-[20px] text-white cursor-pointer"
                onClick={() => setZoom((prev) => (prev <= 5 ? 1 : prev - 5))}
              />
              <Slider
                className="w-full lg:w-3/5 md:w-3/5"
                min={1}
                max={100}
                step={1}
                value={zoom}
                showValue={false}
                onChange={setZoom}
              />
              <i
                className="tmrwdao-icon-plus text-[20px] text-white cursor-pointer"
                onClick={() => setZoom((prev) => (prev > 95 ? 100 : prev + 5))}
              />
            </div>
            <div className="flex items-center justify-between">
              <i
                className="tmrwdao-icon-refresh text-[20px] text-white cursor-pointer"
                onClick={() => setZoom(1)}
              />
              <div className="flex items-center gap-2">
                <Button
                  type="default"
                  onClick={() => {
                    setCropping(false);
                    setImageSrc('');
                    setCroppedImage(null);
                    setCropedImageUrl(undefined);
                  }}
                >
                  Cancel
                </Button>
                <Button type="primary" onClick={showCroppedImage}>
                  OK
                </Button>
              </div>
            </div>
          </div>
        </Drawer>
      </>
    );
  },
);

export default Upload;
