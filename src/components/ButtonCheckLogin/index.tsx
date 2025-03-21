import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import Button from 'components/Button';

interface IButtonProps {
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  className?: string;
  type?: 'default' | 'primary' | 'info' | 'warning' | 'danger' | 'link';
  children: React.ReactNode;
  onClick?(args?: HTMLButtonElement): void;
  loading?: boolean;
}

export const ButtonCheckLogin: React.FC<IButtonProps> = (props) => {
  const { walletInfo: wallet, connectWallet } = useConnectWallet();
  return (
    <Button
      {...props}
      onClick={(...args) => {
        if (!wallet?.address) {
          connectWallet();
          return;
        }
        props.onClick?.(...args);
      }}
    >
      {props.children}
    </Button>
  );
};
