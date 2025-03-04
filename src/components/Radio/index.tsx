import React, { forwardRef, LegacyRef } from 'react';
import clsx from 'clsx';

export type Option = {
  label: string;
  value: string | number;
};

interface IRadioProps {
  options: Option[];
  value?: string | number;
  onChange?(value: string | number): void;
}

const Radio = ({ options, value, onChange }: IRadioProps, ref: LegacyRef<HTMLInputElement>) => {
  return (
    <div className="flex gap-[10px] flex-col md:flex-row md:gap-[116px]">
      {options.map((option) => (
        <label key={option.value} className="flex items-center cursor-pointer">
          <input
            ref={ref}
            type="radio"
            className="hidden"
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange?.(option.value)}
          />
          <span
            className={clsx(
              'relative box-border inline-block w-4 h-4 rounded-full border-[1.5px] border-solid border-mainColor mr-2',
              {
                "bg-mainColor after:absolute after:left-1/2 after:top-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:content-[''] after:block after:w-2 after:h-2 after:rounded-full after:bg-white":
                  value === option.value,
                'bg-white': value !== option.value,
              },
            )}
          />
          <span className="text-white font-Montserrat text-desc15">{option.label}</span>
        </label>
      ))}
    </div>
  );
};

export default forwardRef(Radio);
