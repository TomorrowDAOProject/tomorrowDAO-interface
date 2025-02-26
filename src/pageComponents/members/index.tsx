'use client';
import React from 'react';
import { Pagination, IPaginationProps } from 'aelf-design';
import { curChain, explorer } from 'config';
import { Button } from 'aelf-design';
import Link from 'next/link';
import useResponsive from 'hooks/useResponsive';
import './index.css';
import { SkeletonLine } from 'components/Skeleton';
import { ButtonCheckLogin } from 'components/ButtonCheckLogin';
import HashAddress from 'components/HashAddress';

interface ITreasuryDetailsProps {
  isLoading: boolean;
  totalCount: number;
  lists: string[];
  pagination: IPaginationProps;
  managerUrl?: string;
  onManageMembers?: () => void;
  manageLoading?: boolean;
}
export default function TreasuryDetails(props: ITreasuryDetailsProps) {
  const { isLoading, managerUrl, totalCount, lists, pagination, onManageMembers, manageLoading } =
    props;
  const { isLG } = useResponsive();
  const mobileProps = isLG
    ? {
        preLen: 8,
        endLen: 9,
      }
    : {};
  return (
    <div className="mx-[20px] my-[39px] md:w-[840px] lg:w-[1056px] xl:w-[1120px] md:m-auto lg:m-auto xl:m-auto xl:my-[70px] lg:my-[67px] md:my-[45px] min-h-[calc(100vh-300px)]">
      <div className="page-content-bg-border flex justify-between mb-[24px] lg:flex-row flex-col font-Montserrat">
        <div className="text-[20px] font-Unbounded font-[300] text-white !leading-normal">
          {totalCount} Members
        </div>
        {managerUrl ? (
          <Link href={managerUrl} className="lg:mt-0 mt-[24px]">
            <ButtonCheckLogin
              type="primary"
              size="medium"
              className="text-white font-Montserrat !rounded-[42px] border border-solid bg-mainColor hover:!text-mainColor hover:!bg-transparent hover:border-mainColor"
            >
              Manage members
            </ButtonCheckLogin>
          </Link>
        ) : (
          <ButtonCheckLogin
            type="primary"
            size="medium"
            onClick={onManageMembers}
            loading={manageLoading}
          >
            Manage members
          </ButtonCheckLogin>
        )}
      </div>
      <div className="page-content-bg-border px-0 py-0 members-lists">
        <div className="py-[17px] font-Unbounded text-white text-[15px] font-[300] px-[32px] border-0 border-b border-solid border-fillBg8">
          Address
        </div>
        <ul>
          {isLoading ? (
            <div className="members-padding">
              <SkeletonLine />
            </div>
          ) : (
            lists.map((item, index) => {
              return (
                <li key={item} className="members-lists-item members-padding">
                  <Link href={`${explorer}/address/${item}`} target="_blank">
                    <HashAddress
                      className="TMRWDAO-members-hash-address "
                      address={item}
                      {...mobileProps}
                      chain={curChain}
                      primaryIconColor={'#989DA0'}
                      addressHoverColor={'white'}
                      addressActiveColor={'white'}
                    />
                  </Link>
                </li>
              );
            })
          )}

          <div className="members-padding py-[24px]">
            <Pagination {...pagination}></Pagination>
          </div>
        </ul>
      </div>
    </div>
  );
}
