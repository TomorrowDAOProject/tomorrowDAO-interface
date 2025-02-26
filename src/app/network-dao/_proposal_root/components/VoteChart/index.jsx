/**
 * @file vote chart
 * @author atom-yang
 */
import React, { useMemo } from "react";
import PropTypes from "prop-types";
import Row from 'components/Grid/Row';
import Col from 'components/Grid/Col';
import roundTo from "round-to";
import constants, { organizationInfoPropTypes } from "@redux/common/constants";
import Circle from "../Circle";
import "./index.css";
import { useLandingPageResponsive } from "hooks/useResponsive";

const { proposalActions, proposalTypes } = constants;

function getRate(number, decimal = 2) {
  return roundTo(number * 100, decimal);
}

function getCircleValues(
  proposalType,
  { approvals, rejections, abstentions },
  organization,
  bpCount = 1
) {
  const abstractVoteTotal = 10000;
  const { releaseThreshold, leftOrgInfo } = organization;
  const {
    minimalApprovalThreshold,
    maximalRejectionThreshold,
    maximalAbstentionThreshold,
    minimalVoteThreshold,
  } = releaseThreshold;
  if (proposalType === proposalTypes.PARLIAMENT) {
    return {
      [proposalActions.APPROVE]: {
        value: (approvals / bpCount) * abstractVoteTotal,
        threshold: minimalApprovalThreshold,
        maxValue: abstractVoteTotal,
        rate: `${getRate(approvals / bpCount)}%`,
      },
      [proposalActions.REJECT]: {
        value: (rejections / bpCount) * abstractVoteTotal,
        threshold: maximalRejectionThreshold,
        maxValue: abstractVoteTotal,
        rate: `${getRate(rejections / bpCount)}%`,
      },
      [proposalActions.ABSTAIN]: {
        value: (abstentions / bpCount) * abstractVoteTotal,
        threshold: maximalAbstentionThreshold,
        maxValue: abstractVoteTotal,
        rate: `${getRate(abstentions / bpCount)}%`,
      },
      Total: {
        value:
          ((approvals + rejections + abstentions) / bpCount) *
          abstractVoteTotal,
        threshold: minimalVoteThreshold,
        maxValue: abstractVoteTotal,
        rate: `${getRate((approvals + rejections + abstentions) / bpCount)}%`,
      },
    };
  }
  let total;
  if (proposalType === proposalType.ASSOCIATION) {
    const {
      organizationMemberList: { organizationMembers },
    } = leftOrgInfo;
    total = organizationMembers.length;
  } else {
    total = minimalVoteThreshold;
  }
  const result = {
    [proposalActions.APPROVE]: {
      value: approvals,
      threshold: minimalApprovalThreshold,
      maxValue: total,
      rate: `${getRate(approvals / total)}%`,
    },
    [proposalActions.REJECT]: {
      value: rejections,
      threshold: maximalRejectionThreshold,
      maxValue: total,
      rate: `${getRate(rejections / total)}%`,
    },
    [proposalActions.ABSTAIN]: {
      value: abstentions,
      threshold: maximalAbstentionThreshold,
      maxValue: total,
      rate: `${getRate(abstentions / total)}%`,
    },
    Total: {
      value: approvals + rejections + abstentions,
      threshold: minimalVoteThreshold,
      maxValue: total,
      rate: `${getRate((approvals + rejections + abstentions) / total)}%`,
    },
  };
  return result;
}

const VoteChart = (props) => {
  const {
    organizationInfo,
    bpCount,
    proposalType,
    approvals,
    rejections,
    abstentions,
    size = 'default'
  } = props;
  const { isPad } = useLandingPageResponsive();
  const votesData = useMemo(() => {
    return getCircleValues(
      proposalType,
      {
        approvals,
        rejections,
        abstentions,
      },
      organizationInfo,
      bpCount
    );
  }, [proposalType, organizationInfo, bpCount]);

  return (
    <div className='pc'>
      <span className="block mb-5 text-descM12 text-white font-Montserrat">Voting Data: Votes <span>(Votes / Minimum Votes)</span></span>
      <Row gutter={43} className="!mx-0">
        <Col sm={12}  md={12} lg={6} className="!px-0">
          <div className="relative mx-auto w-[93px] h-[93px]">
            <Circle
              isInProgress
              type={proposalActions.APPROVE}
              {...votesData[proposalActions.APPROVE]}
            />
            <div
              className='absolute top-1/2 left-1/2 flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2'
              title={`${approvals}${votesData[proposalActions.APPROVE].rate}`}
            >
              <span className='text-[20px] font-light text-white font-Unbounded'>{approvals}</span>
              <span className='text-desc10 font-normal text-lightGrey font-Montserrat'>{votesData[proposalActions.APPROVE].rate}</span>
            </div>
          </div>
          <div className='flex items-center justify-center mt-[9px]'>
            <span className='text-ellipsis text-descM10 font-normal text-white font-Montserrat' title='Approved Votes'>
              Approved Votes
            </span>
          </div>
        </Col>
        <Col sm={12} md={12} lg={6} className="!px-0">
          <div className="relative mx-auto w-[93px] h-[93px]">
            <Circle
              isInProgress
              type={proposalActions.REJECT}
              {...votesData[proposalActions.REJECT]}
            />
            <div
              className='absolute top-1/2 left-1/2 flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2'
              title={`${rejections}(${votesData[proposalActions.REJECT].rate})`}
            >
              <span className='text-[20px] font-light text-white font-Unbounded'>{rejections}</span>
              <span className='text-desc10 font-normal text-lightGrey font-Montserrat'>{votesData[proposalActions.REJECT].rate}</span>
            </div>
          </div>
          <div className='flex items-center justify-center mt-[9px]'>
            <span className='text-ellipsis text-descM10 font-normal text-white font-Montserrat' title='Rejected Votes'>
              Rejected Votes
            </span>
          </div>
        </Col>
        <Col sm={12} md={12} lg={6} className="!px-0">
          <div className="relative mx-auto w-[93px] h-[93px]">
            <Circle
              isInProgress
              type={proposalActions.ABSTAIN}
              {...votesData[proposalActions.ABSTAIN]}
            />
            <div
              className='absolute top-1/2 left-1/2 flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2'
              title={`${abstentions}(${votesData[proposalActions.ABSTAIN].rate
                })`}
            >
              <span className='text-[20px] font-light text-white font-Unbounded'>{abstentions}</span>
              <span className='text-desc10 font-normal text-lightGrey font-Montserrat'>{votesData[proposalActions.ABSTAIN].rate}</span>
            </div>
          </div>
          <div className='flex items-center justify-center mt-[9px]'>
            <span className='text-ellipsis text-descM10 font-normal text-white font-Montserrat' title='Abstained Votes'>
              Abstained Votes
            </span>
          </div>
        </Col>
        <Col sm={12} md={12} lg={6} className="!px-0">
          <div className="relative mx-auto w-[93px] h-[93px]">
            <Circle
              isInProgress={proposalType !== proposalTypes.REFERENDUM}
              type='Total'
              {...votesData.Total}
            />
            <div
              className='absolute top-1/2 left-1/2 flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2'
              title={`${approvals + rejections + abstentions}(${votesData.Total.rate
                })`}
            >
              <span className='text-[20px] font-light text-white font-Unbounded'>
                {approvals + rejections + abstentions}
              </span>
              <span className='text-desc10 font-normal text-lightGrey font-Montserrat'>{votesData.Total.rate}</span>
            </div>
          </div>
          <div className='flex items-center justify-center mt-[9px]'>
            <span className='text-ellipsis text-descM10 font-normal text-white font-Montserrat' title='Total Votes'>
              Total Votes
            </span>
          </div>
        </Col>
      </Row>
    </div>
  );
};

VoteChart.propTypes = {
  proposalType: PropTypes.oneOf(Object.values(proposalTypes)).isRequired,
  approvals: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    .isRequired,
  rejections: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    .isRequired,
  abstentions: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    .isRequired,
  bpCount: PropTypes.number.isRequired,
  organizationInfo: PropTypes.shape(organizationInfoPropTypes).isRequired,
  size: PropTypes.oneOf(["small", "default", "large"]),
};

export default VoteChart;
