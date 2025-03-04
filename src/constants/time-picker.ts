import { VoteTimeItem } from 'types/dao';

export const HOUR_RANGE = Array.from({ length: 12 }, (_, i) => `${i + 1}`);

export const MINUTE_RANGE = Array.from({ length: 60 }, (_, i) => `${i < 10 ? '0' : ''}${i}`);

export const PERIOD_RANGE = ['AM', 'PM'];

export const DURATION_RANGE: VoteTimeItem[] = [
  {
    label: '1 Hour',
    unit: 'hours',
    value: 1,
  },
  {
    label: '1 Day',
    unit: 'hours',
    value: 24,
  },
  {
    label: '3 Day',
    unit: 'days',
    value: 3,
  },
  {
    label: '5 Day',
    unit: 'days',
    value: 5,
  },
  {
    label: '1 Week',
    unit: 'days',
    value: 7,
  },
  {
    label: '2 Weeks',
    unit: 'days',
    value: 14,
  },
];
