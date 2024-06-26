'use client';
import React, { useState } from 'react';
import { Drawer, Menu } from 'antd';
import MenuButton from 'components/MenuButton';
import './index.css';
import { HeaderLogo } from 'components/Logo';
import { ReactComponent as CloseIcon } from 'assets/imgs/close.svg';
import type { MenuProps } from 'antd';
import Link from 'next/link';

export interface IMobileMenuProps extends Omit<MenuProps, 'mode'> {
  className?: string;
}

function PCMenu(props: IMobileMenuProps) {
  return (
    <Menu
      className="custom-menu"
      mode="horizontal"
      // eslint-disable-next-line no-inline-styles/no-inline-styles
      style={{ minWidth: 0, flex: 'auto' }}
      {...props}
    />
  );
}

function MobileMenu(props: IMobileMenuProps) {
  const [open, setOpen] = useState(false);
  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  return (
    <div className="mobile-menu-container">
      <div onClick={showDrawer}>
        <MenuButton />
      </div>
      <Drawer
        width="100%"
        title={
          <div className="menu-header-container">
            <Link href="/" onClick={onClose}>
              <HeaderLogo />
            </Link>
            <CloseIcon className="cursor-pointer" width={16} height={16} onClick={onClose} />
          </div>
        }
        className="mobile-menu-drawer"
        placement="left"
        closable={false}
        onClose={onClose}
        open={open}
      >
        <Menu
          mode="inline"
          className="mobile-custom-menu"
          {...props}
          onClick={(...args) => {
            setOpen(false);
            props?.onClick?.(...args);
          }}
        />
      </Drawer>
    </div>
  );
}

export { PCMenu, MobileMenu };
