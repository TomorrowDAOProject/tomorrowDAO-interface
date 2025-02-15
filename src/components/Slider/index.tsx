import React, { useEffect, useState, useRef } from 'react';
import './index.css';
import clsx from 'clsx';

interface SliderProps {
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  disabled?: boolean;
  showValue?: boolean;
  showTips?: boolean;
  onChange?: (value: number) => void;
  className?: string;
}

const Slider: React.FC<SliderProps> = ({
  min = 0,
  max = 100,
  step = 1,
  value = 50,
  disabled,
  showValue = true,
  showTips,
  onChange,
  className,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

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

  const getTooltipPosition = () => {
    if (!tooltipRef.current) return '8px';
    const tooltipWidth = tooltipRef.current.offsetWidth;
    const trackWidth = document.querySelector('.custom-slider')?.clientWidth || 0;
    const thumbWidth = 16;
    const percent = (value - min) / (max - min);
    const position = percent * trackWidth;
    const offset = 8 - thumbWidth * percent;

    return `${position - tooltipWidth / 2 + offset}px`;
  };

  return (
    <div className={`slider-warp ${className}`}>
      <div className="relative">
        <input
          className="custom-slider"
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={handleChange}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        />
        <div
          ref={tooltipRef}
          className={clsx('slider-tooltip', {
            invisible: !showTips || !showTooltip,
          })}
          style={{ left: getTooltipPosition() }}
        >
          {value * 100}%
        </div>
      </div>
      {showValue && (
        <div className="flex items-center justify-between text-[12px] text-lightGrey mt-2">
          <span className="font-Montserrat">{min}%</span>
          <span className="font-Montserrat">{max}%</span>
        </div>
      )}
    </div>
  );
};

export default Slider;
