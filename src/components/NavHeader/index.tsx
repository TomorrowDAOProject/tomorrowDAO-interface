import Link from 'next/link';
import { ReactComponent as LogoIcon } from 'assets/revamp-icon/logo.svg';
import { ReactComponent as TwitterIcon } from 'assets/revamp-icon/twitter.svg';
import { ReactComponent as TelegramIcon } from 'assets/revamp-icon/telegram.svg';
import { DownOutlined } from '@aelf-design/icons';
import React, { useMemo } from 'react';
import clsx from 'clsx';
import SideMenu from 'components/SideMenu';
import NavMenuItem from './NavMenuItem';
import Dropdown from 'components/Dropmenu';
import { HashAddress } from 'aelf-design';
import { useWalletService } from 'hooks/useWallet';
import { WalletTypeEnum } from '@aelf-web-login/wallet-adapter-base';
import { useSelector } from 'redux/store';
import useIsNetworkDao from 'hooks/useIsNetworkDao';
import getChainIdQuery from 'utils/url';
import Button from 'components/Button';
import './index.css';

export interface MenuItem {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  children?: MenuItem[];
}

const items: MenuItem[] = [
  {
    key: 'NetworkDAO',
    label: (
      <Link
        href={'/'}
        className="text-[15px] font-medium text-white no-underline font-Montserrat hover:text-mainColor"
      >
        Network DAO
      </Link>
    ),
  },
  {
    key: 'Resources',
    label: 'Resources',
    icon: <DownOutlined />,
    children: [
      {
        key: 'Github',
        label: (
          <Link
            href={'/'}
            className="text-[15px] font-medium text-white no-underline font-Montserrat hover:text-mainColor"
          >
            Github
          </Link>
        ),
      },
      {
        key: 'Documentation',
        label: (
          <Link
            href={'/'}
            className="text-[15px] font-medium text-white no-underline font-Montserrat hover:text-mainColor"
          >
            Documentation
          </Link>
        ),
      },
    ],
  },
  {
    key: 'grp',
    label: 'Group',
    icon: <DownOutlined />,
    children: [
      {
        key: 'Twitter',
        label: (
          <Link
            href={'/'}
            className="text-[15px] font-medium text-white no-underline font-Montserrat hover:text-mainColor"
          >
            <div className="flex items-center gap-[14px]">
              <TwitterIcon className="w-[18px] h-[18px]" />
              Twitter
            </div>
          </Link>
        ),
      },
      {
        key: 'Telegram',
        label: (
          <Link
            href={'/'}
            className="text-[15px] font-medium text-white no-underline font-Montserrat hover:text-mainColor"
          >
            <div className="flex items-center gap-[14px]">
              <TelegramIcon className="w-[18px] h-[18px]" />
              Telegram
            </div>
          </Link>
        ),
      },
    ],
  },
  {
    key: 'Blog',
    label: (
      <Link
        href={'/'}
        className="text-[15px] font-medium text-white no-underline font-Montserrat hover:text-mainColor"
      >
        Blog
      </Link>
    ),
  },
];

const NavHeader = ({ className, style }: { className?: string; style?: React.CSSProperties }) => {
  const { login, isLogin, walletType, logout } = useWalletService();
  console.log('isLogin', isLogin);
  const { isNetWorkDao } = useIsNetworkDao();
  const chainIdQuery = getChainIdQuery();
  const { walletInfo } = useSelector((store: any) => store.userInfo);
  const info = useSelector((store: any) => store.elfInfo.elfInfo);
  const userName = useMemo(() => {
    if (walletInfo) {
      if (walletType === WalletTypeEnum.discover) {
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
    <div
      className={clsx(
        'w-full bg-fillBg sticky top-0 z-10 transition-[top] duration-300 ease-in-out',
        className,
      )}
      style={style}
    >
      <div className="max-w-[1280px] mx-auto px-[20px] py-[25px] flex justify-between items-center box-border md:px-[40px] lg:px-[84px] lg:py-[17px] xl:px-[35px] xl:py-[21px]">
        <Link target="_blank" href="/">
          <LogoIcon className="h-[19px] w-[117.22px] lg:h-[19.6px] lg:w-[121px] xl:h-[24.5px] xl:w-[151px]" />
        </Link>

        <div className="flex items-center gap-[40px] hidden lg:flex">
          {items.map((item) => (
            <NavMenuItem item={item} key={item?.key} />
          ))}
        </div>

        <div className="flex items-center gap-[13px]">
          {!isLogin ? (
            <Button
              type="primary"
              onClick={() => {
                login();
              }}
            >
              Launch App
              <i className="tmrwdao-icon-default-arrow text-[18px] text-white ml-2" />
            </Button>
          ) : (
            <Dropdown
              menu={[
                {
                  key: 'HashAddress',
                  icon: <i className="tmrwdao-icon-wallet text-[18px] text-white" />,
                  label: (
                    <div className="address-contain">
                      <HashAddress
                        size="small"
                        chain={isNetWorkDao ? chainIdQuery.chainId : info.curChain}
                        address={walletInfo.address}
                        preLen={8}
                        endLen={9}
                      />
                    </div>
                  ),
                },
                {
                  key: 'myDaos',
                  icon: <i className="tmrwdao-icon-profile text-[18px] text-white" />,
                  label: (
                    <Link
                      href="/my-daos"
                      className="block text-descM14 text-white font-Montserrat hover:text-white"
                    >
                      My DAOs
                    </Link>
                  ),
                },
                {
                  key: 'logout',
                  icon: <i className="tmrwdao-icon-log-out text-[18px] text-white" />,
                  label: (
                    <span
                      className="block text-descM14 font-Montserrat cursor-pointer"
                      onClick={() => logout()}
                    >
                      Log out
                    </span>
                  ),
                },
              ]}
              align="right"
              MenuClassName="w-[284px] bg-darkBg !px-[6px]"
              showArrow={false}
            >
              <Button type="primary">
                <i className="tmrwdao-icon-profile text-[22px] text-white mr-[6px]" />
                {userName}
              </Button>
            </Dropdown>
          )}

          <div className="flex items-center gap-[10px] visible lg:hidden">
            <SideMenu />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavHeader;
