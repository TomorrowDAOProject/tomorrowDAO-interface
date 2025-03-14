import React from 'react';
import { curChain, explorer } from 'config';
import { SkeletonLine } from 'components/Skeleton';
import { ButtonCheckLogin } from 'components/ButtonCheckLogin';
import HashAddress from 'components/HashAddress';
import Link from 'next/link';
import './index.css';

import Button from 'components/Button';

interface IProps {
  lists: string[];
  isLoading: boolean;
  totalCount: number;
  loadMoreUrl: string;
  descriptionNode: React.ReactNode;
  cardTitle?: React.ReactNode;
  onCreatePoposal?: () => void;
  createButtonLoading?: boolean;
  managerUrl?: string;
}
const LoadCount = 5;

const Members: React.FC<IProps> = (props) => {
  const {
    lists,
    descriptionNode,
    isLoading,
    totalCount,
    loadMoreUrl,
    cardTitle = 'Members',
    onCreatePoposal,
    createButtonLoading,
    managerUrl,
  } = props;
  const ManageButton = (
    <Button
      className="dao-members-manage text-white hover:!border-mainColor hover:!text-mainColor hover:!bg-transparent"
      onClick={onCreatePoposal}
      loading={createButtonLoading}
    >
      Manage members
    </Button>
  );
  return (
    <div className={'dao-detail-card'}>
      {isLoading ? (
        <SkeletonLine />
      ) : (
        <div>
          <div className="text-white font-medium text-[18px] font-Montserrat mb-[20px]">
            {cardTitle}
          </div>
          <div className="flex justify-between items-start lg:items-center lg:flex-row flex-col">
            <div className="text-[15px] font-Montserrat">{descriptionNode}</div>
            {managerUrl ? (
              <Link href={managerUrl}>{ManageButton}</Link>
            ) : (
              <ButtonCheckLogin
                type="primary"
                className="dao-members-manage font-Montserrat hover:!bg-transparent hover:!text-mainColor hover:border hover:border-solid hover:border-mainColor"
                onClick={onCreatePoposal}
                loading={createButtonLoading}
              >
                Manage members
              </ButtonCheckLogin>
            )}
          </div>
          {!!lists?.length && (
            <ul className="dao-members-wrap mt-[24px]">
              {lists?.slice(0, 5)?.map((item, index) => {
                return (
                  <li className="dao-members-item" key={item}>
                    <Link href={`${explorer}/address/${item}`} target="_blank" className="w-full">
                      <HashAddress
                        className="text-white text-[14px] justify-between"
                        preLen={8}
                        endLen={11}
                        address={item}
                        chain={curChain}
                        iconColor="#989da0"
                        iconSize="18px"
                        primaryIconColor={'#989DA0'}
                        addressHoverColor={'white'}
                        addressActiveColor={'white'}
                      ></HashAddress>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          {(totalCount ?? 0) > LoadCount && (
            <div className="flex justify-center mt-[20px]">
              <Link href={loadMoreUrl}>
                <Button
                  size="medium"
                  className="dao-members-manage text-white border-white !bg-transparent !h-[40px]"
                >
                  <span className="text-[12px] font-medium">Load More</span>
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Members;
