import React from 'react';
import clsx from 'clsx';

interface IProgressBarProps {
  size?: number;
  className?: string;
  rootClassName?: string;
  percent?: number;
  status?: 'primary' | 'success' | 'exception';
  showInfo?: boolean;
}

const progressBarStyles = {
  primary: 'bg-mainColor',
  success: 'bg-green-500',
  exception: 'bg-red',
};

const ProgressBar = ({
  percent = 0,
  size = 8,
  status = 'primary',
  rootClassName,
  className,
  showInfo,
}: IProgressBarProps) => {
  return (
    <div
      className={clsx('w-full h-[8px] bg-white rounded-[100px]', `h-[${size}px]`, rootClassName)}
    >
      <div
        className={clsx(
          'h-full rounded-[100px] transition-width',
          className,
          progressBarStyles[status],
        )}
        style={{ width: `${percent}%` }}
      />
      {showInfo && <span className="ml-2">{percent}%</span>}
    </div>
  );
};

export default ProgressBar;
