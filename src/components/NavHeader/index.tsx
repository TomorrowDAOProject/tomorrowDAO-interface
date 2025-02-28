import Link from 'next/link';
import { ReactComponent as LogoIcon } from 'assets/revamp-icon/logo.svg';
import { DownOutlined } from '@aelf-design/icons';
import React, { useMemo } from 'react';
import clsx from 'clsx';
import SideMenu from 'components/SideMenu';
import NavMenuItem from './NavMenuItem';
import Dropdown from 'components/Dropmenu';
import { useWalletService } from 'hooks/useWallet';
import { WalletTypeEnum } from '@aelf-web-login/wallet-adapter-base';
import { useSelector } from 'redux/store';
import useIsNetworkDao from 'hooks/useIsNetworkDao';
import getChainIdQuery from 'utils/url';
import Button from 'components/Button';
import Text from 'components/Text';
import './index.css';
import { useUrlPath } from 'hooks/useUrlPath';
import { useRouter } from 'next/navigation';

export interface MenuItem {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  children?: MenuItem[];
  onClick?: () => void;
}

const items: MenuItem[] = [
  {
    key: 'NetworkDAO',
    label: (
      <Link
        href="/network-dao"
        target="_blank"
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
            target="_blank"
            href="https://github.com/TomorrowDAOProject"
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
            target="_blank"
            href="https://tmrwdao-docs-testnet.aelf.dev/"
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
    label: 'Social Media',
    icon: <DownOutlined />,
    children: [
      {
        key: 'Twitter',
        label: (
          <Link
            target="_blank"
            href="https://x.com/tmrwdao"
            className="text-[15px] font-medium text-white no-underline font-Montserrat hover:text-mainColor"
          >
            <div className="flex items-center gap-[14px]">
              <i className="tmrwdao-icon-twitter text-[16px] text-white" />
              Twitter
            </div>
          </Link>
        ),
      },
      {
        key: 'Telegram',
        label: (
          <Link
            target="_blank"
            href="https://t.me/tmrwdao"
            className="text-[15px] font-medium text-white no-underline font-Montserrat hover:text-mainColor"
          >
            <div className="flex items-center gap-[14px]">
              <i className="tmrwdao-icon-telegram text-[16px] text-white" />
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
        target="_blank"
        href="https://tomorrows-blogs.webflow.io/"
        className="text-[15px] font-medium text-white no-underline font-Montserrat hover:text-mainColor"
      >
        Blog
      </Link>
    ),
  },
];

const NavHeader = ({ className, style }: { className?: string; style?: React.CSSProperties }) => {
  const { login, isLogin, walletType, logout } = useWalletService();
  const { isNetWorkDao } = useIsNetworkDao();
  const { isHome } = useUrlPath();
  const router = useRouter();

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
        <Link href="/">
          <LogoIcon className="h-[19px] w-[117.22px] lg:h-[19.6px] lg:w-[121px] xl:h-[24.5px] xl:w-[151px]" />
        </Link>

        <div className="items-center gap-[40px] hidden lg:flex">
          {items.map((item) => (
            <NavMenuItem item={item} key={item?.key} />
          ))}
        </div>

        <div className="flex items-center gap-[13px]">
          {isHome ? (
            <Link href="/explore" className="primary-button inline-flex items-center gap-[10px]">
              Launch App
              <i className="tmrwdao-icon-default-arrow text-[16px] text-inherit" />
            </Link>
          ) : !isLogin ? (
            <Button
              type="primary"
              className="hover:!bg-mainColor active:!bg-mainColor hover:!text-white active:!text-white md:hover:!bg-transparent md:active:!bg-transparent md:hover:!text-white md:active:!text-white"
              onClick={login}
            >
              <i className="tmrwdao-icon-profile text-[22px] text-inherit mr-[6px]" />
              Log In
            </Button>
          ) : (
            <Dropdown
              menu={[
                {
                  key: 'HashAddress',
                  icon: <i className="tmrwdao-icon-wallet text-[18px] text-white" />,
                  label: (
                    <div className="address-contain">
                      <Text
                        content={`ELF_${walletInfo.address}_${
                          isNetWorkDao ? chainIdQuery.chainId : info.curChain
                        }`}
                        copyable
                        isAddress
                        shortAddress
                      />
                    </div>
                  ),
                },
                {
                  key: 'myDaos',
                  icon: <i className="tmrwdao-icon-profile text-[18px] text-white" />,
                  label: (
                    <span className="block text-descM14 text-white font-Montserrat hover:text-white cursor-pointer">
                      My DAOs
                    </span>
                  ),
                  onClick: () => router.push('/my-daos'),
                },
                {
                  key: 'logout',
                  icon: <i className="tmrwdao-icon-logout text-[18px] text-white" />,
                  label: (
                    <span className="block text-descM14 font-Montserrat cursor-pointer">
                      Log out
                    </span>
                  ),
                  onClick: () => logout(),
                },
              ]}
              align="right"
              MenuClassName="w-[284px] bg-darkBg !px-0"
              MenuItemClassName="px-[20px] transition-all duration-300 ease-in-out hover:bg-fillBg8"
              showArrow={false}
            >
              <Button type="primary" className="!bg-mainColor !text-white">
                <i className="tmrwdao-icon-profile text-[22px] text-inherit mr-[6px]" />
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
