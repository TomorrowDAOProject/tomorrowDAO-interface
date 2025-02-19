import React from 'react';
import clsx from 'clsx';

interface TagProps {
  children: React.ReactNode;
  color?: string;
  className?: string;
}

const Tag: React.FC<TagProps> = ({ children, color = 'primary', className }) => {
  const getColorStyles = () => {
    switch (color) {
      case 'primary':
        return 'bg-tagPrimaryBg text-tagPrimaryText';
      case 'success':
        return 'bg-tagSuccessBg text-tagSuccessText';
      case 'warning':
        return 'bg-tagWarningBg text-tagWarningText';
      case 'error':
        return 'bg-tagDangerBg text-tagDangerText';
      case 'secondary':
        return 'bg-tagSecondaryBg text-tagSecondaryText';
      default:
        return color
          ? `bg-[${color}] bg-opacity-10 text-[${color}]`
          : 'bg-tagSecondaryBg text-tagSecondaryText';
    }
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2 py-1 rounded-[4px] text-descM12 font-Montserrat border border-solid border-fillBg8',
        getColorStyles(),
        className,
      )}
    >
      {children}
    </span>
  );
};

export default Tag;
