'use client';

import { Tooltip } from 'aelf-design';
import { Form, InputNumber } from 'antd';
import { memo, useContext, useEffect } from 'react';
import { InfoCircleOutlined } from '@aelf-design/icons';
import { ReactComponent as QuestionIcon } from 'assets/imgs/question-icon.svg';
import InputSlideBind from 'components/InputSlideBind';
import { min2maxIntegerRule, useRegisterForm, percentRule } from '../utils';
import FormMembersItem from 'components/FormMembersItem';
import { StepEnum, StepsContext } from '../../type';
import { curChain } from 'config/index';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import './index.css';
import { ApproveThresholdTip } from 'components/ApproveThresholdTip';

// const highCouncilMembersFieldName = ['highCouncilConfig', 'maxHighCouncilMemberCount'];
const highCouncilMembersList = ['highCouncilMembers', 'value'];
const minimalApproveThresholdNamePath = ['governanceSchemeThreshold', 'minimalApproveThreshold'];
const highCouncilMembers = 10000;
const HighCouncil = () => {
  const [form] = Form.useForm();
  // const daoCreateToken = useSelector((store) => store.daoCreate.token);
  const { stepForm, isShowHighCouncil } = useContext(StepsContext);
  useRegisterForm(form, StepEnum.step2);
  const { walletInfo: wallet } = useConnectWallet();

  const metaData = stepForm[StepEnum.step0].submitedRes;
  const disabled = !metaData?.governanceToken;
  const minimalApproveThreshold = Form.useWatch(minimalApproveThresholdNamePath, form);
  // const highCouncilMembers = Form.useWatch(highCouncilMembersFieldName, form);

  useEffect(() => {
    form.validateFields([highCouncilMembersList]).then(console.log).catch(console.log);
  }, [form]);
  return (
    <div className="high-council-form">
      {isShowHighCouncil && (
        <Form
          form={form}
          layout="vertical"
          autoComplete="off"
          requiredMark={false}
          scrollToFirstError={true}
        >
          {/* <div>
            <h2 className="form-title-primary cursor-pointer">
              High Council, a supplementary governance mechanism
            </h2>
            <p className="font-normal text-neutralPrimaryText text-[16px] leading-[24px] mb-[48px]">
              As an optional governance choice that supplements referendum, High Council consists of
              top-ranked addresses who stake governance tokens in the Election contract and receive
              votes. High Council members have the authority and responsibility in DAO governance.
            </p>
          </div> */}

          {/* <Form.Item
            label={
              <Tooltip title="The Election contract facilitates the election of High Council members. Users interested in becoming High Council members must stake a specified number of governance tokens in the contract to become eligible for election and receive votes from other addresses, with those accumulating more votes being elected as High Council members. If no user stake tokens in this contract, the DAO creator will automatically become a High Council member.">
                <span className="form-item-label">
                  Election Contract
                  <InfoCircleOutlined className="cursor-pointer label-icon" />
                </span>
              </Tooltip>
            }
          >
            <Input disabled defaultValue={`ELF_${electionContractAddress}_${curChain}`} />
          </Form.Item> */}

          {/* <Form.Item
            name={highCouncilMembersFieldName}
            label={
              <Tooltip
                title={`Users interested in becoming High Council members must stake a specified number of governance tokens to become eligible for election and receive votes from other addresses, with those accumulating more votes being elected as High Council members. The number of High Council members can be changed through proposals.`}
              >
                <span className="form-item-label">
                  Number of High Council Members
                  <InfoCircleOutlined className="cursor-pointer label-icon" />
                </span>
              </Tooltip>
            }
            validateFirst={true}
            rules={[
              {
                required: true,
                type: 'integer',
                min: 1,
                max: 10000,
                message: 'Please input a number between 1 and 10000, inclusive',
              },
            ]}
          >
            <InputNumber disabled={disabled} placeholder="Enter 1 or more" controls={false} />
          </Form.Item> */}
          {/* <Form.Item
            name={['highCouncilConfig', 'maxHighCouncilCandidateCount']}
            label={
              <Tooltip
                title={`Users who stake the required number of governance tokens but fail to accumulate enough votes to rank among the top addresses will become High Council candidates, maximum 10,000. The number of High Council candidates can be changed through proposals.`}
              >
                <span className="form-item-label">
                  Number of High Council Candidates
                  <InfoCircleOutlined className="cursor-pointer label-icon" />
                </span>
              </Tooltip>
            }
            validateFirst={true}
            rules={[
              {
                required: true,
                type: 'integer',
                min: 1,
                max: 10000,
                message: 'Please input a number between 1 and 10000, inclusive',
              },
            ]}
          >
            <InputNumber disabled={disabled} placeholder="Enter 10,000 or less" controls={false} />
          </Form.Item> */}
          {/* <Form.Item
            name={['highCouncilConfig', 'stakingAmount']}
            label={
              <Tooltip
                title={`The number of governance tokens that a user need to stake to become eligible for High Council election.`}
              >
                <span className="form-item-label">
                  Staking Requirement
                  <InfoCircleOutlined className="cursor-pointer label-icon" />
                </span>
              </Tooltip>
            }
            validateFirst={true}
            rules={[
              integerRule,
              validatorCreate((v) => v < 1, 'Please input a number larger than 1'),
              validatorCreate(
                (v) => v > Number(daoCreateToken?.totalSupply ?? 10000),
                'The number should not exceed the total supply of the token.',
              ),
            ]}
          >
            <InputNumber
              disabled={disabled}
              placeholder="Enter a reasonable value based on the circulation of the governance token."
              controls={false}
            />
          </Form.Item> */}
          {/* <Form.Item
            name={['highCouncilConfig', 'electionPeriod']}
            label={
              <Tooltip title="This is the duration, in days, for the rotation of High Council members. The countdown begins from the day when the DAO is created. Entering zero means that there is no rotation for High Council members.">
                <span className="form-item-label">
                  Rotation Term for High Council Members
                  <InfoCircleOutlined className="cursor-pointer label-icon" />
                </span>
              </Tooltip>
            }
            validateFirst={true}
            rules={[
              {
                required: true,
                type: 'integer',
                min: 0,
                max: Number.MAX_SAFE_INTEGER,
                message: `Please input a number between 0 ~ ${Number.MAX_SAFE_INTEGER}`,
              },
            ]}
          >
            <InputNumber
              disabled={disabled}
              placeholder="Enter the frequency at which High Council members rotate"
              controls={false}
              suffix="Days"
            />
          </Form.Item> */}
          {/* governanceSchemeThreshold */}
          {/* <Form.Item
            name={['governanceSchemeThreshold', 'minimalRequiredThreshold']}
            label={
              <Tooltip
                title={`The minimum percentage of High Council member addresses required to participate in voting on proposals.`}
              >
                <span className="form-item-label">
                  Minimum Participation Rate
                  <InfoCircleOutlined className="cursor-pointer label-icon" />
                </span>
              </Tooltip>
            }
            initialValue={75}
            validateFirst={true}
            rules={[
              integerRule,
              validatorCreate((v) => v < 75, 'Please input a number larger than 75'),
              validatorCreate((v) => v > 100, 'Please input a number smaller than 100'),
            ]}
          >
            <InputSlideBind
              disabled={disabled}
              type="approve"
              placeholder={'The suggested percentage is no less than 75%.'}
            />
          </Form.Item> */}

          <Form.Item
            name={['governanceSchemeThreshold', 'minimalVoteThreshold']}
            label={
              <Tooltip
                title={`The minimum number of votes required to finalise proposals, only applicable to the voting mechanism where "1 token = 1 vote".
            Note: There are two types of voting mechanisms: "1 token = 1 vote" and "1 address = 1 vote". You can choose the voting mechanism when you create the proposal.`}
              >
                <span className="form-item-label">
                  Minimum Vote Requirement
                  <InfoCircleOutlined className="cursor-pointer label-icon" />
                </span>
              </Tooltip>
            }
            validateFirst={true}
            rules={min2maxIntegerRule}
          >
            <InputNumber
              disabled={disabled}
              placeholder="Enter a reasonable value"
              controls={false}
            />
          </Form.Item>
          {/* approve rejection abstention */}

          <Form.Item
            name={['governanceSchemeThreshold', 'minimalApproveThreshold']}
            label={
              <Tooltip
                title={`The lowest percentage of approve votes required for a proposal to be approved. This is applicable to both voting mechanisms, where "1 token = 1 vote" or "1 address = 1 vote".`}
              >
                <span className="form-item-label">
                  Minimum Approval Rate
                  <InfoCircleOutlined className="cursor-pointer label-icon" />
                </span>
              </Tooltip>
            }
            extra={<ApproveThresholdTip percent={minimalApproveThreshold} />}
            initialValue={50}
            validateFirst={true}
            rules={percentRule}
          >
            <InputSlideBind
              disabled={disabled}
              type="approve"
              placeholder={'The suggested percentage is no less than 67%.'}
            />
          </Form.Item>
          {/* <Form.Item
            name={['governanceSchemeThreshold', 'maximalRejectionThreshold']}
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
            rules={[
              integerRule,
              validatorCreate((v) => v === 0, 'Please input a number larger than 0'),
              validatorCreate((v) => v > 20, 'Please input a number smaller than 20'),
            ]}
          >
            <InputSlideBind
              disabled={disabled}
              type="rejection"
              placeholder={'The suggested percentage is no greater than 20%.'}
            />
          </Form.Item> */}
          {/* <Form.Item
            name={['governanceSchemeThreshold', 'maximalAbstentionThreshold']}
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
            rules={[
              integerRule,
              validatorCreate((v) => v === 0, 'Please input a number larger than 0'),
              validatorCreate((v) => v > 20, 'Please input a number smaller than 20'),
            ]}
          >
            <InputSlideBind
              disabled={disabled}
              type="abstention"
              placeholder={'The suggested percentage is no greater than 20%.'}
            />
          </Form.Item> */}
          <FormMembersItem
            name={highCouncilMembersList}
            initialValue={[`ELF_${wallet?.address}_${curChain}`]}
            form={form}
            rules={[
              {
                validator: async (_, lists) => {
                  // const highCouncilMembers = form.getFieldValue(highCouncilMembersFieldName);
                  if (lists.length > highCouncilMembers) {
                    return Promise.reject(
                      new Error(
                        'Initial high council members should not exceed  number of high council members',
                      ),
                    );
                  }
                },
              },
            ]}
            titleNode={
              <Tooltip
                title={
                  <div>
                    There is no limit on the number of addresses on your multisig. Addresses can
                    create proposals, create and approve transactions, and suggest changes to the
                    DAO settings after creation.
                  </div>
                }
              >
                <span className="flex items-center form-item-title gap-[8px] pb-[8px]  w-[max-content]">
                  High Council Members&apos; aelf Sidechain Address
                  <QuestionIcon className="cursor-pointer " width={16} height={16} />
                </span>
              </Tooltip>
            }
          />
        </Form>
      )}
    </div>
  );
};

export default memo(HighCouncil);
