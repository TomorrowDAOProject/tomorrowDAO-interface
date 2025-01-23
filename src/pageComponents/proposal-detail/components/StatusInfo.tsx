import BoxWrapper from './BoxWrapper';
import { Typography, FontWeightEnum } from 'aelf-design';
import { Steps } from 'antd';
import { memo } from 'react';
import useResponsive from 'hooks/useResponsive';
import { AllProposalStatusString } from 'types';
import { getProposalStatusText } from 'utils/proposal';
import { ReactComponent as Published } from 'assets/revamp-icon/published.svg';
import { Span } from '@sentry/nextjs';

interface IStatusInfoProps {
  proposalDetailData?: IProposalDetailData;
}
const StatusInfo = (props: IStatusInfoProps) => {
  const { isLG } = useResponsive();
  const { proposalDetailData } = props;

  const stepItmes = proposalDetailData?.proposalLifeList?.map((item, index) => {
    const proposalStatus = item.proposalStatus as AllProposalStatusString;
    return (
      <>
        <div className="flex items-center gap-4">
          {index == 0 ? (
            <>
              <Published />
            </>
          ) : (
            <div className="bg-mainColor w-[30px] h-[30px] rounded-full flex items-center justify-center font-Montserrat text-[14px] font-[500] text-white">
              2
            </div>
          )}

          <div className="flex flex-col gap-[6px]">
            <div className="font-Montserrat text-[12px] text-lightGrey">{item.proposalStage}</div>
            <div className="font-[12px] font-Montserrat text-white">
              {getProposalStatusText(proposalStatus)}
            </div>
          </div>
        </div>
        {index == 0 && (
          <div className="h-0 w-[calc(100%-300px)] border border-t border-solid border-mainColor bg-mainColor"></div>
        )}
      </>
    );
  });

  return (
    <div className="border border-fillBg8 border-solid rounded-lg bg-darkBg px-[24px] py-[25px]">
      <div className="text-[18px] font-[500] font-Montserrat text-white mb-[20px]">Status</div>
      <div className="flex items-center justify-between">
        {stepItmes}
        {/* <Steps
          current={stepItmes?.length ? stepItmes?.length - 1 : 0}
          items={stepItmes}
          labelPlacement={isLG ? 'vertical' : 'horizontal'}
          className="font-Montserrat"
        /> */}
      </div>
    </div>
  );
};
export default memo(StatusInfo);
