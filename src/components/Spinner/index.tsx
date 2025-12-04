import React from 'react';
import './index.css';
import clsx from 'clsx';

interface ISpinnerProps {
  size?: number;
  color?: string;
  className?: string;
}

const Spinner = ({ size = 40, color = '#5D49F6', className }: ISpinnerProps) => {
  const radius = (size - 10) / 2;

  const calculateStrokeDasharray = (num: number) => {
    const m = 2.32;
    const b = 50;
    return m * num + b;
  };

  return (
    <div className={clsx('spinner-wrapper', className)}>
      <svg className="spinner" width={size} height={size}>
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <circle
          className="circle"
          style={{ strokeDasharray: calculateStrokeDasharray(size) }}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="url(#gradient)"
          strokeWidth={size / 10}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

export default Spinner;
