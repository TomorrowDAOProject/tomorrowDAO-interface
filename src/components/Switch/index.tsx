import clsx from 'clsx';
import React from 'react';

interface ISwitchProps {
  disabled?: boolean;
  value?: boolean;
  onChange?(checked: boolean): void;
}

const Switch = ({ value, onChange }: ISwitchProps) => {
  return (
    <div
      className={clsx(
        'w-10 h-5 flex items-center bg-lightGrey rounded-full p-0.5 cursor-pointer transition-colors duration-300',
        {
          '!bg-mainColor': value,
        },
      )}
      onClick={() => onChange?.(!value)}
      role="switch"
      aria-checked={value}
    >
      <div
        className={clsx(
          'bg-white w-[16px] h-[16px] rounded-full shadow-md transform transition-transform duration-300',
          {
            'translate-x-5': value,
          },
        )}
      />
    </div>
  );
};

export default Switch;
