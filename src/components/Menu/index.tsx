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
      className="custom-menu m-auto text-center min-w-[600px] justify-center"
      mode="horizontal"
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
        width="70%"
        title={
          <div className="menu-header-container">
            <Link href="/" onClick={onClose}>
              <HeaderLogo />
            </Link>
          </div>
        }
        className="mobile-menu-drawer"
        placement="right"
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
