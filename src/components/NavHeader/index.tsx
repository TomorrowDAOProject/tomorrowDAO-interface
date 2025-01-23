import Link from 'next/link';
import { ReactComponent as LogoIcon } from 'assets/revamp-icon/logo.svg';
import { ReactComponent as TwitterIcon } from 'assets/revamp-icon/twitter.svg';
import { ReactComponent as TelegramIcon } from 'assets/revamp-icon/telegram.svg';
import { ReactComponent as LinkIcon } from 'assets/revamp-icon/link.svg';
import { DownOutlined } from '@aelf-design/icons';
import React from 'react';
import clsx from 'clsx';
import SideMenu from 'components/SideMenu';
import NavMenuItem from './NavMenuItem';

export interface MenuItem {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  children?: MenuItem[];
}

const items: MenuItem[] = [
  {
    key: 'NetworkDAO',
    label: (
      <Link
        href={'/'}
        className="text-[15px] font-medium text-white no-underline font-Montserrat hover:text-mainColor"
      >
        Network DAO
      </Link>
    ),
  },
  {
    key: 'Resources',
    label: 'Resources',
    icon: <DownOutlined />,
    children: [
      {
        key: 'Github',
        label: (
          <Link
            href={'/'}
            className="text-[15px] font-medium text-white no-underline font-Montserrat hover:text-mainColor"
          >
            Github
          </Link>
        ),
      },
      {
        key: 'Documentation',
        label: (
          <Link
            href={'/'}
            className="text-[15px] font-medium text-white no-underline font-Montserrat hover:text-mainColor"
          >
            Documentation
          </Link>
        ),
      },
    ],
  },
  {
    key: 'grp',
    label: 'Group',
    icon: <DownOutlined />,
    children: [
      {
        key: 'Twitter',
        label: (
          <Link
            href={'/'}
            className="text-[15px] font-medium text-white no-underline font-Montserrat hover:text-mainColor"
          >
            <div className="flex items-center gap-[14px]">
              <TwitterIcon className="w-[18px] h-[18px]" />
              Twitter
            </div>
          </Link>
        ),
      },
      {
        key: 'Telegram',
        label: (
          <Link
            href={'/'}
            className="text-[15px] font-medium text-white no-underline font-Montserrat hover:text-mainColor"
          >
            <div className="flex items-center gap-[14px]">
              <TelegramIcon className="w-[18px] h-[18px]" />
              Telegram
            </div>
          </Link>
        ),
      },
    ],
  },
  {
    key: 'Blog',
    label: (
      <Link
        href={'/'}
        className="text-[15px] font-medium text-white no-underline font-Montserrat hover:text-mainColor"
      >
        Blog
      </Link>
    ),
  },
];

const NavHeader = ({ className, style }: { className?: string; style?: React.CSSProperties }) => {
  return (
    <div
      className={clsx(
        'w-full bg-fillBg sticky top-0 z-10 transition-[top] duration-300 ease-in-out',
        className,
      )}
      style={style}
    >
      <div className="max-w-[1280px] mx-auto px-[20px] py-[25px] flex justify-between items-center box-border md:px-[40px] lg:px-[84px] lg:py-[17px] xl:px-[35px] xl:py-[21px]">
        <Link target="_blank" href="/">
          <LogoIcon className="h-[19px] w-[117.22px] lg:h-[19.6px] lg:w-[121px] xl:h-[24.5px] xl:w-[151px]" />
        </Link>

        <div className="flex items-center gap-[40px] hidden lg:flex">
          {items.map((item) => (
            <NavMenuItem item={item} key={item?.key} />
          ))}
        </div>

        <div className="flex items-center gap-[13px]">
          <Link href="/" className="primary-button inline-flex items-center gap-[10px]">
            Launch App
            <LinkIcon className="h-[11px] w-[11px]" />
          </Link>

          <div className="flex items-center gap-[10px] visible lg:hidden">
            <SideMenu />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavHeader;
