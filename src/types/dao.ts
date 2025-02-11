import { LINK_TYPE } from 'constants/dao';
import { ManipulateType } from 'dayjs';

export enum EMyDAOType {
  All = 0,
  Owned = 1,
  Participated = 2,
  Managed = 3,
}

export type SocialMedia = {
  [LINK_TYPE.TWITTER]?: string;
  [LINK_TYPE.FACEBOOK]?: string;
  [LINK_TYPE.DISCORD]?: string;
  [LINK_TYPE.GITHUB]?: string;
  [LINK_TYPE.TELEGRAM]?: string;
  [LINK_TYPE.REDDIT]?: string;
  [LINK_TYPE.OTHERS]?: string;
};

export type VoteTimeItem = {
  value: number;
  unit: ManipulateType;
  label: string;
};

export type Size = {
  width: number;
  height: number;
};
