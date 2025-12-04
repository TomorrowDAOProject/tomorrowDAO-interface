export type TInfoStateType = {
  isMobile?: boolean;
  isSmallScreen?: boolean;
  theme: string | undefined | null;
  baseInfo: {
    rpcUrl?: string;
    identityPoolID?: string;
    // some config
  };
};

export enum LoginState {
  initial = 'initial',
  lock = 'lock',
  eagerly = 'eagerly',
  logining = 'logining',
  logined = 'logined',
  logouting = 'logouting',
}

export type TLoginStatusType = {
  loginStatus: {
    walletStatus: LoginState;
    isConnectWallet: boolean;
    hasToken: boolean;
    isLogin: boolean;
  };
};
