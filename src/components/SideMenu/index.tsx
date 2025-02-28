import { ReactComponent as TwitterIcon } from 'assets/revamp-icon/twitter.svg';
import { ReactComponent as TelegramIcon } from 'assets/revamp-icon/telegram.svg';
import { ReactComponent as MenuIcon } from 'assets/revamp-icon/menu.svg';
import { ReactComponent as LogoIcon } from 'assets/revamp-icon/logo.svg';
import React, { useState } from 'react';
import { MenuItem } from 'components/NavHeader';
import Drawer from 'components/MobileDrawer';
import MobileMenu from 'components/MobileMenu';
import Link from 'next/link';

const items: MenuItem[] = [
  {
    key: 'NetworkDAO',
    label: (
      <Link
        target="_blank"
        href="/network-dao"
        className="text-[15px] px-[14px] font-medium text-white no-underline font-Montserrat hover:text-mainColor"
      >
        Network DAO
      </Link>
    ),
  },
  {
    key: 'Blog',
    label: (
      <Link
        target="_blank"
        href="https://tomorrows-blogs.webflow.io/"
        className="text-[15px] px-[14px] font-medium text-white no-underline font-Montserrat hover:text-mainColor"
      >
        Blog
      </Link>
    ),
  },
  {
    key: 'Resources',
    label: 'Resources',
    children: [
      {
        key: 'Github',
        label: (
          <Link
            target="_blank"
            href="https://github.com/TomorrowDAOProject"
            className="text-[15px] px-[14px] py-[10px] font-medium text-white no-underline font-Montserrat hover:text-mainColor"
          >
            Github
          </Link>
        ),
      },
      {
        key: 'Documentation',
        label: (
          <Link
            target="_blank"
            href="https://tmrwdao-docs-testnet.aelf.dev/"
            className="text-[15px] px-[14px] py-[10px] font-medium text-white no-underline font-Montserrat hover:text-mainColor"
          >
            Documentation
          </Link>
        ),
      },
    ],
  },
];

const groupItems = [
  {
    key: 'Twitter',
    label: (
      <Link
        target="_blank"
        href="https://x.com/tmrwdao"
        className="cursor-pointer px-[14px] font-Montserrat font-medium flex flex-row items-center justify-start text-white text-[15px] no-underline hover:bg-transparent active:bg-transparent hover:text-mainColor active:text-mainColor gap-[14px]"
      >
        <TwitterIcon className="h-[24px] w-[24px]" />
        Twitter
      </Link>
    ),
  },
  {
    key: 'Telegram',
    label: (
      <Link
        target="_blank"
        href="https://t.me/tmrwdao"
        className="cursor-pointer px-[14px] font-Montserrat font-medium flex flex-row items-center justify-start text-white text-[15px] no-underline hover:bg-transparent active:bg-transparent hover:text-mainColor active:text-mainColor gap-[14px]"
      >
        <TelegramIcon className="h-[24px] w-[24px]" />
        Telegram
      </Link>
    ),
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
