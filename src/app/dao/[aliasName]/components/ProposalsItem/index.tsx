import { Divider, Space } from 'antd';
import { Typography, FontWeightEnum, HashAddress, Progress } from 'aelf-design';
import Image from 'next/image';
import WarningGrayIcon from 'assets/imgs/warning-gray.svg';
import CheckedIcon from 'assets/imgs/checked.svg';
import useResponsive from 'hooks/useResponsive';
import { tagColorMap } from '../../constants';
import DetailTag from 'components/DetailTag';
import { EVoteMechanismNameType } from 'pageComponents/proposal-create/type';
import capitalizeFirstLetter from 'utils/capitalizeFirstLetter';
import ProposalTag from './ProposalTag';
import ProposalStatusDesc from './ProposalStatusDesc';
import './index.css';
import { getProposalStatusText } from 'utils/proposal';
import { EDaoGovernanceMechanism } from 'app/(createADao)/create/type';

export interface IProposalsItemProps {
  data: IProposalsItem;
  governanceMechanism?: number;
}
type TagColorKey = keyof typeof tagColorMap;

export default function ProposalsItem(props: IProposalsItemProps) {
  const { data, governanceMechanism } = props;
  const { isLG } = useResponsive();

  const proposalStatus = data.proposalStatus as TagColorKey;

  const is1t1v = data.voteMechanismName === EVoteMechanismNameType.TokenBallot;

  const voteText = is1t1v ? 'votes' : 'voters';
  const voteTextPluralize = is1t1v
    ? data.votesAmount > 1
      ? 'votes'
      : 'vote'
    : data.voterCount > 1
    ? 'voters'
    : 'voter';

  const renderVoteInfo = (currentVote: number, requiredVote: number) => {
    return currentVote < requiredVote ? (
      <>
        <Image width={12} height={12} src={WarningGrayIcon} alt=""></Image>
        <div>
          Insufficient {voteText}: {currentVote}/{requiredVote}
        </div>
      </>
    ) : (
      <>
        <Image width={12} height={12} src={CheckedIcon} alt=""></Image>
        Minimum voting requirement met: {currentVote}/{requiredVote}
      </>
    );
  };
  return (
    <div className="proposal-item">
      <div className="proposal-item-left">
        <div>
          <DetailTag
            customStyle={{
              text: getProposalStatusText(proposalStatus),
              height: 20,
              color: tagColorMap[proposalStatus]?.textColor,
              bgColor: tagColorMap[proposalStatus]?.bgColor,
            }}
          />
          <Typography.Text
            className="proposal-item-time"
            size="small"
            fontWeight={FontWeightEnum.Regular}
          >
            <ProposalStatusDesc proposalItem={data} />
            {/* {getTimeDesc(proposalStatus, data)} */}
          </Typography.Text>
        </div>
        <div className="proposal-item-title normal-text-bold break-words">
          {data.proposalTitle ? (
            <span className="max-w-full">{data.proposalTitle}</span>
          ) : (
            <>
              Proposal ID: {data.proposalId}
              <HashAddress preLen={8} endLen={11} address={data.proposalId}></HashAddress>
            </>
          )}
        </div>
        <div>
          <Space>
            <ProposalTag
              governanceMechanism={data.governanceMechanism}
              proposalSource={data.proposalSource}
              proposalType={data.proposalType}
            />
          </Space>
        </div>
      </div>
      {isLG && <Divider></Divider>}

      <div className="vote vote-data-analysis flex flex-col justify-between">
        <div className="vote-top">
          <div className="h-[22px] vote-top-title normal-text-bold">
            {is1t1v ? data.votesAmount : data.voterCount} {capitalizeFirstLetter(voteTextPluralize)}{' '}
            in Total
          </div>
          {governanceMechanism === EDaoGovernanceMechanism.Token && (
            <div className="vote-dis text-[14px]">
              {is1t1v
                ? renderVoteInfo(data.votesAmount, data.minimalVoteThreshold)
                : renderVoteInfo(data.voterCount, data.minimalRequiredThreshold)}
            </div>
          )}
        </div>
        <div>{/* <CustomProgress data={data} /> */}</div>
      </div>
    </div>
  );
}

// function CustomProgress(props: { data: IProposalsItem }) {
//   const { data } = props;
//   const approvePercent =
//     data.votesAmount === 0 ? 0 : Math.floor((data.approvedCount / data.votesAmount) * 100);
//   const abstainPercent =
//     data.votesAmount === 0 ? 0 : Math.floor((data.abstentionCount / data.votesAmount) * 100);
//   const rejectPercent =
//     data.votesAmount === 0 ? 0 : Math.floor((data.rejectionCount / data.votesAmount) * 100);
//   return (
//     <>
//       <div className="flex leading-[18px] text-[12px]">
//         <div className="flex-1 text-approve">
//           <div className="font-medium">Approved</div>
//           <div>{approvePercent}%</div>
//         </div>
//         <div className="flex-1 text-abstention">
//           <div className="font-medium">Asbtained</div>
//           <div>{abstainPercent}%</div>
//         </div>
//         <div className="justify-self-end text-rejection">
//           <div className="font-medium">Rejected</div>
//           <div>{rejectPercent}%</div>
//         </div>
//       </div>
//       <Progress
//         trailColor="#F55D6E"
//         strokeColor="#687083"
//         percent={approvePercent + abstainPercent}
//         success={{ percent: approvePercent, strokeColor: '#3888FF' }}
//       />
//     </>
//   );
// }
