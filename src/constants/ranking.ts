export enum RANKING_TYPE_KEY {
  TRENDING = 1,
  COMMUNITY = 2,
  TOP_BANNER = 3,
}

export const RANKING_TYPE = {
  [RANKING_TYPE_KEY.TRENDING]: 'Trending',
  [RANKING_TYPE_KEY.COMMUNITY]: 'Community',
  [RANKING_TYPE_KEY.TOP_BANNER]: 'Banner',
};

export enum RANKING_LABEL_KEY {
  NONE = 0,
  GOLD = 1,
  BLUE = 2,
}
