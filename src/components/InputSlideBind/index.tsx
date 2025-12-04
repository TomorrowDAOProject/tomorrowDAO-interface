import React, { ChangeEvent } from 'react';
import { Slider } from 'antd';
import { Input } from 'aelf-design';
import cls from 'clsx';
import './index.css';

interface InputSlideBindProps {
  value?: number;
  onChange?: (value: number | null) => void;
  type: 'abstention' | 'rejection' | 'approve';
  placeholder?: string;
  disabled?: boolean;
}

const InputSlideBind = (props: InputSlideBindProps) => {
  const { value, onChange, type, placeholder, disabled } = props;

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    let num = Number(e.target.value.trim());
    if (Number.isNaN(num)) {
      num = 0;
    }
    onChange?.(num);
  };

  const handleProgressChange = (value: number) => {
    onChange?.(value);
  };

  return (
    <div className="input-slide-bind">
      <div className="input">
        <Input
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          suffix="%"
          allowClear={false}
          disabled={disabled}
        />
      </div>
      <div className={cls('slide', type)}>
        <div
          className={cls(
            'point',
            { active: typeof value === 'number' && value >= 0 },
            { disable: !value },
          )}
        ></div>
        <Slider
          className="slide-wrap"
          value={value}
          onChange={handleProgressChange}
          disabled={disabled}
        />
        <div className={cls('point', { active: value && value === 100 })}></div>
      </div>
    </div>
  );
};

export default InputSlideBind;
