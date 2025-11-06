import HashAddress from 'components/HashAddress';
import Button from 'components/Button';
import useResponsive from 'hooks/useResponsive';
import { useCheckLoginAndToken, useWalletService } from 'hooks/useWallet';
import { useSelector } from 'redux/store';
import { ExitOutlined, UserProfileOutlined, WalletOutlined } from '@aelf-design/icons';
import { useMemo, useState } from 'react';
import { Popover } from 'antd';
import Link from 'next/link';
import './index.css';
import { explorer } from 'config';
import getChainIdQuery from 'utils/url';
import { WalletTypeEnum } from '@aelf-web-login/wallet-adapter-base';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';

export const LoginAuth = () => {
  const { connectWallet, walletInfo } = useConnectWallet();

  const { getTokenUpdate } = useCheckLoginAndToken();
  console.log('LoginAuth: walletInfo: ', walletInfo);
  if (walletInfo) {
    return (
      <Button
        type="primary"
        className="h-[32px]"
        onClick={() => {
          getTokenUpdate();
        }}
      >
        <span className="text-[12px]">Authorization</span>
      </Button>
    );
  }
  return (
    <Button
      type="primary"
      className="h-[32px]"
      onClick={() => {
        const daoVersion = localStorage.getItem('daoVersion');
        if (!daoVersion) {
          localStorage.clear();
          localStorage.setItem('daoVersion', '20251017');
        }
        connectWallet();
      }}
    >
      <i className="tmrwdao-icon-profile text-[22px] text-inherit mr-[6px]"></i>
      <span className="text-[12px]">Log in</span>
    </Button>
  );
};
interface ILoginProps {
  isNetWorkDao?: boolean;
}
export default function Login(props: ILoginProps) {
  const { isNetWorkDao } = props;
  const { isSM } = useResponsive();
  const { disConnectWallet } = useConnectWallet();
  const [hovered, setHovered] = useState(false);
  const chainIdQuery = getChainIdQuery();
  const hide = () => {
    setHovered(false);
  };
  const handleHoverChange = (open: boolean) => {
    setHovered(open);
  };
  const { isLogin, walletType } = useWalletService();
  const { walletInfo } = useSelector((store: any) => store.userInfo);
  const info = useSelector((store: any) => store.elfInfo.elfInfo);
  const logoutEvent = () => {
    disConnectWallet();
  };
  const isPortkeyLogin = walletType === WalletTypeEnum.aa;
  const userName = useMemo(() => {
    if (walletInfo) {
      if (walletType === WalletTypeEnum.discover || walletType === WalletTypeEnum.fairyVault) {
        return walletInfo?.discoverInfo?.nickName;
      } else if (walletType === WalletTypeEnum.aa) {
        return walletInfo?.portkeyInfo?.nickName;
      } else if (walletType === WalletTypeEnum.elf) {
        return walletInfo?.nightElfInfo?.name;
      }
      return walletInfo.name;
    }
    return '';
  }, [walletInfo, walletType]);
  return (
    <div className="login-container">
      {!isLogin ? (
        <LoginAuth />
      ) : (
        <Popover
          placement={'bottomRight'}
          overlayClassName="user-popover"
          arrow={false}
          trigger="click"
          open={hovered}
          onOpenChange={handleHoverChange}
          content={
            <div className="header-dropdown-container" onClick={hide}>
              <Link href={`${explorer}/address/${walletInfo.address}`} target="_blank">
                <div className="drop-down-items">
                  <span className="prefix-icon">
                    <i className="tmrwdao-icon-wallet text-[18px] text-white" />
                  </span>
                  <HashAddress
                    size="small"
                    chain={isNetWorkDao ? chainIdQuery.chainId : info.curChain}
                    address={walletInfo.address}
                    preLen={8}
                    endLen={9}
                    iconColor="#989DA0"
                    iconSize="18px"
                  />
                </div>
              </Link>
              {isPortkeyLogin && (
                <Link href={'/assets'}>
                  <div className="drop-down-items">
                    <span className="prefix-icon">
                      <WalletOutlined />
                    </span>
                    My Assets
                  </div>
                </Link>
              )}
              <Link href={'/my-daos'}>
                <div className="drop-down-items">
                  <span className="prefix-icon">
                    <UserProfileOutlined />
                  </span>
                  My DAOs
                </div>
              </Link>
              <div className="drop-down-items" onClick={logoutEvent}>
                <span className="prefix-icon">
                  <ExitOutlined />
                </span>
                <span>Log out</span>
              </div>
            </div>
          }
        >
          <div className="user-info">
            <i className="tmrwdao-icon-profile text-[22px] text-inherit text-white"></i>
            {/*{!isSM && <div className="user-name ml-[6px]">{userName}</div>}*/}
            <div className="user-name ml-[6px] sm:max-w-[80px]">{userName}</div>
          </div>
        </Popover>
      )}
    </div>
  );
}
