import React from 'react';
import clsx from 'clsx';
import './index.css';

interface CircleProgressProps {
  size?: number;
  strokeWidth?: number;
  progress: number;
  color?: string;
  type?: 'approve' | 'reject' | 'abstain' | 'total';
  className?: string;
}

const CircleProgress: React.FC<CircleProgressProps> = ({
  size = 120,
  strokeWidth = 12,
  progress = 0,
  type = 'total',
  className,
}) => {
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const dashArray = (progress / 100) * circumference;
  const dashOffset = circumference - dashArray;

  const getColor = () => {
    switch (type) {
      case 'approve':
        return '#05ac90';
      case 'reject':
        return '#d34a64';
      case 'abstain':
        return '#FA9D2B';
      case 'total':
        return '#5D49F6';
      default:
        return '#5D49F6';
    }
  };

  return (
    <div className={clsx('circle-progress', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#2A2A2A"
          strokeWidth={strokeWidth}
          className="circle-progress-bg"
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeDasharray={`${dashArray} ${circumference}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          className="circle-progress-value"
        />
      </svg>
    </div>
  );
};

export default CircleProgress;
