'use client';

import { memo } from 'react';
// import InputSlideBind from 'components/InputSlideBind';
// import { ApproveThresholdTip } from 'components/ApproveThresholdTip';
// import {
//   integerRule,
//   min2maxIntegerRule,
//   percentRule,
//   useRegisterForm,
//   validatorCreate,
// } from '../utils';
// import { EDaoGovernanceMechanism, StepEnum, StepsContext } from '../../type';
import Tooltip from 'components/Tooltip';
import Input from 'components/Input';
import './index.css';

import { ReactComponent as QuestionIcon } from 'assets/imgs/questions-icon.svg';

// const minimalApproveThresholdNamePath = 'minimalApproveThreshold';

const GovernanceModel = () => {
  // const [form] = Form.useForm();
  // const { stepForm } = useContext(StepsContext);
  // const daoInfo = stepForm[StepEnum.step0].submitedRes;
  // useRegisterForm(form, StepEnum.step1);
  // const isMultisig = daoInfo?.governanceMechanism === EDaoGovernanceMechanism.Multisig;
  // const minimalApproveThreshold = Form.useWatch(minimalApproveThresholdNamePath, form);
  return (
    <div className="governance-form">
      <div className="form-list">
        <div className="form-item">
          <Tooltip
            title={
              <div>
                <div>
                  The minimum number of votes required to finalise a proposal, only applicable to
                  the voting mechanism where &quot;1 token = 1 vote&quot;.
                </div>
                <div>
                  Note: There are two types of voting mechanisms: &quot;1 token = 1 vote&quot; and
                  &quot;1 address = 1 vote&quot;. You can choose the voting mechanism when you
                  create the proposal.
                </div>
              </div>
            }
          >
            <span className="form-item-label flex gap-[8px]">
              <span className="form-item-label-text">Minimum Vote Requirement</span>
              <QuestionIcon className="cursor-pointer " width={18} height={18} />
            </span>
          </Tooltip>
          <div>
            <Input className="mt-[15px]" placeholder="At least 1 member required" />
          </div>
        </div>
        <div className="form-item">
          <Tooltip
            title={`The lowest percentage of approve votes required for a proposal to be approved.`}
          >
            <span className="form-item-label flex gap-[8px]">
              <span className="form-item-label-text">Minimum Approval Rate</span>
              <QuestionIcon className="cursor-pointer " width={18} height={18} />
            </span>
          </Tooltip>
          <Input className="mt-[8px]" placeholder="50%" />
          <Input className="mt-[15px]" placeholder="Enter a reasonable value" />
        </div>
        <div className="form-item">
          <Tooltip title="The minimum number of governance tokens a user must hold to initiate a proposal. Entering 0 means that a user can initiate a proposal without holding any governance tokens.">
            <span className="form-item-label flex gap-[8px]">
              <span className="form-item-label-text">Minimum Token Proposal Requirement</span>
              <QuestionIcon className="cursor-pointer " width={18} height={18} />
            </span>
          </Tooltip>
          <Input className="mt-[15px]" placeholder="Enter 0 or more" />
        </div>
      </div>
    </div>
  );
};

export default memo(GovernanceModel);
