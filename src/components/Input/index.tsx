import clsx from 'clsx';
import React, { ReactNode, useEffect, useState } from 'react';

interface IInputProps {
  value?: string;
  maxLength?: number;
  defaultValue?: string;
  className?: string;
  placeholder?: string;
  showClearBtn?: boolean;
  disabled?: boolean;
  suffix?: ReactNode;
  onChange?: (value: string) => void;
  onBlur?(): void;
}

const Input = ({
  value: parentValue,
  defaultValue,
  placeholder,
  className,
  maxLength,
  showClearBtn,
  disabled,
  suffix,
  onChange,
  onBlur,
}: IInputProps) => {
  const [value, setValue] = useState(defaultValue || '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value || '');
    onChange?.(e.target.value || '');
  };

  const clearInput = () => {
    setValue('');
    onChange?.('');
  };

  useEffect(() => {
    setValue(parentValue || '');
  }, [parentValue]);

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={value}
        disabled={disabled}
        maxLength={maxLength}
        onChange={handleChange}
        className={clsx(
          'w-full border border-solid border-fillBg8 rounded-[8px] pl-[16px] pr-10 py-[13px] bg-transparent text-white text-desc14 font-normal leading-[19px] placeholder-lightGrey focus:outline-none transition duration-300 ease-in-out',
          className,
        )}
        onBlur={onBlur}
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

export default Input;
