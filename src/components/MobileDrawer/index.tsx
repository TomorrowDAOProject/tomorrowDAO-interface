// src/components/Drawer.js
import React, { useState } from 'react';

type IProps = {
  title: React.ReactNode;
  width?: number;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
};

const Drawer = ({ title, width = 249, open, onClose, children, style }: IProps) => {
  return (
    <>
      <div
        className={`fixed top-0 left-0 h-full w-full bg-fillBlack15 z-50 ${
          open ? 'block' : 'hidden'
        }`}
        onClick={onClose}
      ></div>

      <div
        className={`fixed top-0 h-full flex w-[249px] flex-col p-[24px] bg-darkGray z-50 box-border transition-[left] duration-300 ${
          open ? 'left-0' : 'left-[-100%]'
        } w-[${width}px]`}
        style={style}
      >
        <div className="shrink-0 py-[20px] px-[14px]">{title}</div>
        <div className="flex-1 pt-[34px]">{children}</div>
      </div>
    </>
  );
};

export default Drawer;
