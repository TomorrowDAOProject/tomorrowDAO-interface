import dayjs from 'dayjs';
import { ActiveStartTimeEnum } from '../type';

export const getTimeMilliseconds = (
  startTime: ActiveStartTimeEnum | number,
  endTime: number[] | number,
) => {
  const activeStartTime = startTime === ActiveStartTimeEnum.now ? Date.now() : startTime;
  const duration = endTime;
  const activeEndTime = Array.isArray(duration)
    ? dayjs(activeStartTime)
        .add(duration[0], 'minutes')
        .add(duration[1], 'hours')
        .add(duration[2], 'days')
        .valueOf()
    : duration;
  return { activeStartTime, activeEndTime };
};
