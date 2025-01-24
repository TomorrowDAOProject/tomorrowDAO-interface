'use client';
import { HeaderLogo } from 'components/Logo';
import './index.css';
import { PCMenu } from 'components/Menu';
import Link from 'next/link';
import useResponsive, { useLandingPageResponsive } from 'hooks/useResponsive';
import { MobileMenu } from 'components/Menu';
import { ReactComponent as MenuArrow } from 'assets/imgs/menu-arrow.svg';
import { MenuProps } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import dynamicReq from 'next/dynamic';
import { useUrlPath } from 'hooks/useUrlPath';
import { Button } from 'aelf-design';
import { eventBus, ShowHeaderExplore } from 'utils/myEvent';
export enum ENavKeys {
  CreateDAO = 'CreateDAO',
  Resources = 'Resources',
  Documentation = 'Documentation',
  GitHub = 'GitHub',
  WhitePaper = 'WhitePaper',
  SocialMedia = 'SocialMedia',
  Twitter = 'Twitter',
  Discord = 'Discord',
  Telegram = 'Telegram',
  Treasury = 'Treasury',
  Blog = 'Blog',
  Votigram = 'Votigram',
}
const DynamicLogin = dynamicReq(() => import('components/Login'), {
  ssr: false,
});
export default function Header() {
  const { isLG } = useResponsive();
  const { isPad } = useLandingPageResponsive();
  const pathname = usePathname();
  const [isShowHeaderExplore, setIsShowHeaderExplore] = useState(false);
  const items: MenuProps['items'] = useMemo(() => {
    return [
      {
        label: <Link href="/create">Create a DAO</Link>,
        key: ENavKeys.CreateDAO,
      },
      {
        label: (
          <div className="menu-label">
            <span className="menu-label-text">Resources</span>
            {!isLG && <MenuArrow className="transition-all duration-200" />}
          </div>
        ),
        key: ENavKeys.Resources,
        popupClassName: 'pc-menu-popup',
        children: [
          {
            label: (
              <Link href="https://github.com/TomorrowDAOProject" target="_blank">
                GitHub
              </Link>
            ),
            key: ENavKeys.GitHub,
          },
          {
            label: (
              <Link href="https://docs.tmrwdao.com/" target="_blank">
                Documentation
              </Link>
            ),
            key: ENavKeys.Documentation,
          },
          // {
          //   label: 'White Paper',
          //   key: ENavKeys.WhitePaper,
          // },
        ],
      },
      {
        label: (
          <div className="menu-label">
            <span className="menu-label-text">Social Media</span>
            {!isLG && <MenuArrow className="transition-all duration-200" />}
          </div>
        ),
        popupClassName: 'pc-menu-popup',
        key: ENavKeys.SocialMedia,
        children: [
          {
            label: (
              <Link href="https://twitter.com/tmrwdao" target="_blank">
                Twitter
              </Link>
            ),
            key: ENavKeys.Twitter,
          },
          {
            label: (
              <Link href="https://discord.com/invite/gTWkeR5pQB" target="_blank">
                Discord
              </Link>
            ),
            key: ENavKeys.Discord,
          },
          {
            label: (
              <Link href="https://t.me/tmrwdao" target="_blank">
                Telegram
              </Link>
            ),
            key: ENavKeys.Telegram,
          },
        ],
      },
      {
        label: (
          <Link href={'https://blog.tmrwdao.com'} target="_blank">
            Blog
          </Link>
        ),
        key: ENavKeys.Blog,
      },
      {
        label: <Link href={'/votigram'}>Votigram</Link>,
        key: ENavKeys.Votigram,
      },
    ];
  }, [isLG]);
  const [current, setCurrent] = useState('');

  const onClick: MenuProps['onClick'] = (e) => {
    if (e.key === ENavKeys.CreateDAO) {
      setCurrent(e.key);
    }
    if (e.key === ENavKeys.Votigram) {
      setCurrent(e.key);
    }
  };
  const { isHome, isExplorer } = useUrlPath();

  useEffect(() => {
    // refresh from path map to nav active
    if (pathname === '/create') {
      setCurrent(ENavKeys.CreateDAO);
    } else if (pathname === '/votigram') {
      setCurrent(ENavKeys.Votigram);
    } else {
      setCurrent('');
    }
  }, [pathname]);
  useEffect(() => {
    const handleShowHeaderExplore = (data: boolean) => {
      setIsShowHeaderExplore(data);
    };
    eventBus.addListener(ShowHeaderExplore, handleShowHeaderExplore);
    return () => {
      eventBus.removeListener(ShowHeaderExplore, handleShowHeaderExplore);
    };
  }, []);

  const menuCondition = isHome ? isPad : isLG;
  const showHeaderExplore = isHome && isShowHeaderExplore;
  return (
    <header className={`header-container ${isHome ? 'home' : ''}`}>
      <div className="header-banner">
        <div className="header-logo">
          <div className="header-menu">
            <Link href="/">
              <HeaderLogo />
            </Link>
            {!menuCondition && <PCMenu selectedKeys={[current]} items={items} onClick={onClick} />}
          </div>
          {!isHome && <DynamicLogin />}
          {showHeaderExplore && (
            <Link href="/explore">
              <Button type="primary" className="explore-button">
                Explore
              </Button>
            </Link>
          )}
        </div>
        {menuCondition && (
          <div className="header-menu-icon">
            <MobileMenu selectedKeys={[current]} items={items} onClick={onClick} />
          </div>
        )}
      </div>
    </header>
  );
}
