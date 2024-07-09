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
  managerUrl: string;
  loadMoreUrl: string;
  descriptionNode: React.ReactNode;
}
const LoadCount = 5;

const Members: React.FC<IProps> = (props) => {
  const { lists, descriptionNode, isLoading, managerUrl, totalCount, loadMoreUrl } = props;
  return (
    <div className={'dao-detail-card'}>
      {isLoading ? (
        <SkeletonLine />
      ) : (
        <div>
          <h3 className="card-title mb-[24px]">Members</h3>
          <div className="flex justify-between items-start lg:items-center lg:flex-row flex-col">
            <p>{descriptionNode}</p>
            <Link href={managerUrl}>
              <Button type="primary" size="medium" className="dao-members-manage">
                Manage members
              </Button>
            </Link>
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
