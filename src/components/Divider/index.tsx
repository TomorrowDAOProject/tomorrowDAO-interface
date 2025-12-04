import React from 'react';
import clsx from 'clsx';

interface DividerProps {
  className?: string;
}

const Divider: React.FC<DividerProps> = ({ className }) => {
  return <div className={clsx('w-full h-[1px] bg-fillBg8', className)} />;
};

export default Divider;
