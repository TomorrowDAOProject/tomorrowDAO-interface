import { useRef, useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { EOptionType } from '../type';
import { Controller, useForm } from 'react-hook-form';
import FormItem from 'components/FormItem';
import Input from 'components/Input';
import Textarea from 'components/Textarea';
import Button from 'components/Button';
import Upload, { IRefHandle } from 'components/Upload';
import { shortenFileName } from 'utils/file';
import clsx from 'clsx';
import { urlRegex } from 'app/(createADao)/create/component/utils';
import { useLandingPageResponsive } from 'hooks/useResponsive';

interface IFormListFullItemValue {
  title: string;
  icon?: string;
  description?: string;
  longDescription?: string;
  url?: string;
  screenshots?: string[];
}
interface IFormListDymanicProps {
  initialValue: IFormListFullItemValue[];
  optionType?: EOptionType;
  onChange?(options: IFormListFullItemValue[]): void;
}
interface IFormItemsProps {
  field: IFormListFullItemValue;
  index: number;
  onRemove?: () => void;
  onChange?(options: IFormListFullItemValue): void;
}

export interface IFormListDymanicRef {
  validate(): Promise<boolean>;
  getValues(): IFormListFullItemValue[];
}

interface IFormRef {
  trigger: () => Promise<boolean>;
  getValues: () => IFormListFullItemValue;
}

const FormListDymanic = forwardRef<IFormListDymanicRef, IFormListDymanicProps>((props, ref) => {
  const { onChange, initialValue, optionType } = props;
  const [options, setOptions] = useState(initialValue || []);
  const formRefs = useRef<Array<IFormRef | null>>([]);

  useImperativeHandle(ref, () => ({
    async validate() {
      const results = await Promise.all(
        formRefs.current.map(async (formRef) => {
          if (formRef?.trigger) {
            const isValid = await formRef.trigger();
            return isValid;
          }
          return true;
        }),
      );
      return results.every(Boolean);
    },
    getValues() {
      return options;
    },
  }));

  const handleRemove = (index: number) => {
    let originLinks = [...options];
    if (options.length === 1) {
      originLinks = [{ title: '' }];
    } else {
      originLinks.splice(index, 1);
    }
    setOptions(originLinks);
    onChange?.(originLinks);
  };

  const handleChange = (index: number, values: IFormListFullItemValue) => {
    const opts = [...options];
    opts[index] = values;
    setOptions(opts);
    onChange?.(opts);
  };

  return (
    <>
      {options?.map((field, index) => (
        <div key={`${field.title}_${index}`}>
          {optionType === EOptionType.advanced ? (
            <FormListFullItems
              field={field}
              onRemove={() => handleRemove(index)}
              onChange={(values) => handleChange(index, values)}
              index={index}
              ref={(el) => {
                formRefs.current[index] = el;
              }}
            />
          ) : (
            <FormListSimpleItems
              field={field}
              onRemove={() => handleRemove(index)}
              onChange={(values) => handleChange(index, values)}
              index={index}
              ref={(el) => {
                formRefs.current[index] = el;
              }}
            />
          )}
        </div>
      ))}
      <div className="flex md:items-center justify-between md:flex-row flex-col gap-4">
        <div className="flex items-center gap-[9px]">
          <Button
            className="!py-1 !text-[12px]"
            type="default"
            onClick={() => {
              const originList = [...options, { title: '' }];
              setOptions(originList);
              onChange?.(originList);
            }}
          >
            <i className="tmrwdao-icon-circle-add text-[22px] mr-[6px]" />
            Add option
          </Button>
          <Button
            className="!py-1 !text-[12px]"
            type="default"
            onClick={() => {
              setOptions([{ title: '' }]);
              onChange?.([{ title: '' }]);
            }}
          >
            <i className="tmrwdao-icon-delete text-[22px] mr-[6px]" />
            Delete All
          </Button>
        </div>
        <span className="block text-right font-Montserrat text-desc12 text-lightGrey">
          <span className="text-white">{options.length}</span> Options in Total
        </span>
      </div>
    </>
  );
});

const FormListFullItems = forwardRef<IFormRef, IFormItemsProps>((props, ref) => {
  const { field, onRemove, index, onChange } = props;
  const {
    control,
    trigger,
    watch,
    getValues,
    formState: { errors },
  } = useForm<IFormListFullItemValue>({
    defaultValues: field,
    mode: 'onChange',
  });

  const [isOpen, setIsOpen] = useState(false);
  const uploadRef = useRef<IRefHandle | null>(null);
  const handleOpen = () => {
    setIsOpen(!isOpen);
  };
  const icon = watch('icon');
  const screenshots = watch('screenshots') ?? [];

  const { isPhone } = useLandingPageResponsive();

  const onBlur = async () => {
    const values = getValues();
    onChange?.(values);
    trigger();
  };

  useImperativeHandle(ref, () => ({
    trigger,
    getValues,
  }));

  return (
    <div className="mb-[15px] p-5 border border-solid border-fillBg8 rounded-[8px]">
      <div className="flex justify-between mb-[15px]">
        <span className="text-descM14 text-white font-Montserrat">Option {index + 1}</span>
        <i
          className="tmrwdao-icon-circle-minus text-white text-[22px] ml-[6px] cursor-pointer"
          onClick={onRemove}
        />
      </div>
      <FormItem
        label="Name"
        className="!mb-[15px]"
        errorText={errors?.title?.message}
        layout={isPhone ? 'vertical' : 'horizontal'}
      >
        <Controller
          name="title"
          control={control}
          rules={{
            required: 'The name is required',
            maxLength: {
              value: 20,
              message: 'The name should contain no more than 20 characters.',
            },
          }}
          render={({ field }) => (
            <Input
              {...field}
              maxLength={20}
              placeholder="Enter a name for the option (20 characters max)"
              isError={!!errors?.title?.message}
              onBlur={onBlur}
            />
          )}
        />
      </FormItem>
      <div
        className={clsx('flex items-center justify-center', {
          'mb-[15px]': isOpen,
        })}
      >
        <div onClick={handleOpen} className="mx-auto inline-flex items-center cursor-pointer">
          <span className="text-descM14 text-white font-Montserrat">Optional</span>
          <i
            className={clsx(
              'tmrwdao-icon-down-arrow text-white text-[22px] ml-[6px] transition-all',
              {
                '-rotate-180': isOpen,
              },
            )}
          />
        </div>
      </div>
      <div className={`${isOpen ? 'block' : 'hidden'}`}>
        <FormItem
          label="Logo"
          className="!mb-[15px]"
          errorText={errors?.icon?.message}
          layout={isPhone ? 'vertical' : 'horizontal'}
        >
          <Controller
            name="icon"
            control={control}
            render={({ field }) => (
              <div className="flex flex-col gap-2">
                <Upload
                  ref={uploadRef}
                  className="!w-[250px]"
                  value={field.value}
                  ratio={1}
                  aspect={1}
                  fileLimit="10 MB"
                  uploadText="Upload"
                  tips={`Formats supported: PNG and JPG. \nRatio 1:1, less than 10 MB.`}
                  ratioErrorText="The ratio of the image is incorrect, please upload an image with a ratio of 1:1"
                  onFinish={({ url }) => {
                    field.onChange(url);
                    onBlur();
                  }}
                  needCrop
                  needCheckImgSize
                />

                {icon && (
                  <div className="flex items-stretch justify-between py-1 md:px-3 mt-[7px] mx-auto w-[250px]">
                    <div className="flex items-center flex-grow">
                      <i className="text-lightGrey tmrwdao-icon-upload-document text-[20px]" />
                      <span className="ml-2 text-lightGrey text-desc14 font-Montserrat">
                        {shortenFileName(icon)}
                      </span>
                    </div>
                    <i
                      className="tmrwdao-icon-circle-minus text-[22px] ml-[6px] cursor-pointer text-Neutral-Secondary-Text"
                      onClick={() => {
                        field.onChange('');
                        uploadRef.current?.reset();
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          />
        </FormItem>
        <FormItem
          label="Summary"
          className="!mb-[15px]"
          errorText={errors?.description?.message}
          layout={isPhone ? 'vertical' : 'horizontal'}
        >
          <Controller
            name="description"
            control={control}
            rules={{
              maxLength: {
                value: 80,
                message: 'The summary should contain no more than 80 characters.',
              },
            }}
            render={({ field }) => (
              <Textarea
                {...field}
                rootClassName="lg:h-full min-h-[61px]"
                containerClassName="flex-grow"
                maxLength={80}
                showLimit={false}
                placeholder={`Enter a description for the option (80 characters max)`}
                isError={!!errors?.description?.message}
                onBlur={onBlur}
              />
            )}
          />
        </FormItem>
        <FormItem
          label="Description"
          className="!mb-[15px]"
          errorText={errors?.description?.message}
          layout={isPhone ? 'vertical' : 'horizontal'}
        >
          <Controller
            name="longDescription"
            control={control}
            rules={{
              maxLength: {
                value: 80,
                message: 'The description should contain no more than 1000 characters.',
              },
            }}
            render={({ field }) => (
              <Textarea
                {...field}
                rootClassName="lg:h-full min-h-[61px]"
                containerClassName="flex-grow"
                maxLength={1000}
                showLimit={false}
                placeholder={`Enter a description for the option (1000 characters max)`}
                isError={!!errors?.description?.message}
                onBlur={onBlur}
              />
            )}
          />
        </FormItem>
        <FormItem
          label="URL"
          className="!mb-[15px]"
          errorText={errors?.url?.message}
          layout={isPhone ? 'vertical' : 'horizontal'}
        >
          <Controller
            name="url"
            control={control}
            rules={{
              validate: {
                validator: (value) =>
                  !value || (value && urlRegex.test(value)) || 'Please enter a correct link.',
              },
            }}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="Enter a link for the option"
                isError={!!errors?.url?.message}
                onBlur={onBlur}
              />
            )}
          />
        </FormItem>
        <FormItem
          label="Image"
          className="!mb-0"
          errorText={errors?.icon?.message}
          layout={isPhone ? 'vertical' : 'horizontal'}
        >
          <Controller
            name="screenshots"
            control={control}
            render={({ field }) => (
              <div className="flex flex-col gap-2 flex-grow">
                {screenshots.length <= 9 && (
                  <Upload
                    ref={uploadRef}
                    uploadText="Upload"
                    fileLimit="10 MB"
                    tips={`Formats supported: PNG and JPG. \nless than 10 MB.`}
                    ratioErrorText="The ratio of the image is incorrect, please upload an image with a ratio of 1:1"
                    onFinish={({ url }) => {
                      field.onChange([...screenshots, url]);
                      onBlur();
                    }}
                    preview={false}
                    needCheckImgSize
                  />
                )}

                {screenshots?.map((item, index) => (
                  <div
                    className="flex items-center justify-between py-1 md:px-3 mt-[7px] mx-auto w-full"
                    key={`${item}_${index}`}
                  >
                    <div className="flex items-center flex-grow">
                      <i className="text-lightGrey tmrwdao-icon-upload-document text-[20px]" />
                      <span className="ml-2 text-lightGrey text-desc14 font-Montserrat">
                        {shortenFileName(item)}
                      </span>
                    </div>
                    <i
                      className="tmrwdao-icon-circle-minus text-[22px] ml-[6px] cursor-pointer text-Neutral-Secondary-Text"
                      onClick={() => {
                        const newScreenshots = [...screenshots];
                        newScreenshots.splice(index, 1);
                        field.onChange(newScreenshots);
                        onBlur();
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          />
        </FormItem>
      </div>
    </div>
  );
});

const FormListSimpleItems = forwardRef<IFormRef, IFormItemsProps>((props, ref) => {
  const { field, onRemove, onChange } = props;
  const {
    control,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<IFormListFullItemValue>({
    defaultValues: field,
    mode: 'onChange',
  });

  useImperativeHandle(ref, () => ({
    trigger,
    getValues,
  }));

  const onBlur = () => {
    const values = getValues();
    onChange?.(values);
    trigger();
  };

  return (
    <div className="flex items-center mb-[15px]">
      <FormItem
        className="!mb-0 w-full"
        rowClassName="gap-[8px] items-center"
        errorText={errors?.title?.message}
        layout="horizontal"
      >
        <Controller
          name="title"
          control={control}
          rules={{
            required: 'The name is required',
            maxLength: {
              value: 20,
              message: 'The name should contain no more than 20 characters.',
            },
          }}
          render={({ field }) => (
            <>
              <Input
                {...field}
                maxLength={20}
                placeholder="Enter a name for the option (20 characters max)"
                isError={!!errors?.title?.message}
                onBlur={onBlur}
              />
              <i
                className="tmrwdao-icon-circle-minus text-white text-[22px] ml-[6px] cursor-pointer"
                onClick={onRemove}
              />
            </>
          )}
        />
      </FormItem>
    </div>
  );
});

export default FormListDymanic;
