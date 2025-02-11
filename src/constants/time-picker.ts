import { VoteTimeItem } from 'types/dao';

export const HOUR_RANGE = Array.from({ length: 12 }, (_, i) => `${i + 1}`);

export const MINUTE_RANGE = Array.from({ length: 60 }, (_, i) => `${i < 10 ? '0' : ''}${i}`);

export const PERIOD_RANGE = ['AM', 'PM'];

export const DURATION_RANGE: VoteTimeItem[] = [
  {
    label: '1 Hour',
    unit: 'seconds',
    value: 3600,
  },
  {
    label: '1 Day',
    unit: 'seconds',
    value: 24 * 3600,
  },
  {
    label: '3 Day',
    unit: 'seconds',
    value: 3 * 24 * 3600,
  },
  {
    label: '5 Day',
    unit: 'seconds',
    value: 5 * 24 * 3600,
  },
  {
    label: '1 Week',
    unit: 'seconds',
    value: 7 * 24 * 3600,
  },
  {
    label: '2 Weeks',
    unit: 'seconds',
    value: 14 * 24 * 3600,
  },
];
