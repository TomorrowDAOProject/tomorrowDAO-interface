import clsx from 'clsx';
import React, { useEffect, useRef, useState } from 'react';
import NoData from 'components/NoData';
import Input from 'components/Input';

export interface SelectOption {
  label: React.ReactNode;
  desc?: React.ReactNode;
  value: string | number;
}

interface ISelectProps {
  value?: string | number;
  className?: string;
  label?: React.ReactNode;
  options?: SelectOption[];
  placeholder?: string;
  defaultValue?: SelectOption;
  isError?: boolean;
  labelClassName?: string;
  iconClassName?: string;
  overlayClassName?: string;
  overlayItemClassName?: string;
  isOpenStyle?: boolean;
  onChange?(option: SelectOption): void;
  useInput?: boolean;
  onInputChange?(value: string): void;
}

const Select: React.FC<ISelectProps> = ({
  className,
  value,
  label,
  options = [],
  placeholder,
  isError,
  isOpenStyle,
  labelClassName,
  iconClassName,
  overlayClassName,
  overlayItemClassName,
  onChange,
  useInput = false,
  onInputChange,
}) => {
  const [selected, setSelected] = useState<SelectOption | undefined>();
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement | null>(null);

  const handleSelect = (option: SelectOption) => {
    setSelected(option);
    setIsOpen(false);
    onChange?.(option);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (value !== undefined) {
      const currentValue = options?.find((option) => option.value === value);
      setSelected(currentValue);
    }
  }, [label, options, value]);

  return (
    <div className="relative" ref={selectRef}>
      {label && (
        <span className="block mb-[10px] text-descM14 font-Montserrat text-white">{label}</span>
      )}
      <div
        className={clsx(
          'flex justify-between items-center box-border py-[12px] px-4 bg-darkBg text-white border border-solid border-fillBg8 rounded-[8px] cursor-pointer gap-2',
          className,
          {
            '!border-mainColor': isOpen || isError || isOpenStyle,
          },
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {selected && !useInput && (
          <span
            className={clsx(
              'inline-block text-white text-desc14 font-Montserrat max-w-[calc(100%-22px)] text-ellipsis whitespace-nowrap',
              labelClassName,
            )}
          >
            {selected?.label}
          </span>
        )}
        {!selected && !useInput && (
          <span className={clsx('text-lightGrey text-desc14 font-Montserrat', labelClassName)}>
            {placeholder ?? ''}
          </span>
        )}
        {!useInput && (
          <span
            className={clsx(
              'tmrwdao-icon-down-arrow text-[20px] leading-[20px] text-lightGrey',
              iconClassName,
            )}
          />
        )}
        {useInput && (
          <Input
            className="border-none"
            placeholder={placeholder}
            value={String(selected?.label || value)}
            onChange={onInputChange}
            suffix={
              <span
                className={clsx(
                  'tmrwdao-icon-down-arrow text-[20px] leading-[20px] text-lightGrey',
                  iconClassName,
                )}
              />
            }
          />
        )}
      </div>
      {isOpen && (
        <ul
          className={clsx(
            'absolute max-h-[190px] overflow-y-auto w-full mt-1 py-4 bg-darkBg border border-solid border-fillBg8 rounded-[8px] shadow-lg z-10',
            {
              '!max-h-[240px] !pt-0': options?.length === 0,
            },
            overlayClassName,
          )}
        >
          {options?.length > 0 ? (
            options?.map((option) => (
              <li
                key={option.value}
                className={clsx(
                  'py-2 px-4 font-Montserrat text-DescM14 text-lightGrey hover:text-white hover:bg-fillBg8 cursor-pointer',
                  overlayItemClassName,
                )}
                onClick={() => handleSelect(option)}
              >
                <span className={`${option.label == selected?.label && 'text-mainColor'}`}>
                  {option.label}
                </span>
                {option.desc && (
                  <span className="block text-desc14 text-lightGrey font-Montserrat">
                    {option.desc}
                  </span>
                )}
              </li>
            ))
          ) : (
            <div className="flex justify-center items-center">
              <NoData />
            </div>
          )}
        </ul>
      )}
    </div>
  );
};

export default Select;
