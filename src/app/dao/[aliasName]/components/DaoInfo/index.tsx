import { Collapse, HashAddress, Typography } from 'aelf-design';
import Image from 'next/image';
import { Divider, Descriptions, DescriptionsProps, Button } from 'antd';
import useResponsive from 'hooks/useResponsive';
import PreviewFile from 'components/PreviewFile';
import { Skeleton } from 'components/Skeleton';
import { colorfulSocialMediaIconMap } from 'assets/imgs/socialMediaIcon';
import settingSrc from 'assets/imgs/setting-icon.svg';
import DaoLogo from 'assets/imgs/dao-logo.svg';
import ErrorResult from 'components/ErrorResult';
import Link from 'next/link';
import { getExploreLink } from 'utils/common';
import { useChainSelect } from 'hooks/useChainSelect';
import './index.css';
import { curChain, daoAddress, NetworkDaoHomePathName } from 'config';
import { useWebLogin } from 'aelf-web-login';
import { useAsyncEffect } from 'ahooks';
import { callViewContract } from 'contract/callContract';
import { useState } from 'react';
import { EDaoGovernanceMechanism } from 'app/(createADao)/create/type';

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
interface IViewFileContract {
  data: Record<string, IFileInfo>;
}
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
  isError?: Error;
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
    daoId,
    aliasName,
  } = props;
  const { wallet } = useWebLogin();

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
                className="address"
                address={address as string}
                chain={curChain}
              ></HashAddress>
            </Link>
          </span>
        ),
      };
    })
    .filter(Boolean) as DescriptionsProps['items'];

  const items: DescriptionsProps['items'] | Array<null> = [
    !isNetworkDAO
      ? {
          key: '1',
          label: <span className="dao-collapse-panel-label">Creator</span>,
          children: (
            <span className="dao-collapse-panel-child">
              <HashAddress
                className="address"
                preLen={8}
                endLen={11}
                chain={curChain}
                address={data?.creator ?? '-'}
              ></HashAddress>
            </span>
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
                  className="dis-common-span"
                  onClick={() => {
                    if (isNetworkDAO) {
                      onChangeHCParams();
                    }
                  }}
                >
                  {data?.highCouncilMemberCount ?? '-'} Members,
                </span>
                {isNetworkDAO && (
                  <span>Rotates Every {data?.highCouncilConfig?.electionPeriod} Days.</span>
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
  ].filter(Boolean) as DescriptionsProps['items'];

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
            <div className="dao-detail-logo px-4 lg:px-8">
              <Image
                width={80}
                height={80}
                src={metadata?.logoUrl ?? DaoLogo}
                alt=""
                className="rounded-full logo-image"
              ></Image>
              <div className="flex">
                {wallet.address === data?.creator && (
                  <Link
                    href={
                      isNetworkDAO ? `${NetworkDaoHomePathName}/edit` : `/dao/${aliasName}/edit`
                    }
                    className="mr-[10px]"
                  >
                    <div className="flex items-center justify-center h-8 bg-Neutral-Default-BG px-2 leading-8 rounded-md cursor-pointer">
                      <Image width={14} height={14} src={settingSrc} alt=""></Image>
                      {!isSM && <span className="ml-1 text-neutralPrimaryText">Settings</span>}
                    </div>
                  </Link>
                )}

                <PreviewFile list={fileInfoList} />
              </div>
            </div>
            <div className="dao-detail-desc px-4 lg:px-8">
              <div>
                <h2 className="title">{metadata?.name}</h2>
                <p className="description">{metadata?.description}</p>
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
          <Divider className="mb-2 lg:mb-6" />
          <Collapse defaultActiveKey={isNetworkDAO ? [] : ['1']} ghost>
            <Collapse.Panel
              header={<h3 className="dao-collapse-panel">Dao Information</h3>}
              key="1"
            >
              <Descriptions
                layout={isLG ? 'vertical' : 'horizontal'}
                items={items}
                column={{ xs: 1, sm: 2, md: 2, lg: 2, xl: 2, xxl: 2 }}
              />
            </Collapse.Panel>
          </Collapse>
        </>
      )}
    </div>
  );
}
