import { Typography, FontWeightEnum, Progress } from 'aelf-design';
import MyInfo from 'app/dao/[aliasName]/components/MyInfo';
import BoxWrapper from './BoxWrapper';
import { memo, useEffect, useMemo } from 'react';
import { EVoteMechanismNameType } from 'pageComponents/proposal-create/type';
import { fetchDaoInfo } from 'api/request';
import { curChain } from 'config';
import { message } from 'antd';
import { useRequest } from 'ahooks';
import { EDaoGovernanceMechanism } from 'app/(createADao)/create/type';
import { useParams } from 'next/navigation';
import { SkeletonLine } from 'components/Skeleton';

interface IHeaderInfoProps {
  proposalDetailData?: IProposalDetailData;
  isDetailLoading?: boolean;
  daoId?: string;
}
interface VoteStaticDataProps {
  proposalDetailData?: IProposalDetailData;
  isDetailLoading?: boolean;
  governanceMechanism?: EDaoGovernanceMechanism;
}
const VoteStaticData = (props: VoteStaticDataProps) => {
  const { proposalDetailData, governanceMechanism, isDetailLoading } = props;
  const approvePercent = useMemo(() => {
    if (!proposalDetailData) {
      return 0;
    }
    return proposalDetailData?.votesAmount === 0
      ? 0
      : Math.floor((proposalDetailData.approvedCount / proposalDetailData.votesAmount) * 100);
  }, [proposalDetailData]);
  const abstainPercent = useMemo(() => {
    if (!proposalDetailData) {
      return 0;
    }
    return proposalDetailData.votesAmount === 0
      ? 0
      : Math.floor((proposalDetailData.abstentionCount / proposalDetailData.votesAmount) * 100);
  }, [proposalDetailData]);

  const rejectPercent = useMemo(() => {
    if (!proposalDetailData) {
      return 0;
    }
    return proposalDetailData.votesAmount === 0
      ? 0
      : Math.floor((proposalDetailData.rejectionCount / proposalDetailData.votesAmount) * 100);
  }, [proposalDetailData]);

  const is1t1v = proposalDetailData?.voteMechanismName === EVoteMechanismNameType.TokenBallot;
  return (
    <BoxWrapper className="lg:flex-1 lg:mr-[24px] order-last lg:order-first py-[25px] !px-[24px] flex flex-col justify-between">
      {!proposalDetailData ? (
        <div className="w-full h-full items-center flex">
          <SkeletonLine className="w-full" />
        </div>
      ) : (
        <>
          <div>
            <div className="text-[18px] font-[500] text-white">Current Votes</div>

            <div className="flex flex-col gap-8 pt-6">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <Typography.Text
                    className="text-Light-Mode-Brand-Brand"
                    fontWeight={FontWeightEnum.Medium}
                  >
                    Approved
                  </Typography.Text>
                  <Typography.Text className="text-Neutral-Secondary-Text">
                    {proposalDetailData?.approvedCount}
                    <span className="px-[4px]">Votes</span>
                    {approvePercent}%
                  </Typography.Text>
                </div>
                <Progress percent={approvePercent} strokeColor="#3888FF" />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <Typography.Text className="text-rejection" fontWeight={FontWeightEnum.Medium}>
                    Rejected
                  </Typography.Text>
                  <Typography.Text className="text-Neutral-Secondary-Text">
                    {proposalDetailData?.rejectionCount}
                    <span className="px-[4px]">Votes</span>
                    {rejectPercent}%
                  </Typography.Text>
                </div>
                <Progress percent={rejectPercent} strokeColor="#F55D6E" />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <Typography.Text className="text-abstention" fontWeight={FontWeightEnum.Medium}>
                    Abstained
                  </Typography.Text>
                  <Typography.Text className="text-Neutral-Secondary-Text">
                    {proposalDetailData?.abstentionCount}
                    <span className="px-[4px]">Votes</span> {abstainPercent}%
                  </Typography.Text>
                </div>
                <Progress percent={abstainPercent} strokeColor="#687083" />
              </div>
            </div>
          </div>

          <div className="votes-total-count border-0 border-solid border-Neutral-Divider flex flex-col pt-8 pb-4">
            <div>
              <Typography.Text fontWeight={FontWeightEnum.Medium} className="text-Primary-Text">
                <span className="pr-[4px]">{proposalDetailData?.votesAmount}</span>
                {proposalDetailData?.votesAmount > 1 ? 'Votes' : 'Vote'} in Total
              </Typography.Text>
            </div>
            {governanceMechanism === EDaoGovernanceMechanism.Token && (
              <div>
                <Typography.Text size="small" className="text-Neutral-Secondary-Text">
                  Minimum {is1t1v ? 'votes' : 'voter'} requirement met
                  <span className="px-[4px]">
                    {is1t1v ? (
                      <span>
                        {proposalDetailData?.votesAmount} /{' '}
                        {proposalDetailData?.minimalVoteThreshold}
                      </span>
                    ) : (
                      <span>
                        {proposalDetailData?.voterCount} /{' '}
                        {proposalDetailData?.minimalRequiredThreshold}
                      </span>
                    )}
                  </span>
                </Typography.Text>
              </div>
            )}
          </div>
        </>
      )}
    </BoxWrapper>
  );
};
const VoteInfo = (props: IHeaderInfoProps) => {
  const { proposalDetailData, isDetailLoading } = props;
  const { aliasName, proposalId } = useParams<{ aliasName: string; proposalId: string }>();
  const {
    data: daoData,
    error: daoError,
    loading: daoLoading,
  } = useRequest(async () => {
    if (!aliasName) {
      message.error('aliasName is required');
      return null;
    }
    return fetchDaoInfo({ alias: aliasName, chainId: curChain });
  });
  const isOnlyShowVoteOption =
    daoData?.data?.governanceMechanism === EDaoGovernanceMechanism.Multisig;
  return (
    <div className="flex justify-between flex-col lg:flex-row">
      <VoteStaticData
        proposalDetailData={proposalDetailData}
        governanceMechanism={daoData?.data?.governanceMechanism}
        isDetailLoading={isDetailLoading}
      />
      <MyInfo
        isOnlyShowVoteOption={isOnlyShowVoteOption}
        isExtraDataLoading={daoLoading}
        isShowVote={true}
        height={isOnlyShowVoteOption ? 'max-content' : 'auto'}
        titleNode={isOnlyShowVoteOption ? 'Vote' : 'My Info'}
        clssName="flex-1 grow-0 lg:basis-[439px] mb-[16px] lg:mb-0"
        daoId={proposalDetailData?.daoId}
        proposalId={proposalId}
        voteMechanismName={proposalDetailData?.voteMechanismName}
        notLoginTip={'Connect wallet to view your votes.'}
      />
    </div>
  );
};

export default memo(VoteInfo);
