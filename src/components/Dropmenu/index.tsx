import clsx from 'clsx';
import React, { useState } from 'react';
import { ReactComponent as ArrowDownIcon } from 'assets/revamp-icon/arrow-down.svg';
import { MenuItem } from 'components/NavHeader';

interface DropmenuProps {
  align?: 'left' | 'right';
  showArrow?: boolean;
  MenuClassName?: string;
  children: React.ReactNode;
  menu?: MenuItem[];
}

const Dropdown = (props: DropmenuProps) => {
  const { showArrow = true, align = 'left', MenuClassName, children, menu = [] } = props;
  const [isOpen, setIsOpen] = useState(false);

  const handleMouseEnter = () => {
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    setIsOpen(false);
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="inline-flex items-center justify-center cursor-pointer">
        {children}
        {showArrow && menu?.length > 0 && (
          <ArrowDownIcon
            className={clsx('transition-all duration-300 ease-in-out', isOpen ? 'rotate-180' : '')}
          />
        )}
      </div>

      {isOpen && (
        <div
          className={clsx(
            'absolute pt-[10px]',
            {
              'origin-top-left left-0': align === 'left',
              'origin-top-right right-0': align === 'right',
            },
            MenuClassName,
          )}
        >
          <div className="py-[13px] px-[14px] rounded-[7px] bg-darkGray">
            <div role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
              {menu?.map((item, index) => (
                <div className="py-[10px] px-[14px]" key={`${item.label}_${index}`}>
                  <span
                    className={clsx(
                      'block m-0 text-white font-medium text-[15px] leading-[24px] font-Montserrat;',
                      {
                        'text-right': align === 'right',
                      },
                    )}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
