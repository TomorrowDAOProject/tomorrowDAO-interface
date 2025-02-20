'use client';
import { HeaderLogo } from 'components/Logo';
import './index.css';
import { PCMenu } from 'components/Menu';
import Select from 'components/Select';
import qs from 'query-string';
import Link from 'next/link';
import useResponsive from 'hooks/useResponsive';
import { MobileMenu } from 'components/Menu';
import { MenuProps } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { chainIdSelect } from 'config';
import dynamicReq from 'next/dynamic';
import LinkNetworkDao from 'components/LinkNetworkDao';
import { useChainSelect } from 'hooks/useChainSelect';
export enum ENetworkDaoNav {
  treasury = 'treasury',
  proposals = 'Proposals',
  organisations = 'Organisations',
  bpElections = 'BPElections',
  contractManagement = 'ContractManagement',
  resourceTokenTrade = 'ResourceTokenTrade',
  myProposals = 'MyProposals',
}
const pathnameMapKey: Record<string, ENetworkDaoNav> = {
  '/network-dao/treasury': ENetworkDaoNav.treasury,
  '/network-dao': ENetworkDaoNav.proposals,
  '/network-dao/organization': ENetworkDaoNav.organisations,
  '/network-dao/vote/election': ENetworkDaoNav.bpElections,
  '/network-dao/apply': ENetworkDaoNav.contractManagement,
  '/network-dao/resource': ENetworkDaoNav.resourceTokenTrade,
  '/network-dao/my-proposals': ENetworkDaoNav.myProposals,
};
const DynamicLogin = dynamicReq(() => import('components/Login'), {
  ssr: false,
});
export default function Header() {
  const [selectedChain, setSelectedChain] = useState('');
  const { isLG } = useResponsive();

  const pathname = usePathname();
  const { isMainChain } = useChainSelect();

  const items: MenuProps['items'] = useMemo(() => {
    return [
      isMainChain
        ? {
            label: <LinkNetworkDao href={`/treasury`}>Treasury</LinkNetworkDao>,
            key: ENetworkDaoNav.treasury,
          }
        : null,
      {
        label: <LinkNetworkDao href={`/`}>Proposals</LinkNetworkDao>,
        key: ENetworkDaoNav.proposals,
      },
      {
        label: <LinkNetworkDao href={`/organization`}>Organisations</LinkNetworkDao>,
        key: ENetworkDaoNav.organisations,
      },
      isMainChain
        ? {
            label: <LinkNetworkDao href={`/vote/election`}>BP Elections</LinkNetworkDao>,
            key: ENetworkDaoNav.bpElections,
          }
        : null,

      {
        label: <LinkNetworkDao href={`/apply`}>Contract Management</LinkNetworkDao>,
        key: ENetworkDaoNav.contractManagement,
      },

      isMainChain
        ? {
            label: <LinkNetworkDao href={`/resource`}>Resource Token Trade</LinkNetworkDao>,
            key: ENetworkDaoNav.resourceTokenTrade,
          }
        : null,

      {
        label: <LinkNetworkDao href={`/my-proposals`}>My Proposals</LinkNetworkDao>,
        key: ENetworkDaoNav.myProposals,
      },
    ];
  }, [isMainChain]);

  const [current, setCurrent] = useState('CreateDAO');

  const onClick: MenuProps['onClick'] = (e) => {
    setCurrent(e.key);
  };

  useEffect(() => {
    setCurrent(pathnameMapKey[pathname]);
  }, [pathname]);
  useEffect(() => {
    const searchParams = qs.parse(window.location.search);
    const chainId = (searchParams.chainId ?? 'AELF') as string;
    setSelectedChain(chainId);
  }, []);
  const handleChange = (obj: string | number) => {
    const url = new URL(window.location.protocol + window.location.host + `/network-dao`);
    url.searchParams.set('chainId', obj.toString());
    window.history.replaceState({}, '', url.toString());
    window.location.reload();
  };

  return (
    <header className="header-container networkdao-header-container">
      <div className="header-banner">
        <div className="header-logo">
          <div className="header-menu">
            <Link href="/">
              <HeaderLogo />
            </Link>
            {!isLG && (
              <PCMenu
                overflowedIndicatorPopupClassName="network-dao-menu-pop"
                selectedKeys={[current]}
                items={items}
                onClick={onClick}
              />
            )}
          </div>
          <div className="flex items-center">
            <div className="chain-id-select-wrap">
              <Select
                value={selectedChain}
                onChange={(val) => handleChange(val.value)}
                options={chainIdSelect.map((item) => {
                  return {
                    ...item,
                    label: item.label,
                  };
                })}
                className="!rounded-[42px] border-white h-[32px] w-[128px] px-[12px]"
              />
            </div>
            <DynamicLogin isNetWorkDao={true} />
          </div>
        </div>
        {isLG && (
          <div className="header-menu-icon">
            <MobileMenu selectedKeys={[current]} items={items} onClick={onClick} />
          </div>
        )}
      </div>
    </header>
  );
}
