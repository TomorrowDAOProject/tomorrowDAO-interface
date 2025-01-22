import clsx from 'clsx';
import React, { forwardRef, LegacyRef, ReactNode, useEffect, useState } from 'react';

interface IInputProps {
  value?: string;
  maxLength?: number;
  defaultValue?: string;
  className?: string;
  placeholder?: string;
  showClearBtn?: boolean;
  disabled?: boolean;
  suffix?: ReactNode;
  regExp?: RegExp;
  onChange?: (value: string) => void;
  onBlur?(value: string): void;
  isError?: boolean;
}

const Input = (
  {
    value: parentValue,
    defaultValue,
    placeholder,
    className,
    maxLength,
    showClearBtn,
    disabled,
    suffix,
    regExp,
    onChange,
    onBlur,
    isError,
  }: IInputProps,
  ref: LegacyRef<HTMLInputElement>,
) => {
  const [value, setValue] = useState(defaultValue || '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (regExp && !regExp?.test(e.target.value)) return;
    setValue(e.target.value || '');
    onChange?.(e.target.value || '');
  };

  const clearInput = () => {
    setValue('');
    onChange?.('');
  };

  useEffect(() => {
    if (parentValue && regExp && !regExp?.test(parentValue)) return;
    setValue(parentValue || '');
  }, [parentValue, regExp]);

  return (
    <div className="relative w-full">
      <input
        ref={ref}
        type="text"
        value={value}
        disabled={disabled}
        maxLength={maxLength}
        onChange={handleChange}
        className={clsx(
          'w-full border border-solid border-fillBg8 rounded-[8px] pl-[16px] pr-10 py-[13px] bg-transparent text-white text-desc14 font-normal leading-[19px] placeholder-lightGrey focus:outline-none transition duration-300 ease-in-out',
          {
            'border-mainColor': isError,
          },
          className,
        )}
        onBlur={() => onBlur?.(value)}
        placeholder={placeholder || 'Please Enter...'}
      />
      <div className="absolute top-1/2 right-[14px] -translate-y-1/2 flex flex-row gap-2">
        {value && showClearBtn && (
          <button
            type="button"
            onClick={clearInput}
            className="p-0 m-0 w-[15px] h-[15px] flex items-center justify-center bg-app-icon-border text-tertiary rounded-[50%] flex-none"
          >
            <i className="votigram-icon-cancel text-[8px] leading-[8px] text-tertiary" />
          </button>
        )}
        {suffix && <span className="text-lightGrey text-desc14">{suffix}</span>}
      </div>
    </div>
  );
};

export default forwardRef(Input);
