import React from 'react';
import clsx from 'clsx';
import './index.css';

interface ISpinnerProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
}

const LoadingComponent = ({
  size = 40,
  strokeWidth = 4,
  color = '#5D49F6',
  className,
}: ISpinnerProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className={clsx('spinner-wrapper', className)}>
      <svg className="spinner" width={size} height={size}>
        <circle
          className="circle-background"
          fill="transparent"
          stroke="#2E2E2E"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          fill="transparent"
          stroke={color}
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
          strokeDasharray={`${circumference / 6} ${circumference}`}
          strokeDashoffset={0}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

export default LoadingComponent;
