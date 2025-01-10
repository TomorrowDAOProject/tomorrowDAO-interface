import clsx from 'clsx';
import React from 'react';

interface IFormItemProps {
  label?: string;
  className?: string;
  desc?: string;
  children: React.ReactNode;
  errorText?: string;
  required?: boolean;
}

// FormItem component
const FormItem: React.FC<IFormItemProps> = ({
  label,
  desc,
  className,
  children,
  errorText,
  required,
}) => {
  return (
    <div className={clsx('py-3', className)}>
      <div className="mb-[12px] flex flex-row items-center justify-between w-full">
        {label && (
          <span className="inline-block relative pr-[8px] font-Montserrat text-descM16 text-white">
            {label}
            {required && <span className="absolute top-0 right-0">*</span>}
          </span>
        )}
        {desc && (
          <span className="text-[12px] font-normal leading-[13.2px] text-input-placeholder">
            {desc}
          </span>
        )}
      </div>
      {children}
      {errorText && (
        <span className="mt-[4px] block text-[12px] font-normal leading-[13.2px] text-danger">
          *{errorText}
        </span>
      )}
    </div>
  );
};

export default FormItem;
