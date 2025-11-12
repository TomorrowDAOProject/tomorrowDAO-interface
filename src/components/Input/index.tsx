import clsx from 'clsx';
import React, { forwardRef, LegacyRef, ReactNode, useEffect, useState, useRef } from 'react';

interface IInputProps {
  type?: 'text' | 'number';
  value?: string;
  maxLength?: number;
  defaultValue?: string;
  className?: string;
  placeholder?: string;
  showClearBtn?: boolean;
  disabled?: boolean;
  suffix?: ReactNode;
  regExp?: RegExp;
  precision?: number;
  onChange?: (value: string) => void;
  onBlur?(value: string): void;
  onPressEnter?: (value: string) => void;
  isError?: boolean;
  prefix?: ReactNode;
  rootClassName?: string;
  enterKeyHint?: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send';
}

const Input = (
  {
    type = 'text',
    value: parentValue,
    defaultValue,
    placeholder,
    className,
    maxLength,
    showClearBtn,
    disabled,
    suffix,
    prefix,
    regExp,
    precision,
    onChange,
    onBlur,
    onPressEnter,
    isError,
    enterKeyHint,
    rootClassName,
  }: IInputProps,
  ref: LegacyRef<HTMLInputElement>,
) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [value, setValue] = useState(defaultValue || '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (regExp && !regExp?.test(e.target.value)) return;
    const value = e.target.value;
    if (precision && type === 'number') {
      setValue(Number(value)?.toFixed(precision));
      onChange?.(Number(value)?.toFixed(precision) || '');
    } else {
      setValue(value || '');
      onChange?.(value || '');
    }
  };

  const clearInput = () => {
    setValue('');
    onChange?.('');
    onPressEnter?.('');
    inputRef.current?.focus();
  };

  useEffect(() => {
    if (parentValue && regExp && !regExp?.test(parentValue)) return;
    setValue(parentValue || '');
  }, [parentValue, regExp]);

  return (
    <div
      className={`relative flex-grow ${
        prefix && 'border border-solid border-fillBg8 rounded-[8px] w-full flex items-center'
      } ${className}`}
    >
      {prefix && <span className="text-lightGrey px-[8px]">{prefix}</span>}
      <input
        ref={(r) => {
          inputRef.current = r;
          if (typeof ref === 'function') {
            ref(r);
          } else if (ref) {
            (ref as React.MutableRefObject<HTMLInputElement | null>).current = r;
          }
        }}
        type={type}
        value={value}
        disabled={disabled}
        maxLength={maxLength}
        onChange={handleChange}
        className={clsx(
          'box-border w-full border border-solid border-fillBg8 rounded-[8px] pl-[16px] pr-10 py-[13px] bg-transparent text-white text-desc16 md:text-desc14 font-Montserrat font-normal leading-[19px] placeholder-lightGrey focus:outline-none transition duration-300 ease-in-out appearance-none',
          showClearBtn
            ? {
                'border-mainColor': isError,
                '!pr-[38px]': !suffix,
                'border-0': prefix,
                '!pl-0': prefix,
              }
            : {
                'border-mainColor': isError,
                '!pr-[16px]': !suffix,
                'border-0': prefix,
                '!pl-0': prefix,
              },
          rootClassName,
        )}
        onBlur={() => onBlur?.(value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onPressEnter?.(value);
            inputRef.current?.blur();
          }
        }}
        enterKeyHint={enterKeyHint}
        placeholder={placeholder || 'Please Enter...'}
      />
      <div className="absolute top-1/2 right-[14px] -translate-y-1/2 flex flex-row gap-2">
        {value && showClearBtn && (
          <button
            type="button"
            onClick={clearInput}
            className="p-0 m-0 w-[15px] h-[15px] flex items-center justify-center text-lightGrey border-0 flex-none bg-transparent"
          >
            <i className="tmrwdao-icon-circle-add text-[16px] text-lightGrey rotate-45" />
          </button>
        )}
        {suffix && <span className="text-lightGrey text-desc14">{suffix}</span>}
      </div>
    </div>
  );
};

export default forwardRef(Input);
