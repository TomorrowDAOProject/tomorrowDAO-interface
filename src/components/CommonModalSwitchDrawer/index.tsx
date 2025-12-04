import React, { useMemo } from 'react';
import clsx from 'clsx';
import CommonModal from 'components/CommonModal';
import CommonDrawer from 'components/CommonDrawer';
import { ICommonExtensionProps } from 'types/modalAndDrawer';

type TCommonModalSwitchDrawerProps = {
  commonClassName?: string;
  modalClassName?: string;
  drawerClassName?: string;
  drawerHeight?: number | string;
  modalWidth?: number | string;
  title: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
} & ICommonExtensionProps;

export default function CommonModalSwitchDrawer({
  modalClassName,
  drawerClassName,
  drawerHeight,
  modalWidth,
  onClose,
  ...props
}: TCommonModalSwitchDrawerProps) {
  const isSwitchDrawer = useMemo(() => false, []);

  return isSwitchDrawer ? (
    <CommonDrawer
      {...props}
      className={clsx(drawerClassName, props.commonClassName)}
      height={drawerHeight}
      onClose={onClose}
    />
  ) : (
    <CommonModal
      {...props}
      className={clsx(modalClassName, props.commonClassName)}
      width={modalWidth}
      onCancel={onClose}
    />
  );
}
