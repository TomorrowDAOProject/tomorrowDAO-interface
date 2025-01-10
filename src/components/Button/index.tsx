import React from 'react';
import clsx from 'clsx';

const buttonStyles = {
  default: 'bg-gray-200 text-gray-800 hover:bg-transparent hover:border-gray-200',
  primary:
    'bg-mainColor text-white hover:bg-transparent hover:text-mainColor hover:border-mainColor',
  info: 'bg-cyan text-white hover:bg-transparent hover:text-cyan hover:border-cyan',
  warning: 'bg-yellow text-white hover:bg-transparent hover:text-yellow hover:border-yellow',
  danger: 'bg-red text-white hover:bg-transparent hover:text-red hover:border-red',
  link: 'text-blue-500 hover:underline',
};

interface IButtonProps {
  className?: string;
  type?: 'default' | 'primary' | 'info' | 'warning' | 'danger' | 'link';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  loadingClassName?: string;
  onClick?: () => void;
}

const Button = ({
  className,
  loading,
  type = 'default',
  loadingClassName,
  children,
  disabled,
  onClick,
}: IButtonProps) => {
  return (
    <button
      className={clsx(
        'py-2 px-[14px] lg:py-[11px] lg:px-5 flex items-center justify-center border border text-descM12 lg:text-descM15 rounded-[42px] focus:outline-none focus:ring-2 focus:ring-offset-2',
        buttonStyles[type],
        className,
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {loading ? (
        <span
          className={clsx(
            'block animate-spin rounded-[50%] h-[15px] w-[15px] border-t-2 border-b-2 border-l-0 border-r-0 border-solid border-lightGrey',
            loadingClassName,
          )}
        />
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
