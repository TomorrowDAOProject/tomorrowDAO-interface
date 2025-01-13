import clsx from 'clsx';
import React, { useEffect, useRef, useState } from 'react';

interface ITextareaProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  rootClassName?: string;
  onSubmit?: (text: string) => void;
}

const Textarea = ({
  value,
  onChange,
  placeholder,
  maxLength = 500,
  rootClassName,
}: ITextareaProps) => {
  const [text, setText] = useState(value);
  const [charCount, setCharCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setText(value);
    setCharCount(value?.length);
    const textarea = textareaRef.current;
    if (!value && textarea) {
      textarea.style.height = 'auto';
    }
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
    <div className="relative rounded-[8px]">
      <textarea
        ref={textareaRef}
        className={clsx(
          'py-[13px] px-[16px] w-full h-[121px] rounded-[8px] placeholder:font-questrial border border-solid border-fillBg8 bg-transparent text-white text-desc14 font-Montserrat caret-white outline-none resize-none appearance-none',
          rootClassName,
        )}
        value={text}
        maxLength={maxLength}
        onChange={handleChange}
        placeholder={placeholder || 'Please enter...'}
        rows={1}
      />
      {charCount > 0 && (
        <span
          className={clsx(
            'absolute right-[16px] bottom-[13px] inline-block text-[11px] leading-[17.6px] text-lightGrey',
            { '!text-danger': charCount === maxLength },
          )}
        >
          {charCount}/{maxLength}
        </span>
      )}
    </div>
  );
};

export default Textarea;
