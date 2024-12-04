import { ReactComponent as TwitterIcon } from 'assets/revamp-icon/twitter.svg';
import { ReactComponent as TelegramIcon } from 'assets/revamp-icon/telegram.svg';
import { ReactComponent as MenuIcon } from 'assets/revamp-icon/menu.svg';
import { ReactComponent as LogoIcon } from 'assets/revamp-icon/logo.svg';
import React, { useState } from 'react';
import { MenuItem } from 'components/NavHeader';
import Drawer from 'components/MobileDrawer';
import MobileMenu from 'components/MobileMenu';

const items: MenuItem[] = [
  {
    key: 'NetworkDAO',
    label: 'Network DAO',
  },
  {
    key: 'Blog',
    label: 'Blog',
  },
  {
    key: 'Votigram',
    label: 'Votigram',
  },
  {
    key: 'Resources',
    label: 'Resources',
    children: [
      { key: 'Github', label: 'Github' },
      { key: 'Documentation', label: 'Documentation' },
    ],
  },
];

const groupItems = [
  {
    key: 'Twitter',
    label: 'Twitter',
    icon: <TwitterIcon className="h-[24px] w-[24px]" />,
  },
  {
    key: 'Telegram',
    label: 'Telegram',
    icon: <TelegramIcon className="h-[24px] w-[24px]" />,
  },
];

const SideMenu = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div onClick={() => setOpen(true)}>
        <MenuIcon className="h-[12px] w-[14.2px] cursor-pointer" />
      </div>
      <Drawer
        title={<LogoIcon className="w-[117.22px] h-[19px]" />}
        width={249}
        onClose={() => setOpen(false)}
        open={open}
      >
        <div className="flex flex-col justify-between h-full">
          <MobileMenu menus={items} />

          <MobileMenu menus={groupItems} />
        </div>
      </Drawer>
    </>
  );
};

export default SideMenu;
