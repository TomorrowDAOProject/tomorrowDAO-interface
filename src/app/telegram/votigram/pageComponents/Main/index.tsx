import { useEffect, useRef, useState } from 'react';
import { TelegramPlatform } from '@portkey/did-ui-react';
import { parseStartAppParams } from '../../util/start-params';
import Assets from '../Assets';
import FootTabBar from '../../components/FootTabBar';
import Task from '../Task';
import Rankings, { IRankingsRef } from '../Rankings';
import Discover from '../Discover';
import Referral from '../Referral';
import { IStackItem, ITabSource } from '../../type';
import './index.css';
import { CreateVote } from '../CreateVote';
import Image from 'next/image';
import { useConfig } from 'components/CmsGlobalConfig/type';
import CommonDrawer, { ICommonDrawerRef } from '../../components/CommonDrawer';
import { getRankingBannerInfo, updateViewApp } from 'api/request';
import { curChain } from 'config';
import { InfiniteListRef } from '../Discover/InfiniteList';

export interface IMainProps {
  onShowMore?: (item: IRankingListResItem) => void;
}

export default function Main(props: IMainProps) {
  const [activeTabStack, setActiveTabStack] = useState<IStackItem[]>([{ path: ITabSource.Rank }]);
  const [bannerCount, setBannerCount] = useState(0);
  const { createVotePageTitle } = useConfig() ?? {};
  const createVoteDrawerRef = useRef<ICommonDrawerRef>(null);
  const infiniteListRef = useRef<InfiniteListRef>(null);

  const rankPageRef = useRef<IRankingsRef>(null);
  const activeTab = activeTabStack[activeTabStack.length - 1];
  const pushStackByValue = (value: number) => {
    setActiveTabStack([...activeTabStack, { path: value }]);
  };
  const activeTabItem = (item: IStackItem) => {
    setActiveTabStack([...activeTabStack, item]);
  };
  const isNotAssetPage = activeTab.path !== ITabSource.Asset;
  useEffect(() => {
    const startParam = TelegramPlatform.getInitData()?.start_param ?? '';
    const params = parseStartAppParams(startParam);
    if (params && params.pid) {
      rankPageRef.current?.openDetailWithProposalId(params.pid || '');
    }
  }, []);

  const toggleNewListDrawerOpen = () => {
    pushStackByValue(ITabSource.Rank);
    createVoteDrawerRef.current?.open();
  };

  const toggleNewListDrawerClose = () => {
    createVoteDrawerRef.current?.close();
  };

  const fetchRankingsBanner = async () => {
    try {
      const result = await getRankingBannerInfo({
        chainId: curChain,
      });
      setBannerCount(result?.data?.notViewedNewAppCount);
    } catch (error) {
      console.error('Failed to fetch ranking banner', error);
      return {};
    }
  };

  useEffect(() => {
    fetchRankingsBanner();
  }, []);

  const onBannerView = (alias: string) => {
    if (alias) {
      setBannerCount((prev) => {
        return prev - 1;
      });
      updateViewApp({
        chainId: curChain,
        aliases: [alias],
      });
    }
  };

  const onReloadClick = () => {
    document.body.scrollTop = 0;
    infiniteListRef.current?.listReload();
  };

  return (
    <>
      <div className="relative">
        {activeTab.path === ITabSource.Discover && (
          <Discover ref={infiniteListRef} bannerCount={bannerCount} onBannerView={onBannerView} />
        )}
        {activeTab.path === ITabSource.Rank && (
          <Rankings ref={rankPageRef} toggleNewListDrawerOpen={toggleNewListDrawerOpen} />
        )}
        <Task
          style={{
            display: activeTab.path === ITabSource.Task ? 'block' : 'none',
          }}
          show={activeTab.path === ITabSource.Task}
          activeTabItem={activeTabItem}
        />
        {activeTab.path === ITabSource.Referral && <Referral />}
        {activeTab.path === ITabSource.Asset && (
          <Assets
            redirect={false}
            onBack={() => {
              const lastItem = activeTabStack[activeTabStack.length - 2];
              if (lastItem) {
                pushStackByValue(lastItem.path);
              } else {
                pushStackByValue(0);
              }
            }}
          />
        )}

        <CommonDrawer
          title={
            <span>
              <Image
                src="/images/tg/magic-wand.png"
                width={20}
                height={20}
                alt="page-title"
                className="pr-1"
              />
              {createVotePageTitle}
            </span>
          }
          ref={createVoteDrawerRef}
          drawerProps={{
            destroyOnClose: true,
            placement: 'right',
            width: '100%',
            push: false,
          }}
          showCloseIcon={false}
          showLeftArrow
          rootClassName="create-vote-drawer-root"
          bodyClassname="create-vote-drawer"
          body={
            <div>
              <CreateVote closeCreateForm={toggleNewListDrawerClose} />
            </div>
          }
        />
      </div>
      {isNotAssetPage && typeof document.body !== 'undefined' && (
        <FootTabBar
          bannerCount={bannerCount}
          value={activeTab.path}
          toggleNewListDrawerOpen={toggleNewListDrawerOpen}
          onReloadClick={onReloadClick}
          onChange={(value: number) => {
            pushStackByValue(value);
          }}
        />
      )}
    </>
  );
}
