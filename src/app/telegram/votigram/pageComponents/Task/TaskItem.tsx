import BigNumber from 'bignumber.js';
import { IStackItem, ITabSource, UserTaskDetail } from '../../type';
import { CheckOutlined, WalletOutlined } from '@aelf-design/icons';
import {
  TelegramIcon,
  UserAddIcon,
  XIcon,
  DiscardIcon,
  LoadingIcon,
  DailyTaskIcon,
  CreatePollIcon,
  SchrodingerIcon,
} from 'components/Icons';
import { useRef, useState } from 'react';
import { completeTaskItem } from 'api/request';
import { curChain } from 'config';
import VideoImage from 'assets/imgs/video.png';
import Image from 'next/image';

import './TaskItem.css';
import clsx from 'clsx';
import AdsGram, { IAdsGramRef } from '../../components/AdsGram';
import { useConfig } from 'components/CmsGlobalConfig/type';

interface ITaskItemProps {
  taskItem: IUserTaskItemDetail;
  activeTabItem: (item: IStackItem) => void;
  userTask: string;
  getTaskListFn: () => void;
  onReportComplete: (task: string, taskDetail: string) => void;
  toggleNewListDrawerOpen: () => void;
}

const openNewPageWaitPageVisible = async (
  url: string,
  taskId: UserTaskDetail,
  req: () => Promise<ICompleteTaskItemRes>,
) => {
  if (taskId === UserTaskDetail.ExploreJoinTgChannel) {
    // web.telegram.org will destroy the page when openTelegramLink
    // so send complete request before open link
    if (window?.Telegram?.WebApp?.platform === 'weba') {
      return req()
        .then(() => {
          window?.Telegram?.WebApp?.openTelegramLink?.(url);
          return true;
        })
        .catch(() => {
          window?.Telegram?.WebApp?.openTelegramLink?.(url);
          return false;
        });
    }
    window?.Telegram?.WebApp?.openTelegramLink?.(url);
  } else {
    window?.Telegram?.WebApp?.openLink?.(url);
  }
  return new Promise<boolean>((resolve) => {
    setTimeout(() => {
      if (document.visibilityState === 'visible') {
        setTimeout(() => {
          resolve(false);
        }, 2000);
      } else {
        const handleVisibilityChange = () => {
          if (document.visibilityState === 'visible') {
            resolve(false);
          }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
      }
    }, 200);
  });
};
const taskItemMap: Record<string, { icon: React.ReactNode; title: string; event?: Function }> = {
  [UserTaskDetail.DailyViewAds]: {
    icon: <Image src={VideoImage} alt="video" width={32} height={32} />,
    title: 'Watch ads',
  },
  [UserTaskDetail.DailyVote]: {
    icon: <DailyTaskIcon />,
    title: 'Complete a vote',
  },
  [UserTaskDetail.DailyFirstInvite]: {
    icon: <UserAddIcon />,
    title: 'Invite 1 friend',
  },
  [UserTaskDetail.DailyViewAsset]: {
    icon: <WalletOutlined />,
    title: 'View your assets',
  },
  [UserTaskDetail.DailyCreatePoll]: {
    icon: <CreatePollIcon />,
    title: 'Create your poll',
  },
  [UserTaskDetail.ExploreSchrodinger]: {
    icon: <SchrodingerIcon />,
    title: "Join Schrodinger's cat",
  },
  [UserTaskDetail.ExploreJoinVotigram]: {
    icon: <TelegramIcon />,
    title: 'Join Votigram channel',
  },
  [UserTaskDetail.ExploreFollowVotigramX]: {
    icon: <XIcon />,
    title: 'Follow Votigram on X',
  },
  [UserTaskDetail.ExploreForwardVotigramX]: {
    icon: <XIcon />,
    title: 'RT Votigram Post',
  },
  [UserTaskDetail.ExploreJoinTgChannel]: {
    icon: <TelegramIcon />,
    title: 'Join TMRWDAO channel',
  },
  [UserTaskDetail.ExploreFollowX]: {
    icon: <XIcon />,
    title: 'Follow TMRWDAO on X',
  },
  [UserTaskDetail.ExploreJoinDiscord]: {
    icon: <DiscardIcon />,
    title: 'Join Discord',
  },
  [UserTaskDetail.ExploreForwardX]: {
    icon: <XIcon />,
    title: 'RT TMRWDAO Post',
  },
  [UserTaskDetail.ExploreCumulateFiveInvite]: {
    icon: <UserAddIcon />,
    title: 'Invite 5 friends',
  },
  [UserTaskDetail.ExploreCumulateTenInvite]: {
    icon: <UserAddIcon />,
    title: 'Invite 10 friends',
  },
  [UserTaskDetail.ExploreCumulateTwentyInvite]: {
    icon: <UserAddIcon />,
    title: 'Invite 20 friends',
  },
};
const needShowTaskProgress: string[] = [
  UserTaskDetail.DailyViewAds,
  UserTaskDetail.ExploreCumulateFiveInvite,
  UserTaskDetail.ExploreCumulateTenInvite,
  UserTaskDetail.ExploreCumulateTwentyInvite,
];

export const TaskItem = (props: ITaskItemProps) => {
  const { retweetVotigramPostURL, retweetTmrwdaoPostURL } = useConfig() ?? {};

  const jumpExternalList = [
    {
      taskId: UserTaskDetail.ExploreJoinVotigram,
      url: 'https://t.me/votigram',
    },
    {
      taskId: UserTaskDetail.ExploreFollowVotigramX,
      url: 'https://x.com/votigram',
    },
    {
      taskId: UserTaskDetail.ExploreForwardVotigramX,
      url: retweetVotigramPostURL || '',
    },
    {
      taskId: UserTaskDetail.ExploreJoinTgChannel,
      url: 'https://t.me/tmrwdao',
    },
    {
      taskId: UserTaskDetail.ExploreFollowX,
      url: 'https://x.com/tmrwdao',
    },
    {
      taskId: UserTaskDetail.ExploreJoinDiscord,
      url: 'https://discord.com/invite/gTWkeR5pQB',
    },
    {
      taskId: UserTaskDetail.ExploreForwardX,
      url: retweetTmrwdaoPostURL || '',
    },
    {
      taskId: UserTaskDetail.ExploreSchrodinger,
      url: 'https://t.me/scat_game_bot/partner02?startapp=activityCode--A05',
    },
  ];
  const {
    taskItem,
    activeTabItem,
    userTask,
    onReportComplete,
    getTaskListFn,
    toggleNewListDrawerOpen,
  } = props;
  const [isLoading, setIsLoading] = useState(false);
  const adsGramRef = useRef<IAdsGramRef>(null);

  const activeTabWithSource = (target: number) => {
    activeTabItem({ path: target, source: ITabSource.Task });
  };
  const jumpAndRefresh = async (taskId: UserTaskDetail) => {
    try {
      const jumpItem = jumpExternalList.find((item) => item.taskId === taskItem.userTaskDetail);
      if (jumpItem) {
        const sendCompleteReq = () =>
          completeTaskItem({
            chainId: curChain,
            userTask: userTask,
            userTaskDetail: taskId,
          });
        const isComplete = await openNewPageWaitPageVisible(jumpItem.url, taskId, sendCompleteReq);
        if (isComplete) return;
        setIsLoading(true);
        const reportCompleteRes = await sendCompleteReq();
        if (reportCompleteRes.data) {
          onReportComplete(userTask, taskId);
        }
      }
    } catch (error) {
      //
    } finally {
      setIsLoading(false);
    }
  };
  const handleClick = async () => {
    if (isLoading || taskItem.complete) return;
    switch (taskItem.userTaskDetail) {
      case UserTaskDetail.DailyViewAds:
        adsGramRef?.current?.showAd();
        break;
      case UserTaskDetail.DailyVote:
        activeTabWithSource(ITabSource.Rank);
        break;
      case UserTaskDetail.DailyFirstInvite:
        activeTabWithSource(ITabSource.Referral);
        break;
      case UserTaskDetail.DailyViewAsset:
        activeTabWithSource(ITabSource.Asset);
        break;
      case UserTaskDetail.DailyCreatePoll:
        toggleNewListDrawerOpen();
        break;
      case UserTaskDetail.ExploreJoinVotigram:
      case UserTaskDetail.ExploreFollowVotigramX:
      case UserTaskDetail.ExploreForwardVotigramX:
      case UserTaskDetail.ExploreJoinTgChannel:
      case UserTaskDetail.ExploreFollowX:
      case UserTaskDetail.ExploreJoinDiscord:
      case UserTaskDetail.ExploreForwardX:
        await jumpAndRefresh(taskItem.userTaskDetail);
        break;
      case UserTaskDetail.ExploreCumulateFiveInvite:
      case UserTaskDetail.ExploreCumulateTenInvite:
      case UserTaskDetail.ExploreCumulateTwentyInvite:
        activeTabWithSource(ITabSource.Referral);
        break;
      default:
        break;
    }
  };
  return (
    <>
      <div
        className={clsx('task-item', {
          complete: taskItem.complete,
          dailyAds: UserTaskDetail.DailyViewAds === taskItem.userTaskDetail,
        })}
      >
        <div
          className={clsx('icon-wrap', {
            dailyAds: UserTaskDetail.DailyViewAds === taskItem.userTaskDetail,
          })}
        >
          {taskItemMap[taskItem.userTaskDetail]?.icon}
        </div>
        <div className="task-desc">
          <h3
            className={clsx('task-desc-title font-17-22', {
              dailyAds: UserTaskDetail.DailyViewAds === taskItem.userTaskDetail,
            })}
          >
            {taskItemMap[taskItem.userTaskDetail]?.title}

            {needShowTaskProgress.includes(taskItem.userTaskDetail) && (
              <span className="task-desc-progress pl-[4px]">
                (
                <span
                  className={clsx('text-[#F4AC33]', {
                    'text-[#F6692C]': UserTaskDetail.DailyViewAds === taskItem.userTaskDetail,
                  })}
                >
                  {taskItem.completeCount}
                </span>
                /{taskItem.taskCount})
              </span>
            )}
          </h3>
          <p
            className={clsx('task-desc-points font-14-18-weight', {
              dailyAds: UserTaskDetail.DailyViewAds === taskItem.userTaskDetail,
            })}
          >
            {UserTaskDetail.DailyViewAds === taskItem.userTaskDetail
              ? `+${BigNumber(taskItem.points).toFormat()} per ad`
              : `+${BigNumber(taskItem.points).toFormat()}`}
          </p>
        </div>
        <div
          className={clsx('task-button flex-center', {
            complete: taskItem.complete,
            dailyAds: UserTaskDetail.DailyViewAds === taskItem.userTaskDetail,
          })}
          onClick={handleClick}
        >
          {isLoading ? (
            <LoadingIcon className="animate-spin" />
          ) : taskItem.complete ? (
            <CheckOutlined />
          ) : (
            <span className="text font-14-18-weight font-bold">Start</span>
          )}
        </div>
      </div>
      <AdsGram
        ref={adsGramRef}
        onRewardModalClose={() => {
          getTaskListFn();
        }}
      />
    </>
  );
};
