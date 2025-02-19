import React, { useState, useEffect } from 'react';
import { ReactComponent as Checked } from 'assets/revamp-icon/checked.svg';
import clsx from 'clsx';

interface CheckboxProps {
  label?: React.ReactNode;
  checked?: boolean;
  className?: string;
  uncheckedClassName?: string;
  checkedClassName?: string;
  onChange?: (checked: boolean) => void;
}

const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked = false,
  className,
  onChange,
  uncheckedClassName,
  checkedClassName,
}) => {
  const [isChecked, setIsChecked] = useState(checked);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newChecked = event.target.checked;
    setIsChecked(newChecked);
    if (onChange) {
      onChange(newChecked);
    }
  };

  useEffect(() => {
    setIsChecked(checked);
  }, [checked]);

  return (
    <div className={clsx('flex items-center gap-[15px] cursor-pointer', className)}>
      <div
        className={clsx(
          'w-4 h-4 rounded-sm relative flex items-center justify-center',
          {
            'bg-mainColor': isChecked,
            'bg-darkGray': !isChecked,
          },
          !isChecked && uncheckedClassName,
          isChecked && checkedClassName,
        )}
      >
        <input
          type="checkbox"
          checked={isChecked}
          onChange={handleChange}
          className="opacity-0 absolute top-0 left-0 w-full h-full cursor-pointer"
        />

        {isChecked && <Checked />}
      </div>
      {label}
    </div>
  );
};

export default Checkbox;
