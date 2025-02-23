/**
 * @file vote data
 * @author atom-yang
 */
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Button from "components/Button";
import VoteChart from "../../../_proposal_root/components/VoteChart";
import constants, {
  organizationInfoPropTypes,
} from "@redux/common/constants";

const { proposalStatus, proposalTypes } = constants;

const VoteData = (props) => {
  const {
    proposalType,
    status,
    approvals,
    rejections,
    abstentions,
    canVote,
    votedStatus,
    bpCount,
    handleApprove,
    handleReject,
    handleAbstain,
    expiredTime,
    organization,
  } = props;
  const [canThisUserVote, setCanThisVote] = useState(false);
  useEffect(() => {
    console.log(status, votedStatus, canVote);
    setCanThisVote(
      (status === proposalStatus.PENDING ||
        status === proposalStatus.APPROVED) &&
        votedStatus === "none" &&
        canVote
    );
  }, [status, votedStatus, expiredTime, canVote]);
  return (
    <>
      <VoteChart
        proposalType={proposalType}
        approvals={approvals}
        rejections={rejections}
        abstentions={abstentions}
        bpCount={bpCount}
        organizationInfo={organization}
      />
      <div className="flex justify-between items-center gap-[10px] mt-6">
        <Button
          type='primary'
          className="flex-1"
          disabled={!canThisUserVote}
          onClick={handleApprove}
          size='small'
        >
          Approve
        </Button>
        <Button
          type="danger"
          className="flex-1"
          disabled={!canThisUserVote}
          onClick={handleReject}
          size='small'
        >
          Reject
        </Button>
        <Button
          type="default"
          className="flex-1"
          disabled={!canThisUserVote}
          onClick={handleAbstain}
          size='small'
        >
          Abstain
        </Button>
      </div>
    </>
  );
};

VoteData.propTypes = {
  proposalType: PropTypes.oneOf(Object.values(proposalTypes)).isRequired,
  expiredTime: PropTypes.string.isRequired,
  status: PropTypes.oneOf(Object.values(proposalStatus)).isRequired,
  approvals: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    .isRequired,
  rejections: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    .isRequired,
  abstentions: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    .isRequired,
  canVote: PropTypes.bool.isRequired,
  votedStatus: PropTypes.oneOf(["none", "Approve", "Reject", "Abstain"])
    .isRequired,
  bpCount: PropTypes.number.isRequired,
  handleApprove: PropTypes.func.isRequired,
  handleReject: PropTypes.func.isRequired,
  handleAbstain: PropTypes.func.isRequired,
  organization: PropTypes.shape(organizationInfoPropTypes).isRequired,
};

export default VoteData;
