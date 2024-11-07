import clsx from 'clsx';
import MenuBg from 'assets/imgs/floating-menu-bg.png';
import { ITabSource } from '../../type';
import { useEffect, useState } from 'react';
import Image from 'next/image';

import { ReactComponent as Discover } from 'assets/icons/discover.svg';
import { ReactComponent as Task } from 'assets/icons/task.svg';
import { ReactComponent as Referral } from 'assets/icons/referral.svg';
import { ReactComponent as Plus } from 'assets/icons/plus.svg';
import { ReactComponent as Wallet } from 'assets/icons/wallet.svg';
import Hot from 'assets/imgs/hot.gif';

import './index.css';

export interface IFootTabBarProps {
  value: number;
  bannerCount: number;
  onChange: (value: number) => void;
  toggleNewListDrawerOpen: () => void;
}

const leftMenu = [
  {
    icon: <Image src={Hot} width={16} height={24} alt="hot" />,
    text: 'Vote',
    value: ITabSource.Rank,
  },
  {
    icon: <Discover className="text-[24px]" />,
    text: 'Discover',
    value: ITabSource.Discover,
  },
];

const rightMenu = [
  {
    icon: <Task className="text-[24px]" />,
    text: 'Task',
    value: ITabSource.Task,
  },
  {
    icon: <Referral className="text-[24px]" />,
    text: 'Referral',
    value: ITabSource.Referral,
  },
];

export default function FootTabBar(props: IFootTabBarProps) {
  const { value, onChange, toggleNewListDrawerOpen, bannerCount } = props;
  const [discoverCount, setDiscoverCount] = useState(bannerCount);

  useEffect(() => {
    setDiscoverCount(bannerCount);
  }, [bannerCount]);

  return (
    <div className="floating-menu-container">
      <Image src={MenuBg} width={320} height={80} alt="Menu Background" />
      <div className="flex absolute w-full h-full gap-[60px] px-3">
        <div className="flex flex-1 w-full h-full">
          {leftMenu.map((item) => (
            <div
              className={clsx(
                'flex flex-1 flex-col justify-center items-center gap-1 text-[#9A9A9A]',
                {
                  'text-white': item.value === value,
                  relative: item.value === ITabSource.Discover,
                },
              )}
              onClick={() => {
                onChange(item.value);
              }}
            >
              {item.icon}
              <span>{item.text}</span>
              {item.value === ITabSource.Discover && (
                <span className="absolute right-[5px] top-[13px] bg-[#B7142D] rounded-full p-1 text-[10px] text-white">
                  {discoverCount > 99 ? `${discoverCount}+` : discoverCount}
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="flex flex-1 w-full h-full">
          {rightMenu.map((item) => (
            <div
              className={clsx(
                'flex flex-1 flex-col justify-center items-center gap-1 text-[#9A9A9A]',
                {
                  'text-white': item.value === value,
                },
              )}
              onClick={() => {
                onChange(item.value);
              }}
            >
              {item.icon}
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
      <div
        onClick={toggleNewListDrawerOpen}
        className="absolute justify-center items-center flex bg-[#5222D8] rounded-full left-1/2 p-3.5 mt-[-18px] translate-x-[-50%]"
      >
        <Plus className="text-[24px] text-white" />
      </div>
      {value !== ITabSource.Asset && (
        <div
          className="wallet-entry-button"
          onClick={() => {
            onChange(ITabSource.Asset);
          }}
        >
          <Wallet className="text-[24px] text-white" />
        </div>
      )}
    </div>
  );
}
