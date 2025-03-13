import React from 'react';
import clsx from 'clsx';

const buttonStyles = {
  default: 'bg-transparent border-fillBg16 text-white hover:text-white hover:border-white',
  primary:
    'bg-mainColor border-mainColor text-white hover:bg-transparent hover:text-mainColor hover:border-mainColor',
  info: 'bg-cyan border-cyan text-white hover:bg-transparent hover:text-cyan hover:border-cyan',
  warning:
    'bg-yellow border-yellow text-white hover:bg-transparent hover:text-yellow hover:border-yellow',
  danger:
    'bg-danger border-danger text-white hover:bg-transparent hover:text-danger hover:border-danger',
  link: 'bg-transparent text-lightGrey !border-0 hover:text-white',
};

const buttonSize = {
  small: '!py-2 text-descM12',
  medium: '!py-[13px] !text-descM15',
  large: '!py-4 !text-descM18',
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
  icon?: React.ReactNode;
}

const Button = ({
  className,
  loading,
  type = 'default',
  size = 'medium',
  loadingClassName,
  children,
  disabled,
  onClick,
  icon,
  ...rest
}: IButtonProps) => {
  return (
    <button
      type="button"
      className={clsx(
        'py-2 px-[14px] lg:py-[11px] lg:px-5 flex items-center justify-center border border-solid whitespace-nowrap text-descM12 font-Montserrat lg:text-descM15 rounded-[42px] appearence-none outline-none transition-[background,color] duration-300 ease-in-out',
        buttonStyles[type],
        buttonSize[size],
        className,
        { '!text-borderColor cursor-not-allowed !bg-darkBg !border-borderColor': disabled },
      )}
      onClick={onClick}
      disabled={disabled}
      {...rest}
    >
      {icon && <span className="mr-2">{icon}</span>}
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
