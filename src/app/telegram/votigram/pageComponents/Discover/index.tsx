import { Button, TabsProps, Checkbox } from 'antd';
import { Tabs } from 'antd-mobile';
import { ETelegramAppCategory } from '../../type';
import './index.css';
import InfiniteList from './InfiniteList';
import { useAsyncEffect } from 'ahooks';
import { discoverConfirmChoose, getDiscoverAppView } from 'api/request';
import { curChain } from 'config';
import { useEffect, useRef, useState } from 'react';
import CommonDrawer, { ICommonDrawerRef } from '../../components/CommonDrawer';
import { useConfig } from 'components/CmsGlobalConfig/type';
import Image from 'next/image';

import Bubble from 'assets/imgs/bubble.png';
import Ecommerce from 'assets/imgs/ecommerce.png';
import Finance from 'assets/imgs/finance.png';
import Game from 'assets/imgs/game.png';
import Money from 'assets/imgs/money.png';
import Note from 'assets/imgs/note.png';
import Screw from 'assets/imgs/screw.png';
import Tick from 'assets/imgs/tick.png';
import Star from 'assets/imgs/star.png';

const items: TabsProps['items'] = [
  {
    key: ETelegramAppCategory.Recommend,
    label: 'Recommend',
    children: <InfiniteList category={ETelegramAppCategory.Recommend} />,
    icon: <Image src={Tick} width={14} height={14} alt="Recommend" />,
  },
  {
    key: ETelegramAppCategory.New,
    label: 'New',
    children: <InfiniteList category={ETelegramAppCategory.New} />,
    icon: <Image src={Star} width={14} height={14} alt="New" />,
  },
  {
    key: ETelegramAppCategory.Game,
    label: 'Game',
    children: <InfiniteList category={ETelegramAppCategory.Game} />,
    icon: <Image src={Game} width={14} height={14} alt="Game" />,
  },
  {
    key: ETelegramAppCategory.Earn,
    label: 'Earn',
    children: <InfiniteList category={ETelegramAppCategory.Earn} />,
    icon: <Image src={Money} width={14} height={14} alt="Earn" />,
  },
  {
    key: ETelegramAppCategory.Finance,
    label: 'Finance',
    children: <InfiniteList category={ETelegramAppCategory.Finance} />,
    icon: <Image src={Finance} width={14} height={14} alt="Finance" />,
  },
  {
    key: ETelegramAppCategory.Social,
    label: 'Social',
    children: <InfiniteList category={ETelegramAppCategory.Social} />,
    icon: <Image src={Bubble} width={14} height={14} alt="Social" />,
  },
  {
    key: ETelegramAppCategory.Utility,
    label: 'Utility',
    children: <InfiniteList category={ETelegramAppCategory.Utility} />,
    icon: <Image src={Screw} width={14} height={14} alt="Utility" />,
  },
  {
    key: ETelegramAppCategory.Information,
    label: 'Information',
    children: <InfiniteList category={ETelegramAppCategory.Information} />,
    icon: <Image src={Note} width={14} height={14} alt="Information" />,
  },
  {
    key: ETelegramAppCategory.Ecommerce,
    label: 'E-commerce',
    children: <InfiniteList category={ETelegramAppCategory.Ecommerce} />,
    icon: <Image src={Ecommerce} width={14} height={14} alt="Ecommerce" />,
  },
];
const options: {
  value: string;
  label: string;
}[] = [
  {
    value: ETelegramAppCategory.New,
    label: 'New',
  },
  {
    value: ETelegramAppCategory.Game,
    label: 'Game',
  },
  {
    value: ETelegramAppCategory.Earn,
    label: 'Earn',
  },
  {
    value: ETelegramAppCategory.Finance,
    label: 'Finance',
  },
  {
    value: ETelegramAppCategory.Social,
    label: 'Social',
  },
  {
    value: ETelegramAppCategory.Utility,
    label: 'Utility',
  },
  {
    value: ETelegramAppCategory.Information,
    label: 'Information',
  },
  {
    value: ETelegramAppCategory.Ecommerce,
    label: 'E-commerce',
  },
];
export default function Discover() {
  const { discoverTopBannerURL } = useConfig() ?? {};
  const chooseDrawerRef = useRef<ICommonDrawerRef>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
  const handleConfirmLike = async () => {
    try {
      await discoverConfirmChoose({
        chainId: curChain,
        choices: selectedCategory,
      });
    } finally {
      chooseDrawerRef.current?.close();
    }
  };
  const onSelectChange = (checkedValues: string[]) => {
    setSelectedCategory(checkedValues);
  };
  useAsyncEffect(async () => {
    const viewRes = await getDiscoverAppView({
      chainId: curChain,
    });
    if (!viewRes.data) {
      chooseDrawerRef.current?.open();
    }
  }, []);

  return (
    <div className="discover-page-wrap" ref={wrapRef}>
      <div className="flex relative mt-6">
        <Image
          src={discoverTopBannerURL || ''}
          className="rounded-lg w-full h-full"
          alt="banner"
          width={358}
          height={120}
        />
      </div>
      <Tabs defaultActiveKey={ETelegramAppCategory.Recommend} className="discover-page-tab">
        {items?.map((item) => {
          return (
            <Tabs.Tab
              title={
                <>
                  {item.icon}
                  <span className="ml-1">{item.label}</span>
                </>
              }
              key={item.key}
            >
              {item.children}
            </Tabs.Tab>
          );
        })}
      </Tabs>
      <CommonDrawer
        title="Choose your favourite category"
        ref={chooseDrawerRef}
        showCloseTarget={false}
        showLeftArrow={false}
        bodyClassname="discover-app-select-drawer"
        rootClassName="discover-app-select-drawer-root"
        drawerProps={{
          destroyOnClose: true,
        }}
        body={
          <div className="">
            <Checkbox.Group
              className="unset-check-box"
              options={options}
              value={selectedCategory}
              onChange={onSelectChange}
            />
            <Button
              type="primary"
              onClick={handleConfirmLike}
              disabled={selectedCategory.length === 0}
            >
              Confirm
            </Button>
            <div
              className="font-14-18-weight text-[#0395FF] mt-[16px] text-center"
              onClick={() => {
                chooseDrawerRef.current?.close();
              }}
            >
              Skip
            </div>
          </div>
        }
      />
    </div>
  );
}
