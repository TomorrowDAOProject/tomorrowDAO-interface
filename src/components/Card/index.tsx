import React from 'react';
import clsx from 'clsx';

interface CardProps {
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, children, className }) => {
  return (
    <div className={clsx('bg-darkBg rounded-[8px] border border-solid border-fillBg8', className)}>
      {title && (
        <div className="px-6 py-[12px] border-0 border-b border-solid border-fillBg8">{title}</div>
      )}
      <div className="py-5 px-6">{children}</div>
    </div>
  );
};

export default Card;
