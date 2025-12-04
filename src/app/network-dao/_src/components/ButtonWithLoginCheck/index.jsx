import React from "react";
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import Button from "components/Button";

export default function ButtonWithLoginCheck({
  children,
  onClick,
  checkAccountInfoSync,
  ...props
}) {
  const { connectWallet, connecting, walletInfo } = useConnectWallet()

  const onClickInternal = (event) => {
    if (!walletInfo) {
      connectWallet();
    } else {
      onClick?.(event);
    }
  };

  return (
    <Button
      {...props}
      onClick={onClickInternal}
      loading={ connecting || props.loading }
    >
      {children}
    </Button>
  );
}