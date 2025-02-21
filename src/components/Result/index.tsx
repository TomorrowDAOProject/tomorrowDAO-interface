import React from 'react';
import clsx from 'clsx';

interface ResultProps {
  title?: React.ReactNode;
  subTitle?: React.ReactNode;
  extra?: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  iconClassName?: string;
}

const Result: React.FC<ResultProps> = ({
  title,
  subTitle,
  extra,
  className,
  icon,
  iconClassName,
}) => {
  return (
    <div className={clsx('flex flex-col items-center justify-center py-12', className)}>
      {icon && <div className={clsx('mb-[18px]', iconClassName)}>{icon}</div>}
      {title && (
        <div className="text-descM18 text-white font-Montserrat text-center whitespace-pre-wrap">
          {title}
        </div>
      )}
      {subTitle && (
        <div className="text-descM18 text-white font-Montserrat text-center">{subTitle}</div>
      )}
      {extra && <div className="flex justify-center">{extra}</div>}
    </div>
  );
};

export default Result;
