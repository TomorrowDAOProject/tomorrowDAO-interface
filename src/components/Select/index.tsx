import clsx from 'clsx';
import React, { useEffect, useState } from 'react';

export interface SelectOption {
  label: string;
  value: string;
}

interface ISelectProps {
  value?: string;
  className?: string;
  label?: React.ReactNode;
  options: SelectOption[];
  placehoder?: string;
  defaultValue?: SelectOption;
  onChange?(option: SelectOption): void;
}

const Select: React.FC<ISelectProps> = ({ className, value, label, options, placehoder, onChange }) => {
  const [selected, setSelected] = useState<SelectOption | undefined>();
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (option: SelectOption) => {
    setSelected(option);
    setIsOpen(false);
    onChange?.(option);
  };

  useEffect(() => {
    if (value) {
      const currentValue = options.find((option) => option.value === value);
      setSelected(currentValue);
    }
  }, [value])

  return (
    <div className="relative">
      {label && (
        <span className="block mb-[10px] text-descM14 font-Montserrat text-white">{label}</span>
      )}
      <div
        className={clsx(
          'flex justify-between items-center py-[13px] px-4 bg-darkBg text-white border border-solid border-fillBg8 rounded-[8px] cursor-pointer',
          className,
          {
            'border-lightGrey': isOpen,
          },
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {selected ? (
          <span className="text-white text-desc14 font-Montserrat">{selected?.label}</span>
        ) : (
          <span className="text-lightGrey text-desc14 font-Montserrat">{placehoder ?? ''}</span>
        )}
        <span className="tmrwdao-icon-down-arrow text-[20px] text-lightGrey" />
      </div>
      {isOpen && (
        <ul className="absolute max-h-[190px] overflow-y-auto w-full mt-1 py-4 bg-darkBg border border-solid border-fillBg8 rounded-[8px] shadow-lg z-10">
          {options.map((option) => (
            <li
              key={option.value}
              className="py-2 px-4 font-Montserrat text-DescM14 text-lightGrey hover:text-white hover:bg-fillBg8 cursor-pointer"
              onClick={() => handleSelect(option)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Select;
