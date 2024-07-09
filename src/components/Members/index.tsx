import React from 'react';
import { curChain, explorer } from 'config';
import { SkeletonLine } from 'components/Skeleton';
import { Button, HashAddress } from 'aelf-design';
import Link from 'next/link';
import './index.css';

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
      type="primary"
      size="medium"
      className="dao-members-manage"
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
          <h3 className="card-title mb-[24px]">{cardTitle}</h3>
          <div className="flex justify-between items-start lg:items-center lg:flex-row flex-col">
            <p>{descriptionNode}</p>
            {managerUrl ? <Link href={managerUrl}>{ManageButton}</Link> : ManageButton}
          </div>
          {!!lists?.length && (
            <ul className="dao-members-wrap mt-[24px]">
              {lists?.slice(0, 5)?.map((item) => {
                return (
                  <Link key={item} href={`${explorer}/address/${item}`} target="_blank">
                    <li className="dao-members-item">
                      <HashAddress
                        className="dao-members-normal-text TMRWDAO-members-hash-address"
                        preLen={8}
                        endLen={11}
                        address={item}
                        chain={curChain}
                      ></HashAddress>
                    </li>
                  </Link>
                );
              })}
            </ul>
          )}
          {(totalCount ?? 0) > LoadCount && (
            <div className="flex justify-center mt-[20px]">
              <Link href={loadMoreUrl}>
                <Button size="medium" className="dao-members-manage">
                  <span className="dao-members-normal-text font-medium">Load More</span>
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
