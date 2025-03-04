import clsx from 'clsx';
import React from 'react';

interface IFormItemProps {
  label?: React.ReactNode;
  className?: string;
  labelClassName?: string;
  rowClassName?: string;
  desc?: string;
  children: React.ReactNode;
  errorText?: string;
  required?: boolean;
  layout?: 'vertical' | 'horizontal' | 'inline';
}

// FormItem component
const FormItem: React.FC<IFormItemProps> = ({
  label,
  desc,
  className,
  labelClassName,
  rowClassName,
  children,
  errorText,
  required,
  layout = 'vertical',
}) => {
  return (
    <div className={clsx('mb-[50px]', className)}>
      <div
        className={clsx(
          'flex',
          {
            '!inline-flex flex-row': layout === 'inline',
            'flex-col h-full': layout === 'vertical',
            'flex-row gap-[20px]': layout === 'horizontal',
          },
          rowClassName,
        )}
      >
        {label && (
          <div
            className={clsx(
              'mb-[15px] flex flex-row items-center justify-between w-full',
              { '!items-start !w-[170px] mt-[14px]': layout === 'horizontal' },
              labelClassName,
            )}
          >
            <span className="inline-block relative pr-[8px] font-Montserrat text-descM16 text-white">
              {label}
              {required && <span className="absolute top-0 right-0">*</span>}
            </span>
            {desc && (
              <span className="text-[12px] font-normal leading-[13.2px] text-input-placeholder">
                {desc}
              </span>
            )}
          </div>
        )}
        {children}
      </div>
      {errorText && (
        <span className="mt-[5px] block text-[11px] font-Montserrat leading-[17.6px] text-mainColor">
          {errorText}
        </span>
      )}
    </div>
  );
};

export default FormItem;
