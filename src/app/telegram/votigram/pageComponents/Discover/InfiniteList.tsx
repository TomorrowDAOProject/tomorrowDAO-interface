import { useInfiniteScroll } from 'ahooks';
import { getDiscoverAppList } from 'api/request';
import { curChain } from 'config';
import { forwardRef, useEffect, useImperativeHandle } from 'react';
import useInfiniteScrollUI from 'react-infinite-scroll-hook';
import Loading from '../../components/Loading';
import DiscoverItem from './DiscoverItem';
import { RefreshIcon } from 'components/Icons';
import { ETelegramAppCategory } from '../../type';
import clsx from 'clsx';

interface InfiniteListProps {
  category: string;
  onBannerView: (alias: string) => void;
}
const MaxResultCount = 10;

interface IFetchResult {
  list: IDiscoverAppItem[];
  hasData: boolean;
}

export interface InfiniteListRef {
  listReload: () => void;
}

const InfiniteList = forwardRef<InfiniteListRef, InfiniteListProps>((props, ref) => {
  const { category, onBannerView } = props;

  const fetchList: (data?: IFetchResult) => Promise<IFetchResult> = async (data) => {
    const preList = data?.list ?? [];
    const aliases =
      category === ETelegramAppCategory.Recommend ? preList.map((item) => item.alias) : undefined;
    const res = await getDiscoverAppList({
      category: category,
      chainId: curChain,
      skipCount: preList.length,
      maxResultCount: ETelegramAppCategory.New === category ? 100 : MaxResultCount,
      aliases,
    });
    const currentList = res?.data?.data ?? [];
    const len = currentList.length + preList.length;
    return {
      list: currentList,
      hasData: len < res.data?.totalCount,
    };
  };

  const {
    data: listData,
    loadingMore: listLoadingMore,
    loadMore: listLoadMore,
    loading: listLoading,
    reload: listReload,
    error,
  } = useInfiniteScroll(fetchList, { manual: true });

  const [sentryRef] = useInfiniteScrollUI({
    loading: listLoading,
    hasNextPage: Boolean(listData?.hasData),
    onLoadMore: listLoadMore,
    // When there is an error, we stop infinite loading.
    // It can be reactivated by setting "error" state as undefined.
    disabled: !!error,
    // `rootMargin` is passed to `IntersectionObserver`.
    // We can use it to trigger 'onLoadMore' when the sentry comes near to become
    // visible, instead of becoming fully visible on the screen.
    rootMargin: '0px 0px 400px 0px',
  });
  const isLoading = listLoading || listLoadingMore;

  useEffect(() => {
    listReload();
  }, []);

  useImperativeHandle(ref, () => ({
    listReload: listReload,
  }));

  return (
    <div>
      {listLoading
        ? null
        : listData?.list.map((appItem, index) => (
            <DiscoverItem
              category={category}
              onBannerView={onBannerView}
              item={appItem}
              key={index}
            />
          ))}
      <div ref={sentryRef} />

      {isLoading && (
        <div
          className={clsx('flex-center', {
            'init-loading-wrap': listLoading,
          })}
        >
          <Loading />
        </div>
      )}
      {!listData?.hasData && !isLoading && (
        <div className="font-14-18-weight reached-the-bottom text-[#6A6D79] text-center">
          You have reached the bottom of the page.
        </div>
      )}
      {/* <div
        className="text-white flex-center discover-app-list-refresh-icon"
        onClick={() => {
          document.body.scrollTop = 0;
          listReload();
        }}
      >
        <RefreshIcon />
      </div> */}
    </div>
  );
});

export default InfiniteList;
