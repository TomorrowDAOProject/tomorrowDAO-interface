export interface IStartAppParams {
  pid?: string;
  referralCode?: string;
  source?: string;
}

export enum UserTask {
  Daily = 'Daily',
  Explore = 'Explore',
}

export enum UserTaskDetail {
  // Daily
  DailyViewAds = 'DailyViewAds',
  DailyVote = 'DailyVote',
  DailyFirstInvite = 'DailyFirstInvite',
  DailyViewAsset = 'DailyViewAsset',
  DailyCreatePoll = 'DailyCreatePoll',

  // Explore
  ExploreJoinVotigram = 'ExploreJoinVotigram',
  ExploreFollowVotigramX = 'ExploreFollowVotigramX',
  ExploreForwardVotigramX = 'ExploreForwardVotigramX',
  ExploreJoinTgChannel = 'ExploreJoinTgChannel',
  ExploreFollowX = 'ExploreFollowX',
  ExploreJoinDiscord = 'ExploreJoinDiscord',
  ExploreForwardX = 'ExploreForwardX',
  ExploreCumulateFiveInvite = 'ExploreCumulateFiveInvite',
  ExploreCumulateTenInvite = 'ExploreCumulateTenInvite',
  ExploreCumulateTwentyInvite = 'ExploreCumulateTwentyInvite',
  ExploreSchrodinger = 'ExploreSchrodinger',
}
export enum ITabSource {
  Rank = 0,
  Discover = 1,
  Task = 2,
  Referral = 3,
  Asset = 4,
}
export interface IStackItem {
  path: number;
  source?: ITabSource;
}

export enum IPonitType {
  TopInviter = 'TopInviter',
}
export enum ETelegramAppCategory {
  Recommend = 'Recommend',
  Game = 'Game',
  Earn = 'Earn',
  Finance = 'Finance',
  Social = 'Social',
  Utility = 'Utility',
  Information = 'Information',
  Ecommerce = 'Ecommerce',
  New = 'New',
}
