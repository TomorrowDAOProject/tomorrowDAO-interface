import React, { Fragment, useState } from 'react';
import { ReactComponent as LargeArrowIcon } from 'assets/revamp-icon/arrow-down.svg';
import clsx from 'clsx';
import { MenuItem } from 'components/NavHeader';

type MenuProps = {
  menus: MenuItem[];
};

const MunuItem = ({ title, items }: { title: React.ReactNode; items?: MenuItem[] }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="group cursor-pointer" onClick={toggleMenu}>
      <div className="flex flex-row items-center justify-start w-full px-[14px] mb-[10px] gap-[8px]">
        <p className="m-0 text-[15px] lg:text-[14px] font-Montserrat font-medium text-white">
          {title}
        </p>

        <LargeArrowIcon
          className={clsx('transition-[transform] ease-in-out duration-300', {
            'rotate-[-180deg]': isOpen,
          })}
        />
      </div>

      <div
        className={clsx(
          'pl-[14px] flex flex-col transition-[max-height] ease-in-out duration-300 overflow-hidden',
          isOpen ? 'max-h-[300px]' : 'max-h-0',
        )}
      >
        {items?.map((item) => (
          <span key={item.key}>{item.label}</span>
        ))}
      </div>
    </div>
  );
};

const MobileMenu = ({ menus }: MenuProps) => {
  return (
    <div className="menu w-full">
      <div className="list-none gap-[20px] flex flex-col">
        {menus.map((menu) => (
          <Fragment key={menu.key}>
            {menu?.children && menu.children.length > 0 ? (
              <MunuItem title={menu.label} items={menu.children} />
            ) : (
              menu.label
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
};

export default MobileMenu;
