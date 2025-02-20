/**
 * @file vote chart
 * @author atom-yang
 */
import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Col, Row } from "antd";
import roundTo from "round-to";
import constants, { organizationInfoPropTypes } from "@redux/common/constants";
import Circle from "../Circle";
import "./index.css";

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
    <div className='proposal-vote pc'>
      <p className="proposal-vote-title">Voting Data: Votes <span>(Votes / Minimum Votes)</span></p>
      <Row  className='proposal-vote-chart'>
        <Col>
          <div className="proposal-vote-chart-wrap">
            <Circle
              className='proposal-vote-chart-circle'
              isInProgress
              type={proposalActions.APPROVE}
              {...votesData[proposalActions.APPROVE]}
            />
            <div
              className='text-ellipsis proposal-vote-chart-count'
              title={`${approvals}${votesData[proposalActions.APPROVE].rate}`}
            >
              <span className='sub-title'>{approvals}</span>
              <span>{votesData[proposalActions.APPROVE].rate}</span>
            </div>
          </div>
          <div className='proposal-vote-desc text-center'>
            <div className='text-ellipsis' title='Approved Votes'>
              Approved Votes
            </div>
          </div>
        </Col>
        <Col  >
          <div className="proposal-vote-chart-wrap">
            <Circle
              className='proposal-vote-chart-circle'
              isInProgress
              type={proposalActions.REJECT}
              {...votesData[proposalActions.REJECT]}
            />
            <div
              className='text-ellipsis proposal-vote-chart-count'
              title={`${rejections}(${votesData[proposalActions.REJECT].rate})`}
            >
              <span className='sub-title'>{rejections}</span>
              <span>{votesData[proposalActions.REJECT].rate}</span>
            </div>
          </div>
          <div className='proposal-vote-desc text-center'>
            <div className='text-ellipsis' title='Rejected Votes'>
              Rejected Votes
            </div>
          </div>
        </Col>
        <Col >
          <div className="proposal-vote-chart-wrap">
            <Circle
              className='proposal-vote-chart-circle'
              isInProgress
              type={proposalActions.ABSTAIN}
              {...votesData[proposalActions.ABSTAIN]}
            />
            <div
              className='text-ellipsis proposal-vote-chart-count'
              title={`${abstentions}(${votesData[proposalActions.ABSTAIN].rate
                })`}
            >
              <span className='sub-title'>{abstentions}</span>
              <span>{votesData[proposalActions.ABSTAIN].rate}</span>
            </div>
          </div>
          <div className='proposal-vote-desc text-center'>
            <div className='text-ellipsis' title='Abstained Votes'>
              Abstained Votes
            </div>
          </div>
        </Col>
        <Col >
          <div className="proposal-vote-chart-wrap">
            <Circle
              className='proposal-vote-chart-circle'
              isInProgress={proposalType !== proposalTypes.REFERENDUM}
              type='Total'
              {...votesData.Total}
            />
            <div
              className='text-ellipsis proposal-vote-chart-count'
              title={`${approvals + rejections + abstentions}(${votesData.Total.rate
                })`}
            >
              <span className='sub-title'>
                {approvals + rejections + abstentions}
              </span>
              <span>{votesData.Total.rate}</span>
            </div>
          </div>
          <div className='proposal-vote-desc text-center'>
            <div className='text-ellipsis' title='Total Votes'>
              Total Votes
            </div>
          </div>
        </Col>
      </Row>
      {/* <Row gutter={16} className="proposal-vote-chart-text">
        <Col span={6}>

        </Col>
        <Col span={6}>

        </Col>
        <Col span={6}>

        </Col>
        <Col span={6}>

        </Col>
      </Row> */}
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
