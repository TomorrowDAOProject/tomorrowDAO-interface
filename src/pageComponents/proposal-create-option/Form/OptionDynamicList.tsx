import { DownOutlined, UpOutlined, MinusCircleOutlined } from '@aelf-design/icons';
import './index.css';
import { useEffect, useRef, useState } from 'react';
import AWSUpload from 'components/S3Upload';
import { FormListProps } from 'antd/es/form/FormList';
import { NamePath } from 'antd/es/form/interface';
import { EOptionType } from '../type';
import { Controller, useForm, useWatch } from 'react-hook-form';
import FormItem from 'components/FormItem';
import Input from 'components/Input';
import Textarea from 'components/Textarea';
import Button from 'components/Button';
import Upload, { IRefHandle } from 'components/Upload';
import { shortenFileName } from 'utils/file';
import clsx from 'clsx';
import { useAsyncEffect } from 'ahooks';

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
  total: number;
  index: number;
  onRemove?: () => void;
  onChange?(options: IFormListFullItemValue): void;
}

function FormListFullItems(props: IFormItemsProps) {
  const { field, onRemove, total, index, onChange } = props;
  const {
    control,
    watch,
    trigger,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: field,
    mode: 'onChange',
  });
  const formValues = useWatch({ control });

  useAsyncEffect(async () => {
    const res = await trigger();
    if (res) {
      const values = getValues();
      onChange?.(values);
    }
  }, [formValues]);

  const [isOpen, setIsOpen] = useState(false);
  const uploadRef = useRef<IRefHandle | null>(null);
  const handleOpen = () => {
    setIsOpen(!isOpen);
  };
  const icon = watch('icon');

  return (
    <div className="dynamic-option-item w-full card-shape p-[24px]">
      {total > 1 && (
        <div className="flex justify-between">
          <span className="card-sm-text-bold mb-[16px]">Option {index + 1}</span>
          <span onClick={onRemove}>
            <MinusCircleOutlined className="delete-dynamic-form-item-icon-middle delete-dynamic-form-item-icon-with-hover" />
          </span>
        </div>
      )}
      <FormItem label="Name" errorText={errors?.title?.message}>
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
            />
          )}
        />
      </FormItem>
      <div onClick={handleOpen} className="flex-center my-[16px] cursor-pointer">
        <span className="pr-[4px]">Optional</span> {isOpen ? <UpOutlined /> : <DownOutlined />}
      </div>
      <div className={`${isOpen ? 'block' : 'hidden'}`}>
        <FormItem label="Logo" className="lg:mb-0" errorText={errors?.icon?.message}>
          <Controller
            name="icon"
            control={control}
            rules={{
              required: 'Logo is required',
            }}
            render={({ field }) => (
              <>
                <Upload
                  ref={uploadRef}
                  className="mx-auto !w-[250px]"
                  fileLimit="10 MB"
                  value={field.value}
                  ratio={1}
                  uploadText="Upload"
                  tips={`Formats supported: PNG, JPG, JPEG. \nRatio 1:1, less than 1 MB.`}
                  ratioErrorText="The ratio of the image is incorrect, please upload an image with a ratio of 1:1"
                  onFinish={({ url }) => field.onChange(url)}
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
        <FormItem
          label="Summary"
          className="lg:ml-[50px] lg:mb-0 md:flex-grow"
          errorText={errors?.description?.message}
        >
          <Controller
            name="description"
            control={control}
            rules={{
              required: 'Summary is required',
              maxLength: {
                value: 80,
                message: 'The summary should contain no more than 80 characters.',
              },
            }}
            render={({ field }) => (
              <Textarea
                {...field}
                containerClassName={clsx('lg:h-[calc(100%-34px)]', {
                  'lg:!h-[calc(100%-57px)]': !!errors?.description?.message,
                })}
                rootClassName="lg:h-full"
                maxLength={80}
                placeholder={`Enter a description for the option (80 characters max)`}
                isError={!!errors?.description?.message}
              />
            )}
          />
        </FormItem>
        <FormItem
          label="Description"
          className="lg:ml-[50px] lg:mb-0 md:flex-grow"
          errorText={errors?.description?.message}
        >
          <Controller
            name="longDescription"
            control={control}
            rules={{
              required: 'Description is required',
              maxLength: {
                value: 80,
                message: 'The description should contain no more than 1000 characters.',
              },
            }}
            render={({ field }) => (
              <Textarea
                {...field}
                containerClassName={clsx('lg:h-[calc(100%-34px)]', {
                  'lg:!h-[calc(100%-57px)]': !!errors?.description?.message,
                })}
                rootClassName="lg:h-full"
                maxLength={1000}
                placeholder={`Enter a description for the option (1000 characters max)`}
                isError={!!errors?.description?.message}
              />
            )}
          />
        </FormItem>
        <FormItem label="Name" errorText={errors?.url?.message}>
          <Controller
            name="url"
            control={control}
            rules={{
              validate: {
                validator: (value) => !value || 'Please enter a correct link.',
              },
            }}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="Enter a link for the option"
                isError={!!errors?.url?.message}
              />
            )}
          />
        </FormItem>
        <FormItem label="Image" className="lg:mb-0" errorText={errors?.icon?.message}>
          <Controller
            name="screenshots"
            control={control}
            rules={{
              required: 'Image is required',
            }}
            render={({ field }) => (
              <>
                <Upload
                  ref={uploadRef}
                  className="mx-auto !w-[250px]"
                  fileLimit="10 MB"
                  ratio={1}
                  uploadText="Upload"
                  tips={`Formats supported: PNG, JPG, JPEG. \nRatio 1:1, less than 1 MB.`}
                  ratioErrorText="The ratio of the image is incorrect, please upload an image with a ratio of 1:1"
                  onFinish={({ url }) => field.onChange(url)}
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
      </div>
    </div>
  );
}
function FormListSimpleItems(props: IFormItemsProps) {
  const { field, onRemove, onChange } = props;
  const [init, setInit] = useState(true);
  const {
    control,
    trigger,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: field,
    mode: 'onChange',
  });
  const formValues = useWatch({ control });

  useAsyncEffect(async () => {
    if (init) {
      setInit(false);
      return;
    }
    const res = await trigger();
    if (res) {
      const values = getValues();
      onChange?.(values);
    }
  }, [formValues]);

  return (
    <div className="dynamic-option-simple-item w-full">
      <FormItem errorText={errors?.title?.message}>
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
            />
          )}
        />
      </FormItem>
      <div className="flex justify-between">
        <span onClick={onRemove} className="cursor-pointer">
          <MinusCircleOutlined className=" delete-dynamic-form-item-icon-with-hover delete-dynamic-form-item-icon-small" />
        </span>
      </div>
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
    onChange?.(opts);
  };

  return (
    <div className="dynamic-form-list">
      {options?.map((field, index) => (
        <div key={`${field.title}_${index}`}>
          {optionType === EOptionType.advanced ? (
            <FormListFullItems
              field={field}
              total={options.length}
              onRemove={() => handleRemove(index)}
              onChange={(values) => handleChange(index, values)}
              index={index}
            />
          ) : (
            <FormListSimpleItems
              field={field}
              total={options.length}
              onRemove={() => handleRemove(index)}
              onChange={(values) => handleChange(index, values)}
              index={index}
            />
          )}
        </div>
      ))}
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
          Add Address
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
    </div>
  );
}

export default FormListDymanic;
