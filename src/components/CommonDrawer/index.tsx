import clsx from 'clsx';
import { Drawer, DrawerProps } from 'antd';
import CommonHeader from 'components/CommonComponentsOfModalAndDrawer/CommonHeader';
import CommonFooter from 'components/CommonComponentsOfModalAndDrawer/CommonFooter';
import { ICommonExtensionProps } from 'types/modalAndDrawer';
import './index.css';

type TCommonDrawerProps = ICommonExtensionProps &
  Omit<DrawerProps, 'onClose'> & {
    onClose: Required<DrawerProps>['onClose'];
  };

export default function CommonDrawer({
  className,
  height,
  title,
  footerConfig,
  children,
  ...props
}: TCommonDrawerProps) {
  return (
    <Drawer
      placement="bottom"
      {...props}
      className={clsx('common-drawer', className)}
      height={height ?? '80%'}
      title={<CommonHeader title={title} onClose={props.onClose} />}
      closeIcon={null}
      footer={null}
    >
      {children}
      {footerConfig && <CommonFooter {...footerConfig} />}
    </Drawer>
  );
}
