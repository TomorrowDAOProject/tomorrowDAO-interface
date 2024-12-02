import Link from 'next/link';
import { ReactComponent as LogoIcon } from 'assets/revamp-icon/logo.svg';
import { ReactComponent as TwitterIcon } from 'assets/revamp-icon/twitter.svg';
import { ReactComponent as DiscordIcon } from 'assets/revamp-icon/discord.svg';
import { ReactComponent as TelegramIcon } from 'assets/revamp-icon/telegram.svg';
import { ReactComponent as LinkIcon } from 'assets/revamp-icon/link.svg';
import { DownOutlined } from '@aelf-design/icons';
import React from 'react';
import clsx from 'clsx';
import SideMenu from 'components/SideMenu';
import Dropdown from 'components/Dropmenu';

export type MenuItem = {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  children?: MenuItem[];
};

const items: MenuItem[] = [
  {
    key: 'NetworkDAO',
    label: (
      <Link href={'/'} className="text-[15px] font-medium text-white no-underline font-Montserrat">
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
            className="text-[15px] font-medium text-white no-underline font-Montserrat"
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
            className="text-[15px] font-medium text-white no-underline font-Montserrat"
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
            className="text-[15px] font-medium text-white no-underline font-Montserrat"
          >
            <div className="flex items-center gap-[14px]">
              <TwitterIcon className="w-[18px] h-[18px]" />
              Twitter
            </div>
          </Link>
        ),
      },
      {
        key: 'Discord',
        label: (
          <Link
            href={'/'}
            className="text-[15px] font-medium text-white no-underline font-Montserrat"
          >
            <div className="flex items-center gap-[14px]">
              <DiscordIcon className="w-[18px] h-[18px]" />
              Discord
            </div>
          </Link>
        ),
      },
      {
        key: 'Telegram',
        label: (
          <Link
            href={'/'}
            className="text-[15px] font-medium text-white no-underline font-Montserrat"
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
      <Link href={'/'} className="text-[15px] font-medium text-white no-underline font-Montserrat">
        Blog
      </Link>
    ),
  },
];

const NavMenuItem = ({ item }: { item: MenuItem }) => {

  return (
    <div key={item?.key}>
      {item?.children?.length ? (
        <Dropdown menu={item.children}>
          <a onClick={(e) => e.preventDefault()}>
            <span className="text-[15px] font-medium text-white no-underline font-Montserrat m-[8px]">
              {item.label}
            </span>
          </a>
        </Dropdown>
      ) : (
        item?.label
      )}
    </div>
  );
};

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
