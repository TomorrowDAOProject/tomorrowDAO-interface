import { ReactComponent as TwitterIcon } from 'assets/revamp-icon/twitter.svg';
import { ReactComponent as DiscordIcon } from 'assets/revamp-icon/discord.svg';
import { ReactComponent as TelegramIcon } from 'assets/revamp-icon/telegram.svg';
import { ReactComponent as MenuIcon } from 'assets/revamp-icon/menu.svg';
import { ReactComponent as LogoIcon } from 'assets/revamp-icon/logo.svg';
import { Drawer } from 'antd';
import React, { useState } from 'react';
import type { MenuProps } from 'antd';
import { Menu } from 'antd';
import './index.css';

type MenuItem = Required<MenuProps>['items'][number];

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

const gourpItems = [
  {
    key: 'Twitter',
    label: 'Twitter',
    icon: <TwitterIcon className="h-[24px] w-[24px]" />,
  },
  {
    key: 'Discord',
    label: 'Discord',
    icon: <DiscordIcon className="h-[24px] w-[24px]" />,
  },
  {
    key: 'Telegram',
    label: 'Telegram',
    icon: <TelegramIcon className="h-[24px] w-[24px]" />,
  },
];

const SideMenu = () => {
  const [open, setOpen] = useState(false);
  const onClick: MenuProps['onClick'] = (e) => {
    console.log('click ', e);
  };

  return (
    <>
      <div onClick={() => setOpen(true)}>
        <MenuIcon className="h-[12px] w-[14.2px] cursor-pointer" />
      </div>
      <Drawer
        placement="left"
        closeIcon={false}
        title={<LogoIcon className="w-[117.22px] h-[19px]" />}
        width={249}
        onClose={() => setOpen(false)}
        open={open}
        className="side-menu-drawer"
      >
        <div className="flex flex-col justify-between h-full">
          <Menu
            onClick={onClick}
            className="side-menu"
            defaultSelectedKeys={['1']}
            defaultOpenKeys={['sub1']}
            mode="inline"
            items={items}
          />

          <Menu
            onClick={onClick}
            className="side-menu"
            defaultSelectedKeys={['1']}
            defaultOpenKeys={['sub1']}
            mode="inline"
            items={gourpItems}
          />
        </div>
      </Drawer>
    </>
  );
};

export default SideMenu;
