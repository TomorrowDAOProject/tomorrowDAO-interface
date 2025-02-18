import React from 'react';
import clsx from 'clsx';

interface ColProps {
  children: React.ReactNode;
  className?: string;
  span?: number;
  style?: React.CSSProperties;
}

const Col: React.FC<ColProps> = ({ children, className, span = 24, style }) => {
  return (
    <div
      className={clsx(
        'box-border',
        {
          'w-full': span === 24,
          'w-1/2': span === 12,
          'w-1/3': span === 8,
          'w-1/4': span === 6,
        },
        className,
      )}
      style={style}
    >
      {children}
    </div>
  );
};

export default Col;
