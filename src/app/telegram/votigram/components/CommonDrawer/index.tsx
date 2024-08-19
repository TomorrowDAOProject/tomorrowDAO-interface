import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import type { DrawerProps, RadioChangeEvent } from 'antd';
import { Drawer } from 'antd';
import Alloyfinger from 'alloyfinger';
import './index.css';

interface ICommonDrawerProps {
  title?: string;
  body?: React.ReactNode;
}
interface ICloseTragetProps {
  onClose: () => void;
}
const CloseTraget = (props: ICloseTragetProps) => {
  const { onClose } = props;
  const closeDom = useRef(null);
  useEffect(() => {
    const myElement = closeDom.current;
    if (!myElement) return;
    const hammertime = new Alloyfinger(myElement, {});
    const callBack = (evt: any) => {
      if (evt.direction === 'Down') {
        onClose();
      }
    };
    hammertime.on('swipe', callBack);
    return () => {
      hammertime.off('swipe', callBack);
    };
  }, []);
  return <div className="close-target" ref={closeDom}></div>;
};
export interface ICommonDrawerRef {
  open: () => void;
  close: () => void;
}
const CommonDrawer = forwardRef<ICommonDrawerRef, ICommonDrawerProps>((props, ref) => {
  const [open, setOpen] = useState(false);

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  useImperativeHandle(ref, () => ({
    open: showDrawer,
    close: onClose,
  }));

  return (
    <Drawer
      title={null}
      rootClassName="telegram-common-drawer"
      placement={'bottom'}
      closable={false}
      open={open}
    >
      <div className="telegram-common-drawer-body">
        <div className="drawer-header">
          <CloseTraget onClose={onClose} />
          <h2 className="title font-17-22">{props.title}</h2>
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="close-icon"
            onClick={onClose}
          >
            <g clipPath="url(#clip0_178_27607)">
              <path
                d="M14 28C21.6589 28 28 21.6451 28 14C28 6.34117 21.6451 0 13.9863 0C6.34117 0 0 6.34117 0 14C0 21.6451 6.35489 28 14 28Z"
                fill="white"
                fillOpacity="0.08"
              />
              <path
                opacity="0.5"
                d="M9.17282 20C8.51489 20 8 19.4702 8 18.8115C8 18.4964 8.11441 18.1957 8.34326 17.9808L12.3051 14L8.34326 10.0334C8.11441 9.8043 8 9.51789 8 9.20286C8 8.52982 8.51489 8.02864 9.17282 8.02864C9.50178 8.02864 9.75923 8.14319 9.98807 8.35799L13.9785 12.3389L17.9976 8.34367C18.2407 8.10024 18.4982 8 18.8128 8C19.4707 8 20 8.51551 20 9.17422C20 9.50358 19.8998 9.76133 19.6423 10.0191L15.6663 14L19.6281 17.9666C19.8713 18.1814 19.9856 18.482 19.9856 18.8115C19.9856 19.4702 19.4565 20 18.7842 20C18.4553 20 18.1549 19.8855 17.9403 19.6563L13.9785 15.6754L10.031 19.6563C9.80214 19.8855 9.50178 20 9.17282 20Z"
                fill="white"
                fillOpacity="0.95"
              />
            </g>
            <defs>
              <clipPath id="clip0_178_27607">
                <rect width="28" height="28" fill="white" />
              </clipPath>
            </defs>
          </svg>
        </div>
        <div className="drawer-body font-14-18">{props.body}</div>
      </div>
    </Drawer>
  );
});

export default CommonDrawer;
