import { useRef, useState } from 'react';
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

function FormListFullItems(props: IFormItemsProps) {
  const { field, onRemove, index, onChange } = props;
  const {
    control,
    trigger,
    watch,
    getValues,
    formState: { errors },
  } = useForm({
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

  const onBlur = async () => {
    const values = getValues();
    onChange?.(values);
    trigger();
  };

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
            <Input
              {...field}
              placeholder="Enter a name for the option (20 characters max)"
              isError={!!errors?.title?.message}
              onBlur={onBlur}
            />
          )}
        />
      </FormItem>
      <div className="flex items-center justify-center mb-[15px]">
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
        <FormItem label="Logo" errorText={errors?.icon?.message} layout="horizontal">
          <Controller
            name="icon"
            control={control}
            render={({ field }) => (
              <>
                <Upload
                  ref={uploadRef}
                  className="!w-[250px]"
                  value={field.value}
                  ratio={1}
                  uploadText="Upload"
                  tips={`Formats supported: PNG, JPG, JPEG. \nRatio 1:1, less than 1 MB.`}
                  ratioErrorText="The ratio of the image is incorrect, please upload an image with a ratio of 1:1"
                  onFinish={({ url }) => {
                    field.onChange(url);
                    onBlur();
                  }}
                  needCrop
                  needCheckImgSize
                />

                {icon && (
                  <div className="flex items-center justify-between py-1 md:px-3 mt-[15px] mx-auto">
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
              </>
            )}
          />
        </FormItem>
        <FormItem label="Summary" errorText={errors?.description?.message} layout="horizontal">
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
                rootClassName="lg:h-full"
                containerClassName="flex-grow"
                maxLength={80}
                placeholder={`Enter a description for the option (80 characters max)`}
                isError={!!errors?.description?.message}
                onBlur={onBlur}
              />
            )}
          />
        </FormItem>
        <FormItem label="Description" errorText={errors?.description?.message} layout="horizontal">
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
                rootClassName="lg:h-full"
                containerClassName="flex-grow"
                maxLength={1000}
                placeholder={`Enter a description for the option (1000 characters max)`}
                isError={!!errors?.description?.message}
                onBlur={onBlur}
              />
            )}
          />
        </FormItem>
        <FormItem label="Name" errorText={errors?.url?.message} layout="horizontal">
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
        <FormItem label="Image" errorText={errors?.icon?.message} layout="horizontal">
          <Controller
            name="screenshots"
            control={control}
            render={({ field }) => (
              <>
                {screenshots.length <= 9 && (
                  <Upload
                    ref={uploadRef}
                    className="!w-[250px]"
                    ratio={1}
                    uploadText="Upload"
                    tips={`Formats supported: PNG, JPG, JPEG. \nRatio 1:1, less than 1 MB.`}
                    ratioErrorText="The ratio of the image is incorrect, please upload an image with a ratio of 1:1"
                    onFinish={({ url }) => {
                      field.onChange(url);
                      onBlur();
                    }}
                    needCrop
                    needCheckImgSize
                  />
                )}

                {icon && (
                  <div className="flex items-center justify-between py-1 md:px-3 mt-[15px] mx-auto">
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
              </>
            )}
          />
        </FormItem>
      </div>
    </div>
  );
}
function FormListSimpleItems(props: IFormItemsProps) {
  const { field, onRemove, onChange } = props;
  const {
    control,
    trigger,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: field,
    mode: 'onChange',
  });

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
}
function FormListDymanic(props: IFormListDymanicProps) {
  const { onChange, initialValue, optionType } = props;
  const [options, setOptions] = useState(initialValue || []);

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
            />
          ) : (
            <FormListSimpleItems
              field={field}
              onRemove={() => handleRemove(index)}
              onChange={(values) => handleChange(index, values)}
              index={index}
            />
          )}
        </div>
      ))}
      <div className="flex items-center justify-between">
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
        <span className="font-Montserrat text-desc12 text-lightGrey">
          <span className="text-white">{options.length}</span> Options in Total
        </span>
      </div>
    </>
  );
}

export default FormListDymanic;
