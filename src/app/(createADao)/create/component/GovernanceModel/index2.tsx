'use client';

import { Form } from 'antd';
import { memo, useContext } from 'react';
import InputSlideBind from 'components/InputSlideBind';
import { ApproveThresholdTip } from 'components/ApproveThresholdTip';
import {
  integerRule,
  min2maxIntegerRule,
  percentRule,
  useRegisterForm,
  validatorCreate,
} from '../utils';
import './index.css';
import { EDaoGovernanceMechanism, StepEnum, StepsContext } from '../../type';
import Tooltip from 'components/Tooltip';
import Input from 'components/Input';

import { ReactComponent as QuestionIcon } from 'assets/imgs/question-icon.svg';

const minimalApproveThresholdNamePath = 'minimalApproveThreshold';

const GovernanceModel = () => {
  const [form] = Form.useForm();
  const { stepForm } = useContext(StepsContext);
  const daoInfo = stepForm[StepEnum.step0].submitedRes;
  useRegisterForm(form, StepEnum.step1);
  const isMultisig = daoInfo?.governanceMechanism === EDaoGovernanceMechanism.Multisig;
  const minimalApproveThreshold = Form.useWatch(minimalApproveThresholdNamePath, form);
  return (
    <div className="governance-form">
      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
        requiredMark={false}
        scrollToFirstError={true}
      >
        {/* {isMultisig ? (
          <Form.Item
            name={'minimalRequiredThreshold'}
            label={
              <Tooltip
                title={
                  <div>
                    The minimum percentage of multisig member addresses required to participate in
                    voting on proposals.
                  </div>
                }
              >
                <span className="form-item-label">
                  Minimum Participation Rate
                  <InfoCircleOutlined className="cursor-pointer label-icon" />
                </span>
              </Tooltip>
            }
            initialValue={75}
            validateFirst={true}
            rules={percentRule}
          >
            <InputSlideBind type="approve" placeholder={''} />
          </Form.Item>
        ) : (
          <Form.Item
            name={'minimalRequiredThreshold'}
            label={
              <Tooltip title="The minimum number of voters (addresses) required to participate in voting on proposals, at least 1.">
                <span className="form-item-label">
                  Minimum Voter Requirement
                  <InfoCircleOutlined className="cursor-pointer label-icon" />
                </span>
              </Tooltip>
            }
            validateFirst={true}
            rules={[
              integerRule,
              validatorCreate((v) => v < 1, 'Please input a number not smaller than 1'),
              validatorCreate(
                (v) => v >= 100000000000,
                'Please input a number  not larger than 100,000,000,000',
              ),
            ]}
          >
            <InputNumber placeholder="Enter 1 or more" controls={false} />
          </Form.Item>
        )} */}

        {!isMultisig && (
          <Form.Item
            name={'minimalVoteThreshold'}
            label={
              <Tooltip
                title={
                  <div>
                    <div>
                      The minimum number of votes required to finalise a proposal, only applicable
                      to the voting mechanism where &quot;1 token = 1 vote&quot;.
                    </div>
                    <div>
                      Note: There are two types of voting mechanisms: &quot;1 token = 1 vote&quot;
                      and &quot;1 address = 1 vote&quot;. You can choose the voting mechanism when
                      you create the proposal.
                    </div>
                  </div>
                }
              >
                <span className="form-item-label">
                  Minimum Vote Requirement
                  <QuestionIcon className="cursor-pointer " width={16} height={16} />
                </span>
              </Tooltip>
            }
            validateFirst={true}
            rules={min2maxIntegerRule}
          >
            <Input placeholder="Enter a reasonable value" />
          </Form.Item>
        )}

        {/* approve rejection abstention */}
        <Form.Item
          name={minimalApproveThresholdNamePath}
          label={
            <Tooltip
              title={`The lowest percentage of approve votes required for a proposal to be approved.`}
            >
              <span className="form-item-label">
                Minimum Approval Rate
                <QuestionIcon className="cursor-pointer " width={16} height={16} />
              </span>
            </Tooltip>
          }
          extra={<ApproveThresholdTip percent={minimalApproveThreshold} />}
          initialValue={50}
          validateFirst={true}
          rules={percentRule}
        >
          <InputSlideBind
            type="approve"
            placeholder={'The suggested percentage is no less than 50%.'}
          />
        </Form.Item>

        {/* <Form.Item
          name={'maximalRejectionThreshold'}
          label={
            <Tooltip
              title={`The percentage of reject votes at which a proposal would be rejected. This is applicable to both voting mechanisms, where "1 token = 1 vote" or "1 address = 1 vote".
            Note: If the rejection threshold and other thresholds are met simultaneously, the proposal will be rejected. `}
            >
              <span className="form-item-label">
                Minimum Rejection Rate
                <InfoCircleOutlined className="cursor-pointer label-icon" />
              </span>
            </Tooltip>
          }
          initialValue={20}
          validateFirst={true}
          rules={percentRule}
        >
          <InputSlideBind
            type="rejection"
            placeholder={'The suggested percentage is no greater than 20%.'}
          />
        </Form.Item> */}
        {/* <Form.Item
          name={'maximalAbstentionThreshold'}
          label={
            <Tooltip
              title={`The percentage of abstain votes at which a proposal would be classified as abstained. This is applicable to both voting mechanisms, where "1 token = 1 vote" or "1 address = 1 vote".
            Note: If the abstain threshold and approval threshold are met simultaneously, the proposal will be classified as abstained. `}
            >
              <span className="form-item-label">
                Minimum Abstain Rate
                <InfoCircleOutlined className="cursor-pointer label-icon" />
              </span>
            </Tooltip>
          }
          initialValue={20}
          validateFirst={true}
          rules={percentRule}
        >
          <InputSlideBind
            type="abstention"
            placeholder={'The suggested percentage is no greater than 20%.'}
          />
        </Form.Item> */}
        {!isMultisig && (
          <Form.Item
            name={'proposalThreshold'}
            label={
              <Tooltip title="The minimum number of governance tokens a user must hold to initiate a proposal. Entering 0 means that a user can initiate a proposal without holding any governance tokens.">
                <span className="form-item-label">
                  Minimum Token Proposal Requirement
                  <QuestionIcon className="cursor-pointer " width={16} height={16} />
                </span>
              </Tooltip>
            }
            validateFirst={true}
            rules={[
              integerRule,
              validatorCreate((v) => v < 0, 'Please input a number not smaller than 0'),
              validatorCreate(
                (v) => v >= Number.MAX_SAFE_INTEGER,
                `Please input a number  not larger than ${Number.MAX_SAFE_INTEGER}`,
              ),
            ]}
          >
            <Input placeholder="Enter 0 or more" />
          </Form.Item>
        )}
      </Form>
    </div>
  );
};

export default memo(GovernanceModel);
