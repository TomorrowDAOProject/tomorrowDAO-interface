import DAOListItem from 'components/DAOListItem';
import Link from 'next/link';
import { Empty } from 'antd';
import { fetchDaoList } from 'api/request';
import { curChain } from 'config';

import './index.css';
import LoadMoreButton from 'components/LoadMoreButton';
import { useEffect, useMemo, useState } from 'react';
import Button from 'components/Button';
import Spinner from 'components/Spinner';
import { useLandingPageResponsive } from 'hooks/useResponsive';

interface IDAOListProps {
  ssrData: {
    daoList: IDaoItem[];
    verifiedDaoList: IDaoItem[];
    daoHasData: boolean;
  };
}
export default function DAOList(props: IDAOListProps) {
  const { ssrData } = props;
  const { daoList, daoHasData, verifiedDaoList } = ssrData;
  const [renderList, setRenderList] = useState<IDaoItem[]>(daoList);
  const [hasData, setHasData] = useState(daoHasData);
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const { isPhone } = useLandingPageResponsive();
  const loadMore = async () => {
    setLoading(true);
    const res = await fetchDaoList({
      skipCount: renderList.length,
      maxResultCount: 6,
      chainId: curChain,
      daoType: 1,
    });
    setRenderList([...renderList, ...res.data.items]);
    setHasData(renderList.length + res.data.items.length < res.data.totalCount);
    setLoading(false);
  };

  const verifiedDaos = useMemo(
    () => verifiedDaoList?.slice(0, isPhone && !showAll ? 3 : verifiedDaoList.length) || [],
    [isPhone, showAll, verifiedDaoList],
  );

  return (
    <>
      <div className="col-12">
        <span className="font-Unbounded text-[15px] font-light text-white -tracking-[0.6px]">
          Verified DAOs
        </span>
      </div>
      {verifiedDaos.length > 0 ? (
        <>
          {verifiedDaos?.map((item) => {
            return (
              <div className="col-12 md:col-6" key={item.daoId}>
                <Link
                  href={item.isNetworkDAO ? `/network-dao` : `/dao/${item.alias}`}
                  prefetch={true}
                >
                  <DAOListItem item={item} />
                </Link>
              </div>
            );
          })}
        </>
      ) : (
        <Empty description="No Results found" className="mb-[30px]" />
      )}
      {isPhone && !showAll && verifiedDaos.length > 0 && (
        <div className="col-12 flex items-center justify-center">
          <Button
            type="link"
            className="!py-0 gap-2 !text-descM14"
            onClick={() => setShowAll(true)}
          >
            View More
          </Button>
        </div>
      )}
      <div className="col-12 mt-[50px]">
        <span className="font-Unbounded text-[15px] font-light text-white -tracking-[0.6px]">
          Community DAOs
        </span>
      </div>
      {renderList ? (
        <>
          {renderList?.map((item) => {
            return (
              <div className="col-12 md:col-6" key={item.daoId}>
                <Link
                  href={item.isNetworkDAO ? `/network-dao` : `/dao/${item.alias}`}
                  prefetch={true}
                >
                  <DAOListItem item={item} />
                </Link>
              </div>
            );
          })}
        </>
      ) : (
        <Empty description="No Results found" className="mb-[30px]" />
      )}
      {hasData && (
        <div className="col-12 flex items-center justify-center">
          <Button
            type="link"
            className="!py-0 gap-2 !text-descM14"
            onClick={loadMore}
            disabled={loading}
          >
            {loading && <Spinner size={32} />}
            View More
          </Button>
        </div>
      )}
    </>
  );
}
