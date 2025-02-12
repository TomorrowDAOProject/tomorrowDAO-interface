import Image from 'next/image';
import useResponsive from 'hooks/useResponsive';
import PreviewFile from 'components/PreviewFile';
import { Skeleton } from 'components/Skeleton';
import { colorfulSocialMediaIconMap } from 'assets/imgs/socialMediaIcon';
import DaoLogo from 'assets/imgs/dao-logo.svg';
import ErrorResult from 'components/ErrorResult';
import Link from 'next/link';
import { getExploreLink } from 'utils/common';
import { useChainSelect } from 'hooks/useChainSelect';
import './index.css';
import { curChain, explorer, NetworkDaoHomePathName } from 'config';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import { EDaoGovernanceMechanism } from 'app/(createADao)/create/type';
import ImageWithPlaceHolder from 'components/ImageWithPlaceHolder';
import HashAddress from 'components/HashAddress';

import { ReactComponent as ArrowDown } from 'assets/revamp-icon/arrow-down.svg';
import { ReactComponent as Settings } from 'assets/revamp-icon/settings.svg';

import { useState } from 'react';

const firstLetterToLowerCase = (str: string) => {
  return str.charAt(0).toLowerCase() + str.slice(1);
};
const colorfulSocialMediaIconMapKeys = Object.keys(colorfulSocialMediaIconMap).reduce(
  (acc, key) => ({
    ...acc,
    [firstLetterToLowerCase(key)]: (colorfulSocialMediaIconMap as Record<string, string>)[key],
  }),
  {},
);
const getSocialUrl = (key: string, val: string) => {
  if (key === 'twitter') {
    return `https://twitter.com/${val.includes('@') ? val.split('@')[1] : val}`;
  }
  return val;
};
interface IParams {
  data?: IDaoInfoData;
  onChangeHCParams: any;
  isLoading: boolean;
  isError?: boolean;
  daoId?: string;
  aliasName?: string;
}
const contractMapList = [
  {
    label: 'Treasury contract',
    key: 'treasuryContractAddress',
  },
  {
    label: 'Vote Contract',
    key: 'voteContractAddress',
  },
];
export default function DaoInfo(props: IParams) {
  const {
    data,
    data: { metadata, fileInfoList = [], isNetworkDAO } = {},
    isLoading,
    isError,
    onChangeHCParams,
    aliasName,
  } = props;
  const { walletInfo: wallet } = useConnectWallet();

  const { isLG, isSM } = useResponsive();
  const { isSideChain } = useChainSelect();
  const socialMedia = metadata?.socialMedia ?? {};

  const socialMediaList = Object.keys(socialMedia).map((key) => {
    return {
      name: firstLetterToLowerCase(key),
      url: socialMedia[key as keyof typeof socialMedia],
    };
  });
  const isTokenGovernanceMechanism = data?.governanceMechanism === EDaoGovernanceMechanism.Token;

  const contractItems = contractMapList
    .map((obj) => {
      const dataKey = obj.key;
      const address = data?.[dataKey as keyof IDaoInfoData];
      if (!address) return null;
      return {
        key: dataKey,
        label: <span className="dao-collapse-panel-label">{obj.label}</span>,
        children: (
          <span className="dao-collapse-panel-child">
            <Link href={getExploreLink(address as string, 'address')} target="_blank">
              <HashAddress
                preLen={8}
                endLen={11}
                className="address text-white hover:text-white"
                address={address as string}
                chain={curChain}
                size={'small'}
                primaryIconColor={'#989DA0'}
                addressHoverColor={'white'}
                addressActiveColor={'white'}
              ></HashAddress>
            </Link>
          </span>
        ),
      };
    })
    .filter(Boolean);

  const items = [
    !isNetworkDAO
      ? {
          key: '1',
          label: <span className="dao-collapse-panel-label">Creator</span>,
          children: (
            <a href={`${explorer}/address/${data?.creator}`} target="_blank" rel="noreferrer">
              <span className="dao-collapse-panel-child">
                <HashAddress
                  className="address text-white"
                  preLen={8}
                  endLen={11}
                  chain={curChain}
                  address={data?.creator ?? '-'}
                  primaryIconColor={'#989DA0'}
                  addressHoverColor={'white'}
                  addressActiveColor={'white'}
                ></HashAddress>
              </span>
            </a>
          ),
        }
      : null,
    ...(isNetworkDAO ? [] : contractItems ?? []),
    isTokenGovernanceMechanism
      ? {
          key: '3',
          label: <span className="dao-collapse-panel-label">Governance Token</span>,
          children: (
            <span className="dao-collapse-panel-child">{data?.governanceToken ?? '-'}</span>
          ),
        }
      : null,
    {
      key: '4',
      label: <span className="dao-collapse-panel-label">Governance Mechanism</span>,
      children: (
        <span className="dao-collapse-panel-child">{`Referendum ${
          data?.isHighCouncilEnabled ? ' + High Council' : ''
        } `}</span>
      ),
    },
    (isNetworkDAO && isSideChain) ||
    !isTokenGovernanceMechanism ||
    (isTokenGovernanceMechanism && !data?.isHighCouncilEnabled)
      ? null
      : {
          key: '5',
          label: <span className="dao-collapse-panel-label">High Council</span>,
          children: (
            <span className="dao-collapse-panel-child">
              <span className="dis-item">
                <span
                  className={isNetworkDAO ? 'dis-common-span-cursor' : 'dis-common-span'}
                  onClick={() => {
                    if (isNetworkDAO) {
                      onChangeHCParams();
                    }
                  }}
                >
                  {data?.highCouncilMemberCount ?? '-'} Members
                </span>
                {isNetworkDAO && (
                  <span>, Rotates Every {data?.highCouncilConfig?.electionPeriod} Days.</span>
                )}
              </span>
            </span>
          ),
        },
    isNetworkDAO
      ? null
      : {
          key: '6',
          label: <span className="dao-collapse-panel-label">Voting mechanism</span>,
          children: (
            <span className="dao-collapse-panel-child">
              {isTokenGovernanceMechanism ? 'Token-based' : 'Wallet-based'}
            </span>
          ),
        },
    // {
    //   key: '6',
    //   label: 'High Council Candidates',
    //   children: (
    //     <div className="dis-item">
    //       <span
    //         className="dis-common-span"
    //         onClick={() => {
    //           onChangeHCParams(HC_CANDIDATE);
    //         }}
    //       >
    //         {data?.candidateCount ?? '-'} Candidates
    //       </span>
    //     </div>
    //   ),
    // },
  ].filter(Boolean);

  const [activePanel, setActivePanel] = useState<boolean>(true);

  return (
    <div className="dao-detail-dis">
      {isLoading ? (
        <Skeleton />
      ) : isError ? (
        <div>
          <ErrorResult />
        </div>
      ) : (
        <>
          <div className="dao-basic-info">
            <div className="dao-detail-logo">
              <div className="dao-detail-logo-content">
                <ImageWithPlaceHolder
                  alias={aliasName ?? ''}
                  text={metadata?.name ?? ''}
                  src={metadata?.logoUrl ?? DaoLogo}
                  imageProps={{
                    width: 80,
                    height: 80,
                  }}
                />
              </div>
              <div className="flex xl:mt-[24px] lg:mt-[24px]">
                {wallet?.address === data?.creator && (
                  <Link
                    href={
                      isNetworkDAO ? `${NetworkDaoHomePathName}/edit` : `/dao/${aliasName}/edit`
                    }
                    className="mr-[10px]"
                  >
                    <div className="flex items-center justify-center bg-fillBg8 h-[32px] px-[14px] rounded-xl cursor-pointer gap-2">
                      <Settings />
                      {!isSM && (
                        <span className="text-lightGrey text-[12px] font-Montserrat">Settings</span>
                      )}
                    </div>
                  </Link>
                )}

                <PreviewFile list={fileInfoList} />
              </div>
            </div>
            <div className="dao-detail-desc">
              <div className="flex flex-col">
                <span className="title">{metadata?.name}</span>
                <span className="description">{metadata?.description}</span>
              </div>
              <div className="flex gap-4">
                {socialMediaList.map(
                  ({ name, url }, index) =>
                    url && (
                      <Link href={getSocialUrl(name, url)} target="_blank" key={index}>
                        <Image
                          src={(colorfulSocialMediaIconMapKeys as any)[name]}
                          className="social-media-item-logo"
                          alt="media"
                          width={16}
                          height={16}
                        />
                      </Link>
                    ),
                )}
              </div>
            </div>
          </div>
          <div className="h-0 w-full border-0 border-t border-solid border-fillBg8 my-[22px]"></div>
          <div>
            <div
              className="dao-collapse-panel flex items-center justify-between cursor-pointer"
              onClick={() => setActivePanel((preValue: boolean) => (preValue = !preValue))}
            >
              <span>Dao Information</span>
              <ArrowDown className={`transition-all ${activePanel ? 'rotate-180' : 'rotate-0'}`} />
            </div>
            {activePanel && (
              <div className="grid grid-cols-1 xl:grid-cols-2 lg:grid-cols-2 md:grid-cols-1 pt-[30px] gap-4">
                {items.map((list, index) => {
                  return (
                    <div
                      className="flex flex-col xl:flex-row lg:flex-row md:flex-row gap-[5px]"
                      key={list?.key || index}
                    >
                      <div className="text-lightGrey">{list?.label}:</div>
                      <div>{list?.children}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
