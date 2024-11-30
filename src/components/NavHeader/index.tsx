import Link from 'next/link';
import { ReactComponent as LogoIcon } from 'assets/revamp-icon/logo.svg';
import { ReactComponent as TwitterIcon } from 'assets/revamp-icon/twitter.svg';
import { ReactComponent as DiscordIcon } from 'assets/revamp-icon/discord.svg';
import { ReactComponent as TelegramIcon } from 'assets/revamp-icon/telegram.svg';
import { ReactComponent as LinkIcon } from 'assets/revamp-icon/link.svg';
import { ReactComponent as ArrowDownIcon } from 'assets/revamp-icon/arrow-down.svg';
import { Dropdown, Flex, Space } from 'antd';
import { DownOutlined } from '@aelf-design/icons';
import styles from './index.module.css';
import React, { useState } from 'react';
import clsx from 'clsx';
import SideMenu from 'components/SideMenu';

type MenuItem = {
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
            <Space>Github</Space>
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
            <Space>Documentation</Space>
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
            <Flex align="center" gap={14}>
              <TwitterIcon className="w-[18px] h-[18px]" />
              Twitter
            </Flex>
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
            <Flex align="center" gap={14}>
              <DiscordIcon className="w-[18px] h-[18px]" />
              Discord
            </Flex>
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
            <Flex align="center" gap={14}>
              <TelegramIcon className="w-[18px] h-[18px]" />
              Telegram
            </Flex>
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
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div key={item?.key}>
      {item?.children?.length ? (
        <Dropdown
          className="text-white no-underline cursor-pointer"
          overlayClassName={styles['nav-dropdown']}
          menu={{ items: item.children }}
          onOpenChange={(open) => setIsOpen(open)}
        >
          <a onClick={(e) => e.preventDefault()}>
            <span className="text-[15px] font-medium text-white no-underline font-Montserrat m-[8px]">
              {item.label}
            </span>
            <ArrowDownIcon
              className={clsx(
                'transition-all duration-300 ease-in-out',
                isOpen ? 'rotate-180' : '',
              )}
            />
          </a>
        </Dropdown>
      ) : (
        item?.label
      )}
    </div>
  );
};

const NavHeader = ({ style }: { style?: React.CSSProperties }) => {
  return (
    <div
      className={clsx(
        'w-full bg-fillBg sticky top-0 z-10 transition-[top] duration-300 ease-in-out',
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
