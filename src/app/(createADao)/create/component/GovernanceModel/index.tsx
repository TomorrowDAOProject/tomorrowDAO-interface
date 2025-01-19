'use client';

import { memo, useContext } from 'react';
import { ApproveThresholdTip } from 'components/ApproveThresholdTip';
import { useRegisterForm } from '../utils';

import { EDaoGovernanceMechanism, StepEnum, StepsContext } from '../../type';
import Tooltip from 'components/Tooltip';
import Input from 'components/Input';
import './index.css';

import { ReactComponent as QuestionIcon } from 'assets/imgs/questions-icon.svg';
import Slider from 'components/Slider';
import { Controller, useForm } from 'react-hook-form';
import FormItem from 'components/FormItem';

const GovernanceModel = () => {
  const form = useForm({
    defaultValues: {
      minimalVoteThreshold: '',
      minimalApproveThreshold: '50',
      proposalThreshold: '',
    },
  });
  const {
    control,
    formState: { errors },
  } = form;
  const { stepForm } = useContext(StepsContext);
  const daoInfo = stepForm[StepEnum.step0].submitedRes;
  useRegisterForm(form, StepEnum.step1);
  const isMultisig = daoInfo?.governanceMechanism === EDaoGovernanceMechanism.Multisig;

  return (
    <div className="governance-form">
      {!isMultisig && (
        <FormItem
          label={
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
                <i className="tmrwdao-icon-document text-[18px] text-white" />
              </span>
            </Tooltip>
          }
          errorText={errors?.minimalVoteThreshold?.message}
        >
          <Controller
            name="minimalVoteThreshold"
            control={control}
            rules={{
              required: 'The Minimum Vote is required',
              validate: {
                validator: (value) => {
                  const num = Number(value);
                  if (isNaN(num)) {
                    return 'Please input a positive number';
                  }
                  if (!Number.isInteger(num)) {
                    return 'Please input a integer number';
                  }
                  if (num < 1) {
                    return 'Please input a number not smaller than 1.';
                  }
                  if (num > Number.MAX_SAFE_INTEGER) {
                    return `Please input a number not larger than ${Number.MAX_SAFE_INTEGER}`;
                  }
                  return true;
                },
              },
            }}
            render={({ field }) => (
              <Input {...field} regExp={/^[0-9\b]+$/} placeholder="At least 1 member required" />
            )}
          />
        </FormItem>
      )}

      <FormItem
        label={
          <Tooltip
            title={`The lowest percentage of approve votes required for a proposal to be approved.`}
          >
            <span className="form-item-label flex gap-[8px]">
              <span className="form-item-label-text">Minimum Approval Rate</span>
              <i className="tmrwdao-icon-document text-[18px] text-white" />
            </span>
          </Tooltip>
        }
        errorText={errors?.minimalApproveThreshold?.message}
      >
        <Controller
          name="minimalApproveThreshold"
          control={control}
          rules={{
            required: 'The Minimum Approval Rate is required',
            validate: {
              validator: (value) => {
                const num = Number(value);
                if (isNaN(num)) {
                  return 'Please input a positive number';
                }
                if (!Number.isInteger(num)) {
                  return 'Please input a integer number';
                }
                if (num <= 0) {
                  return 'Please input a number larger than 0';
                }
                if (num > 100) {
                  return 'Please input a number smaller than 100';
                }
                return true;
              },
            },
          }}
          render={({ field }) => (
            <div className="flex flex-col items-center lg:flex-row md:flex-row gap-[50px] mt-2 ">
              <div className="w-full lg:w-2/5 md:w-2/5 relative">
                <Input
                  {...field}
                  className="font-Montserrat"
                  placeholder=" "
                  regExp={/^[0-9\b]+$/}
                />
                <span className="font-Montserrat text-[16px] text-lightGrey absolute right-4 top-[14px]">
                  %
                </span>
              </div>
              <Slider
                className="w-full lg:w-3/5 md:w-3/5"
                min={0}
                max={100}
                step={1}
                value={Number(field.value)}
                onChange={field.onChange}
              />
            </div>
          )}
        />
      </FormItem>

      {!isMultisig && (
        <FormItem
          label={
            <Tooltip title="The minimum number of governance tokens a user must hold to initiate a proposal. Entering 0 means that a user can initiate a proposal without holding any governance tokens.">
              <span className="form-item-label flex gap-[8px]">
                <span className="form-item-label-text">Minimum Token Proposal Requirement</span>
                <i className="tmrwdao-icon-document text-[18px] text-white" />
              </span>
            </Tooltip>
          }
          errorText={errors?.proposalThreshold?.message}
        >
          <Controller
            name="proposalThreshold"
            control={control}
            rules={{
              required: 'The Minimum Token Proposal is required',
              validate: {
                validator: (value) => {
                  const num = Number(value);
                  if (isNaN(num)) {
                    return 'Please input a positive number';
                  }
                  if (!Number.isInteger(num)) {
                    return 'Please input a integer number';
                  }
                  if (num < 0) {
                    return 'Please input a number not smaller than 0';
                  }
                  if (num > Number.MAX_SAFE_INTEGER) {
                    return `Please input a number not larger than ${Number.MAX_SAFE_INTEGER}`;
                  }
                  return true;
                },
              },
            }}
            render={({ field }) => (
              <Input {...field} regExp={/^[0-9\b]+$/} placeholder="Enter 0 or more" />
            )}
          />
        </FormItem>
      )}
    </div>
  );
};

export default memo(GovernanceModel);
