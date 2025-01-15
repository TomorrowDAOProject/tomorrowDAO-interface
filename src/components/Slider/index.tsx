import React, { useEffect, useState } from 'react';
import './index.css';

interface SliderProps {
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  onChange?: (value: number) => void;
  className?: string;
}

const Slider: React.FC<SliderProps> = ({
  min = 0,
  max = 100,
  step = 1,
  value = 50,
  onChange,
  className,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(event.target.value);
    if (onChange) {
      onChange(newValue);
    }
    event.target.style.setProperty('--value', `${newValue}%`);
  };

  useEffect(() => {
    const slider = document.querySelector('.custom-slider') as HTMLInputElement;
    if (slider) {
      slider.style.setProperty('--value', `${value}%`);
    }
  }, [value]);

  return (
    <div className={`slider-warp ${className}`}>
      <input
        className="custom-slider"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
      />
      <div className="flex items-center justify-between text-[12px] text-lightGrey mt-2">
        <span className="font-Montserrat">{min}%</span>
        <span className="font-Montserrat">{max}%</span>
      </div>
    </div>
  );
};

export default Slider;
