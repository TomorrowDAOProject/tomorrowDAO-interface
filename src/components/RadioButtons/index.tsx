import React, { useState } from 'react';
import { Button } from 'aelf-design';
import './index.css';

type TValue = string | number;
interface Option {
  label: string;
  value: TValue;
}

interface IRadioButtonsProps {
  options: Option[];
  onChange?: (value: TValue) => void;
  value?: TValue;
}

const RadioButtons: React.FC<IRadioButtonsProps> = ({ options, onChange, value }) => {
  return (
    <div className="radio-buttons-wrap">
      {options.map((option, index) => (
        <Button
          key={index}
          className={`radio-buttons ${value === option.value ? 'radio-buttons-active' : ''}`}
          onClick={() => onChange?.(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
};

export default RadioButtons;
