import React from 'react';
import clsx from 'clsx';

const buttonStyles = {
  default: 'bg-transparent border-fillBg8 text-lightGrey hover:text-white hover:border-white',
  primary:
    'bg-mainColor border-mainColor text-white hover:bg-transparent hover:text-mainColor hover:border-mainColor',
  info: 'bg-cyan border-cyan text-white hover:bg-transparent hover:text-cyan hover:border-cyan',
  warning:
    'bg-yellow border-yellow text-white hover:bg-transparent hover:text-yellow hover:border-yellow',
  danger:
    'bg-danger border-danger text-white hover:bg-transparent hover:text-danger hover:border-danger',
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
      type="button"
      className={clsx(
        'py-2 px-[14px] lg:py-[11px] lg:px-5 flex items-center justify-center border border-solid text-descM12 font-Montserrat lg:text-descM15 rounded-[42px] appearence-none outline-none transition-[background,color] duration-300 ease-in-out',
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
