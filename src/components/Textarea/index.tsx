import clsx from 'clsx';
import React, { forwardRef, LegacyRef, useEffect, useState } from 'react';

interface ITextareaProps {
  value: string;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  containerClassName?: string;
  rootClassName?: string;
  isError?: boolean;
  onBlur?: (value: string) => void;
  onChange: (value: string) => void;
  onSubmit?: (text: string) => void;
}

const Textarea = (
  {
    value,
    onChange,
    onBlur,
    placeholder,
    maxLength = 500,
    rootClassName,
    containerClassName,
    isError,
  }: ITextareaProps,
  ref: LegacyRef<HTMLTextAreaElement>,
) => {
  const [text, setText] = useState(value);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    setText(value);
    setCharCount(value?.length);
  }, [value]);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = event.target.value;
    if (newText.length <= maxLength) {
      setText(newText);
      onChange(newText);
      setCharCount(newText.length);
    } else {
      setText(newText.slice(0, maxLength));
      onChange(newText.slice(0, maxLength));
      setCharCount(maxLength);
    }
  };

  return (
    <div className={clsx('relative rounded-[8px]', containerClassName)}>
      <textarea
        ref={ref}
        className={clsx(
          'py-[13px] px-[16px] w-full h-[121px] rounded-[8px] placeholder:font-Montserrat border border-solid border-fillBg8 bg-transparent text-white text-desc14 font-Montserrat caret-white outline-none resize-none appearance-none',
          {
            'border-mainColor': isError,
          },
          rootClassName,
        )}
        value={text}
        maxLength={maxLength}
        onBlur={() => onBlur?.(text)}
        onChange={handleChange}
        placeholder={placeholder || 'Please enter...'}
        rows={1}
      />
      <span
        className={clsx(
          'absolute right-[16px] bottom-[13px] inline-block text-[11px] leading-[17.6px] text-lightGrey',
          { '!text-danger': charCount === maxLength },
        )}
      >
        {charCount}/{maxLength}
      </span>
    </div>
  );
};

export default forwardRef(Textarea);
