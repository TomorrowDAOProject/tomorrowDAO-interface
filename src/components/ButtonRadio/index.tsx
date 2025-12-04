import { useEffect, useState } from 'react';

import clsx from 'clsx';

type ButtonRadioOption = {
  label: string;
  value: number;
  [key: string]: string | number;
};

interface IButtonRadioProps {
  value?: ButtonRadioOption;
  className?: string;
  itemClassName?: string;
  activeClassName?: string;
  itemTextClassName?: string;
  activeTextClassName?: string;
  radioClassName?: string;
  options: ButtonRadioOption[];
  onChange?: (_: ButtonRadioOption) => void;
}

const ButtonRadio = ({
  value,
  options,
  className,
  radioClassName,
  itemClassName,
  itemTextClassName,
  activeClassName,
  activeTextClassName,
  onChange,
}: IButtonRadioProps) => {
  const [selectedValue, setSelectedValue] = useState<ButtonRadioOption | undefined>();

  const handleSelect = (value: ButtonRadioOption) => {
    setSelectedValue(value);
    onChange?.(value);
  };

  useEffect(() => {
    const selectedValue = options.find((item) => item.value === value?.value);
    selectedValue && setSelectedValue(selectedValue);
  }, [options, value]);

  return (
    <div className={clsx('grid grid-cols-3 gap-[9px]', className)}>
      {options.map((item) => (
        <div
          className={clsx(
            'py-[12px] px-[14px] border-[1.5px] border-solid border-fillBg8 rounded-[10px] transition-[border] duration-200 ease-in-out cursor-pointer',
            radioClassName,
            { 'border border-white': selectedValue?.value === item.value },
            itemClassName,
            selectedValue?.value === item.value && activeClassName,
          )}
          key={item.value}
          onClick={() => handleSelect(item)}
        >
          <span
            className={clsx(
              'block w-full text-center font-normal text-[14px] text-lightGrey leading-[20px] transition-[color] duration-200 ease-in-out',
              { 'text-white': selectedValue?.value === item.value },
              itemTextClassName,
              selectedValue?.value === item.value && activeTextClassName,
            )}
          >
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default ButtonRadio;
