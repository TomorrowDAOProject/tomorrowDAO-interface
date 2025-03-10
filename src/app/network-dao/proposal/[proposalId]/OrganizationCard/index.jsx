/**
 * @file desc list
 * @author atom-yang
 */
import React, { useMemo } from "react";
import PropTypes from "prop-types";
import {
  getOrganizationLeftInfo,
  getCircleValues,
} from "../../../organization/Organization/index";
import constants, {
  organizationInfoPropTypes,
} from "@redux/common/constants";
import addressFormat from "@utils/addressFormat";

const { proposalActions } = constants;

const OrganizationCard = (props) => {
  const {
    proposalType,
    bpCount,
    releaseThreshold,
    leftOrgInfo,
    orgAddress,
    bpList,
    parliamentProposerList,
  } = props;
  const thresholdValue = useMemo(
    () =>
      getCircleValues(
        proposalType,
        releaseThreshold,
        leftOrgInfo,
        bpCount || bpList.length
      ),
    [proposalType, releaseThreshold, leftOrgInfo, bpList]
  );
  const leftInfo = useMemo(
    () =>
      getOrganizationLeftInfo(
        proposalType,
        leftOrgInfo,
        bpList,
        parliamentProposerList,
        'lg:flex-row gap-[14px] lg:gap-[39px]',
        'flex flex-col gap-y-[10px] flex-1 lg:w-[calc((100%-39px)/2)]'
      ),
    [proposalType, leftOrgInfo, bpList, parliamentProposerList]
  );
  return (
    <>
      <h3 className="mb-6 text-descM13 text-white font-Montserrat">Organization Info</h3>
      <span className="mb-6 text-desc12 text-white font-Montserrat text-ellipsis whitespace-nowrap">
        <span className="text-lightGrey">Address:</span>
        {addressFormat(orgAddress)}
      </span>
      <div className="mb-[24px] flex flex-wrap justify-between gap-y-[14px]">
        <div
          className="mb-[10px] text-desc12 text-white font-Montserrat text-ellipsis whitespace-nowrap"
          title={`${thresholdValue[proposalActions.APPROVE].num}(${
            thresholdValue[proposalActions.APPROVE].rate
          })`}
        >
          <span className="text-lightGrey mr-[5px]">Minimal Approval Threshold:</span>
          {thresholdValue[proposalActions.APPROVE].num}(
          {thresholdValue[proposalActions.APPROVE].rate})
        </div>
        <div
          className="mb-[10px] text-desc12 text-white font-Montserrat text-ellipsis whitespace-nowrap"
          title={`${thresholdValue[proposalActions.REJECT].num}(${
            thresholdValue[proposalActions.REJECT].rate
          })`}
        >
          <span className="text-lightGrey mr-[5px]">Maximal Rejection Threshold:</span>  
          {thresholdValue[proposalActions.REJECT].num}(
          {thresholdValue[proposalActions.REJECT].rate})
        </div>
        <div
          className="mb-[10px] text-desc12 text-white font-Montserrat text-ellipsis whitespace-nowrap"
          title={`${thresholdValue[proposalActions.ABSTAIN].num}(${
            thresholdValue[proposalActions.ABSTAIN].rate
          })`}
        >
          <span className="text-lightGrey mr-[5px]">Maximal Abstention Threshold:</span>
          {thresholdValue[proposalActions.ABSTAIN].num}(
          {thresholdValue[proposalActions.ABSTAIN].rate})
        </div>
        <div
          className="text-desc12 text-white font-Montserrat text-ellipsis whitespace-nowrap"
          title={`${thresholdValue.Total.num}(${thresholdValue.Total.rate})`}
        >
          <span className="text-lightGrey mr-[5px]">Minimal Vote Threshold:</span>
          {thresholdValue.Total.num}({thresholdValue.Total.rate})
        </div>
      </div>

      {leftInfo}
    </>
  );
};

OrganizationCard.propTypes = {
  ...organizationInfoPropTypes,
  bpList: PropTypes.arrayOf(PropTypes.string).isRequired,
  parliamentProposerList: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default OrganizationCard;
