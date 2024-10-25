import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Drawer, DrawerProps } from 'antd';
import Alloyfinger from 'alloyfinger';
import './index.css';
import { LeftArrowOutlined } from '@aelf-design/icons';
import { CloseIcon } from 'components/Icons';
import clsx from 'clsx';

interface ICommonDrawerProps {
  title?: React.ReactNode;
  body?: React.ReactNode;
  onClose?: () => void;
  headerClassname?: string;
  bodyClassname?: string;
  rootClassName?: string;
  showCloseTarget?: boolean;
  showLeftArrow?: boolean;
  showCloseIcon?: boolean;
  drawerProps?: DrawerProps;
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
  const {
    onClose: handleClose,
    headerClassname,
    bodyClassname,
    rootClassName,
    showCloseTarget = true,
    showLeftArrow = false,
    drawerProps,
    showCloseIcon = true,
  } = props;
  const [open, setOpen] = useState(false);

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
    handleClose?.();
  };

  useImperativeHandle(ref, () => ({
    open: showDrawer,
    close: onClose,
  }));

  return (
    <Drawer
      title={null}
      rootClassName={clsx('telegram-common-drawer', rootClassName)}
      placement={'bottom'}
      closable={false}
      open={open}
      {...drawerProps}
    >
      <div className={`telegram-common-drawer-body ${bodyClassname}`}>
        <div className={`drawer-header ${headerClassname}`}>
          {showLeftArrow && <LeftArrowOutlined className="left-arrow" onClick={onClose} />}
          {/* {showCloseTarget && <CloseTraget onClose={onClose} />} */}
          <h2 className="title font-17-22">{props.title}</h2>
          {showCloseIcon && <CloseIcon onClick={onClose} />}
        </div>
        <div className="drawer-body font-14-18">{props.body}</div>
      </div>
    </Drawer>
  );
});

export default CommonDrawer;
