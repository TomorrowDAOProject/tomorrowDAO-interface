// src/components/Drawer.js
import React from 'react';

interface IDrawerProps {
  title: React.ReactNode;
  width?: number;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Drawer = ({ title, width = 249, open, onClose, children }: IDrawerProps) => {
  return (
    <>
      <div
        className={`fixed top-0 left-0 h-full w-screen bg-fillBlack15 z-50 ${
          open ? 'block' : 'hidden'
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed top-0 h-screen flex w-[249px] flex-col p-[24px] bg-darkGray z-50 box-border transition-[left] duration-300 ${
          open ? 'left-0' : 'left-[-100%]'
        } w-[${width}px]`}
      >
        <div className="shrink-0 py-[20px] px-[14px]">{title}</div>
        <div className="flex-1 pt-[34px]">{children}</div>
      </div>
    </>
  );
};

export default Drawer;
