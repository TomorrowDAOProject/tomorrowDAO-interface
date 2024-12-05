import React, { useState } from 'react';
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
      <div className="flex flex-row items-center justify-start w-full py-[10px] px-[14px] gap-[8px]">
        <p className="m-0 text-[15px] lg:text-[14px] font-MontserratMedium text-white">{title}</p>

        <LargeArrowIcon
          className={clsx('transition-[transform] ease-in-out duration-300', {
            'rotate-[-180deg]': isOpen,
          })}
        />
      </div>

      <div
        className={clsx(
          'pl-[14px] transition-[max-height] ease-in-out duration-300 overflow-hidden',
          isOpen ? 'max-h-[300px]' : 'max-h-0',
        )}
      >
        {items?.map((item, index) => (
          <a
            key={index}
            href="/"
            className="cursor-pointer block font-Montserrat font-medium flex flex-row items-center justify-start text-white text-[15px] px-[14px] py-[10px] no-underline hover:bg-transparent active:bg-transparent hover:text-mainColor active:text-mainColor gap-[14px]"
          >
            {item.icon}
            {item.label}
          </a>
        ))}
      </div>
    </div>
  );
};

const MobileMenu = ({ menus }: MenuProps) => {
  return (
    <div className="menu">
      <div className="list-none">
        {menus.map((menu, index) => (
          <div key={`${menu.label}_${index}`} className="mb-2">
            {menu?.children && menu.children.length > 0 ? (
              <MunuItem key={index} title={menu.label} items={menu.children} />
            ) : (
              <a
                key={index}
                href="/"
                className="cursor-pointer block font-Montserrat font-medium flex flex-row items-center justify-start text-white text-[15px] px-[14px] py-[10px] no-underline hover:bg-transparent active:bg-transparent hover:text-mainColor active:text-mainColor gap-[14px]"
              >
                {menu.icon}
                {menu.label}
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MobileMenu;