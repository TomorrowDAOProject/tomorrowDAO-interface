import dayjs from 'dayjs';
import React, { FC, useEffect, useRef, useState } from 'react';

import CommonDrawer, { ICommonDrawerRef } from '../../../components/CommonDrawer';
import { ReactComponent as Info } from 'assets/icons/info.svg';
import { Button } from 'antd';
import { useUpdate } from 'ahooks';

interface IVotingPeriodProps {
  endDateTime: number | undefined;
  startDateTime: number | undefined;
  refreshVotingDetail: Function;
}

const VotingPeriod: FC<IVotingPeriodProps> = ({
  endDateTime,
  startDateTime,
  refreshVotingDetail,
}) => {
  const forceRender = useUpdate();
  const votingPeriodDrawerRef = useRef<ICommonDrawerRef>(null);
  const [endDateTimeCountDown, setEndDateTimeCountDown] = useState<number | undefined>(endDateTime);

  useEffect(() => {
    const timer = setInterval(() => {
      if (endDateTime) {
        const newCountdownValue = dayjs(endDateTime).diff(dayjs(), 'second');
        if (newCountdownValue < 0) {
          refreshVotingDetail?.();
          clearInterval(timer);
          return;
        }
        setEndDateTimeCountDown(newCountdownValue);
        forceRender();
        return;
      }
      clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, [endDateTimeCountDown, endDateTime]);

  const renderTimeLeft = (secondsLeft: number | undefined) => {
    const endDateObj = dayjs(endDateTime);
    const todayDateObj = dayjs();

    if (todayDateObj > endDateObj) {
      return 'Voting is over!';
    }

    if (secondsLeft === undefined) {
      return '-';
    }

    if (secondsLeft > 0) {
      if (secondsLeft <= 3600) {
        // Less than 1 hour
        return 'Less than 1 hour left to vote!';
      }

      if (secondsLeft > 3600 && secondsLeft <= 7200) {
        // 1 hour < secondsLeft < 2 hours
        return '1 hour left to vote';
      }

      if (secondsLeft > 7200 && secondsLeft <= 86400) {
        // 2 hour < secondsLeft < 1 day
        const daysDiff = endDateObj.diff(todayDateObj, 'hour');
        return `${daysDiff} hour left to vote!`;
      }

      if (secondsLeft > 86400 && secondsLeft <= 172800) {
        // 1 day < secondsLeft < 2 days
        return '1 day left to vote';
      }

      if (secondsLeft > 172800) {
        // secondsLeft > 2 days
        const daysDiff = endDateObj.diff(todayDateObj, 'day');
        return `${daysDiff} days left to vote!`;
      }
    }

    return 'Voting is over!';
  };

  return (
    <>
      <div className="flex flex-col text-right">
        <span className="text-[11px]">Vote period:</span>
        <div className="flex items-center justify-end gap-1">
          <span className="font-bold text-xs text-[#C9BAF3]">
            {renderTimeLeft(endDateTimeCountDown)}
          </span>
          <Info
            className="text-base text-[#C9BAF3]"
            onClick={() => {
              votingPeriodDrawerRef.current?.open();
            }}
          />
        </div>
      </div>
      <CommonDrawer
        title="Voting Period"
        ref={votingPeriodDrawerRef}
        body={
          <div className="flex flex-col items-center">
            <p className="font-14-18 mt-3 text-center">
              {`${dayjs(startDateTime || 0).format('YYYY.MM.DD HH:mm')} - ${dayjs(
                endDateTime || 0,
              ).format('YYYY.MM.DD HH:mm')}`}
            </p>
            <Button
              type="primary"
              onClick={() => {
                votingPeriodDrawerRef.current?.close();
              }}
            >
              Got it
            </Button>
          </div>
        }
      />
    </>
  );
};

export default VotingPeriod;
