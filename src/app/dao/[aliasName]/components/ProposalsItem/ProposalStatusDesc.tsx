import { useMemo } from 'react';
import { TMRWCreateProposal } from '../../constants';
import { AllProposalStageString, AllProposalStatusString } from 'types';
import dayjs from 'dayjs';

export interface IProposalStatusDescProps {
  proposalItem: IProposalsItem;
}
/**
 * 
proposalStage: "Active" ：activeEndTime
proposalStage-> Pending & Challenged ? Veto : !veto.  proposalStatus=   executeStartTime. 
statge=Execute. ：Availabe to be executed before {executeEndTime}.

stage Finish
state=Finished && status=Approved: Approved on {activeEndTime}

state=Finished && status=reject.  xx on {activeEndTime}
state=Finished && status=anstanin  xx on {activeEndTime}

state=Finished && status=expired  xx on {executeEndTime}
state=Finished && status=Executed  Executed on {executeEndTime}

Expired. Insufficient voters/ In sufficient votes.
Vetoed on {24 Dec, 2023}.
Failed to be executed, expired on {24 December, 2023}.
 */
const dateFormat = 'MMM D, YYYY';
const getDate = (date: string) => (date ? dayjs(date).format(dateFormat) : '');
export default function ProposalStatusDesc(props: IProposalStatusDescProps) {
  const { proposalItem } = props;
  const { proposalStage, proposalSource, proposalStatus } = proposalItem;
  const text = useMemo(() => {
    if (proposalSource !== TMRWCreateProposal) {
      return '';
    }
    if (proposalStage === AllProposalStageString.Active) {
      return `Will expire on ${getDate(proposalItem.activeEndTime)}`;
    }
    if (proposalStage === AllProposalStageString.Pending) {
      if (proposalStatus === AllProposalStatusString.Challenged) {
        return `Being vetoed`;
      } else {
        return `Can be vetoed before ${getDate(proposalItem.executeStartTime)}`;
      }
    }
    if (proposalStage === AllProposalStageString.Execute) {
      return `Available for execution before ${getDate(proposalItem.executeEndTime)}`;
    }
    if (proposalStage === AllProposalStageString.Finished) {
      if (proposalStatus === AllProposalStatusString.Approved) {
        return `Approved on ${getDate(proposalItem.activeEndTime)}`;
      }
      if (proposalStatus === AllProposalStatusString.Rejected) {
        return `Rejected on ${getDate(proposalItem.activeEndTime)}`;
      }
      if (proposalStatus === AllProposalStatusString.Abstained) {
        return `Abstained on ${getDate(proposalItem.activeEndTime)}`;
      }
      if (proposalStatus === AllProposalStatusString.Expired) {
        return `Expired on ${getDate(proposalItem.activeEndTime)}`;
      }
      if (proposalStatus === AllProposalStatusString.Executed) {
        return `Executed. Executed on ${getDate(proposalItem.executeTime)}`;
      }
    }
  }, [proposalItem]);
  return <>{text}</>;
}
