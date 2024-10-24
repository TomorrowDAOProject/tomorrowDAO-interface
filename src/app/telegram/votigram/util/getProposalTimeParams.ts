import * as proposalCreateType from 'pageComponents/proposal-create/type';
import dayjs from 'dayjs';
import { IActiveEndTimeDuration } from '../components/ActiveEndTime';
export const getProposalTimeParams = (
  startTime: proposalCreateType.ActiveStartTimeEnum | number,
  endTime: IActiveEndTimeDuration | number,
) => {
  let timeParams = {};
  const activeStartTime =
    startTime === proposalCreateType.ActiveStartTimeEnum.now ? Date.now() : startTime;
  const activeEndTime =
    typeof endTime === 'object'
      ? dayjs(activeStartTime).add(endTime.value, endTime.unit).valueOf()
      : endTime;
  // if start time is now, convert to period
  if (startTime === proposalCreateType.ActiveStartTimeEnum.now) {
    timeParams = {
      activeTimePeriod: Math.floor((activeEndTime - activeStartTime) / 1000),
      activeStartTime: 0,
      activeEndTime: 0,
    };
  } else {
    timeParams = {
      activeTimePeriod: 0,
      activeStartTime: Math.floor(activeStartTime / 1000),
      activeEndTime: Math.floor(activeEndTime / 1000),
    };
  }
  return timeParams;
};
