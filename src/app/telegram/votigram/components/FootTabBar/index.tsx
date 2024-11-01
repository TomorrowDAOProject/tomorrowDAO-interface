import { CheckCircleOutlined, WalletOutlined } from '@aelf-design/icons';
import './index.css';
import clsx from 'clsx';
import { ReactComponent as Add } from 'assets/icons/add.svg';
import Fire from 'assets/imgs/fire.png';
import { ITabSource } from '../../type';
import { useEffect, useState } from 'react';
import { getRankings } from 'api/request';
import { curChain } from 'config';
import { RANKING_TYPE_KEY } from 'constants/ranking';
import Image from 'next/image';

export interface IFootTabBarProps {
  value: number;
  onChange: (value: number) => void;
  toggleNewListDrawerOpen: () => void;
}
const GiftIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.2204 3.00586C8.47821 3.00586 7.06586 4.41821 7.06586 6.16044C7.06586 6.76722 7.23717 7.33398 7.53407 7.815H5.38074C4.41424 7.815 3.63074 8.59851 3.63074 9.565V11.7501C3.63074 12.3024 4.07845 12.7501 4.63074 12.7501H5.00476V19.2444C5.00476 20.2109 5.78826 20.9944 6.75476 20.9944H18.4952C19.4617 20.9944 20.2452 20.2109 20.2452 19.2444V12.7501H20.6193C21.1716 12.7501 21.6193 12.3024 21.6193 11.7501V9.565C21.6193 8.5985 20.8358 7.815 19.8693 7.815H17.7159C18.0128 7.33398 18.1842 6.76722 18.1842 6.16044C18.1842 4.41821 16.7718 3.00586 15.0296 3.00586C14.0662 3.00586 13.2036 3.43773 12.625 4.11843C12.0464 3.43773 11.1838 3.00586 10.2204 3.00586ZM10.2099 9.315C10.2134 9.31501 10.2169 9.31502 10.2204 9.31502H11.875H12.625H12.625H13.375H15.0296C15.0331 9.31502 15.0366 9.31501 15.0401 9.315H19.8693C20.0074 9.315 20.1193 9.42693 20.1193 9.565V11.2501H5.13074V9.565C5.13074 9.42693 5.24267 9.315 5.38074 9.315H10.2099ZM15.0372 7.815C15.9475 7.8109 16.6842 7.0717 16.6842 6.16044C16.6842 5.24664 15.9434 4.50586 15.0296 4.50586C14.1178 4.50586 13.3783 5.24331 13.375 6.15427L13.375 6.16044V7.815H15.0372ZM11.875 7.815V6.16044L11.875 6.15427C11.8717 5.24331 11.1322 4.50586 10.2204 4.50586C9.30664 4.50586 8.56586 5.24664 8.56586 6.16044C8.56586 7.0717 9.30252 7.8109 10.2128 7.815H11.875ZM6.50476 19.2444C6.50476 19.3825 6.61669 19.4944 6.75476 19.4944H18.4952C18.6333 19.4944 18.7452 19.3825 18.7452 19.2444V12.7501H6.50476V19.2444Z"
        fill="currentColor"
      />
    </svg>
  );
};
const TaskIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="25"
      height="24"
      viewBox="0 0 25 24"
      fill="currentColor"
    >
      <path
        d="M9.26392 11.9167C8.8497 11.9167 8.51392 12.2525 8.51392 12.6667C8.51392 13.0809 8.8497 13.4167 9.26392 13.4167H15.4861C15.9004 13.4167 16.2361 13.0809 16.2361 12.6667C16.2361 12.2525 15.9004 11.9167 15.4861 11.9167H9.26392Z"
        fill="currentColor"
      />
      <path
        d="M8.51392 15.3333C8.51392 14.9191 8.8497 14.5833 9.26392 14.5833H12.375C12.7892 14.5833 13.125 14.9191 13.125 15.3333C13.125 15.7476 12.7892 16.0833 12.375 16.0833H9.26392C8.8497 16.0833 8.51392 15.7476 8.51392 15.3333Z"
        fill="currentColor"
      />
      <path
        d="M9.26392 8.91669C8.8497 8.91669 8.51392 9.25247 8.51392 9.66669C8.51392 10.0809 8.8497 10.4167 9.26392 10.4167H15.4861C15.9004 10.4167 16.2361 10.0809 16.2361 9.66669C16.2361 9.25247 15.9004 8.91669 15.4861 8.91669H9.26392Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.625 3.5C8.625 3.08579 8.96079 2.75 9.375 2.75H15.375C15.7892 2.75 16.125 3.08579 16.125 3.5V3.75H18.429C19.3209 3.75 20.0439 4.47301 20.0439 5.36486V19.6351C20.0439 20.527 19.3209 21.25 18.429 21.25H6.32092C5.42906 21.25 4.70605 20.527 4.70605 19.6351V5.36486C4.70605 4.473 5.42905 3.75 6.32092 3.75H8.625V3.5ZM16.125 6.07143V5.25H18.429C18.4925 5.25 18.5439 5.30142 18.5439 5.36486V19.6351C18.5439 19.6986 18.4925 19.75 18.429 19.75H6.32092C6.25747 19.75 6.20605 19.6986 6.20605 19.6351V5.36486C6.20605 5.30143 6.25748 5.25 6.32092 5.25H8.625V6.07143C8.625 6.48564 8.96079 6.82143 9.375 6.82143H15.375C15.7892 6.82143 16.125 6.48564 16.125 6.07143ZM10.125 4.25V5.32143H14.625V4.25H10.125Z"
        fill="currentColor"
      />
    </svg>
  );
};

const DiscoverIcon = () => (
  <svg
    width="25"
    height="24"
    viewBox="0 0 25 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M13.0255 12C13.0255 12.4974 12.6223 12.9005 12.125 12.9005C11.6276 12.9005 11.2244 12.4974 11.2244 12C11.2244 11.5026 11.6276 11.0995 12.125 11.0995C12.6223 11.0995 13.0255 11.5026 13.0255 12Z"
      fill="currentColor"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M16.6553 7.46966C16.8562 7.67053 16.9264 7.96766 16.8365 8.23716L14.8365 14.2372C14.7619 14.4611 14.5861 14.6369 14.3622 14.7115L8.36219 16.7115C8.09269 16.8013 7.79556 16.7312 7.59469 16.5303C7.39382 16.3294 7.32367 16.0323 7.41351 15.7628L9.41351 9.76282C9.48816 9.53887 9.6639 9.36313 9.88785 9.28848L15.8878 7.28848C16.1574 7.19864 16.4545 7.26879 16.6553 7.46966ZM10.7179 10.5929L9.31087 14.8141L13.5321 13.4071L14.9392 9.18584L10.7179 10.5929Z"
      fill="currentColor"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M2.375 12C2.375 6.61522 6.74022 2.25 12.125 2.25C17.5098 2.25 21.875 6.61522 21.875 12C21.875 17.3848 17.5098 21.75 12.125 21.75C6.74022 21.75 2.375 17.3848 2.375 12ZM12.125 3.75C7.56865 3.75 3.875 7.44365 3.875 12C3.875 16.5564 7.56865 20.25 12.125 20.25C16.6814 20.25 20.375 16.5564 20.375 12C20.375 7.44365 16.6814 3.75 12.125 3.75Z"
      fill="currentColor"
    />
  </svg>
);

const leftMenu = [
  {
    icon: <CheckCircleOutlined />,
    text: 'Vote',
    value: ITabSource.Rank,
  },
  {
    icon: <DiscoverIcon />,
    text: 'Discover',
    value: ITabSource.Discover,
  },
];

const rightMenu = [
  {
    icon: <TaskIcon />,
    text: 'Task',
    value: ITabSource.Task,
  },
  {
    icon: <GiftIcon />,
    text: 'Referral',
    value: ITabSource.Referral,
  },
];

export default function FootTabBar(props: IFootTabBarProps) {
  const { value, onChange, toggleNewListDrawerOpen } = props;
  const [bannerExist, setBannerExist] = useState(false);

  const fetchRankings = async (type: number, skipCount: number, maxResultCount: number) => {
    try {
      const result = await getRankings({
        chainId: curChain,
        type,
        skipCount,
        maxResultCount,
      });
      return {
        list: result?.data?.data || [],
        userTotalPoints: result?.data?.userTotalPoints || 0,
        hasMoreData: skipCount < result.data?.totalCount,
      };
    } catch (error) {
      console.error(`Failed to fetch rankings of type ${type}`, error);
      return {};
    }
  };

  const checkBanner = async () => {
    const result = await fetchRankings(RANKING_TYPE_KEY.TOP_BANNER, 0, 10);
    setBannerExist((result.list?.length ?? 0) > 0);
  };

  useEffect(() => {
    checkBanner();
  }, []);

  return (
    <ul className="foot-tabbar">
      {leftMenu.map((item, index) => (
        <li
          className={clsx('foot-tabbar-item relative', {
            active: item.value === value,
          })}
          key={index}
          onClick={() => {
            onChange(item.value);
          }}
        >
          {item.icon}
          <span>{item.text}</span>
          {bannerExist && item.value === ITabSource.Rank && (
            <Image
              className="animate-flash absolute top-[5px] right-[10px]"
              src={Fire}
              width={16}
              height={16}
              alt="Hot"
            />
          )}
        </li>
      ))}
      <li className="relative">
        <div
          onClick={toggleNewListDrawerOpen}
          className="mt-[-28px] rounded-full bg-[#5222D8] h-14 w-14 flex justify-center items-center"
        >
          <Add className="text-[32px] text-white" />
        </div>
      </li>
      {rightMenu.map((item, index) => (
        <li
          className={clsx('foot-tabbar-item', {
            active: item.value === value,
          })}
          key={index}
          onClick={() => {
            onChange(item.value);
          }}
        >
          {item.icon}
          <span>{item.text}</span>
        </li>
      ))}
    </ul>
  );
}
