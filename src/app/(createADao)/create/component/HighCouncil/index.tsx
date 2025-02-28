'use client';

import { memo, useContext } from 'react';
import { useRegisterForm } from '../utils';
import { StepEnum, StepsContext } from '../../type';
import { curChain } from 'config/index';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import './index.css';
import { Controller, useForm } from 'react-hook-form';
import FormItem from 'components/FormItem';
import Tooltip from 'components/Tooltip';
import Input from 'components/Input';
import Slider from 'components/Slider';
import clsx from 'clsx';
import Button from 'components/Button';

const highCouncilMembers = 10000;
const HighCouncil = () => {
  const { walletInfo: wallet } = useConnectWallet();
  const form = useForm({
    defaultValues: {
      minimalVoteThreshold: '',
      governanceSchemeThreshold: {
        minimalApproveThreshold: '50',
      },
      highCouncilMembers: { value: [`ELF_${wallet?.address}_${curChain}`] },
    },
    mode: 'onChange',
  });
  const {
    watch,
    control,
    setValue,
    formState: { errors },
    trigger,
  } = form;
  const { stepForm, isShowHighCouncil } = useContext(StepsContext);
  useRegisterForm(form, StepEnum.step2);

  const metaData = stepForm[StepEnum.step0].submitedRes;
  const disabled = !metaData?.governanceToken;
  const membersValue = watch('highCouncilMembers.value') ?? [];

  return (
    <div className="high-council-form">
      {isShowHighCouncil && (
        <>
          <FormItem
            label={
              <Tooltip
                title={
                  <div className="text-[10px] leading-[12px]">
                    <div>
                      {`The minimum number of votes required to finalise a proposal, only applicable
                      to the voting mechanism where 1 token = 1 vote.`}
                    </div>
                    <div className="mt-2">
                      {`Note: There are two types of voting mechanisms: 1 token = 1 vote
                      and 1 address = 1 vote. You can choose the voting mechanism when
                      you create the proposal.`}
                    </div>
                  </div>
                }
              >
                <span className="form-item-label flex gap-[8px]">
                  <span className="form-item-label-text">Minimum Vote Requirement</span>
                  <i className="tmrwdao-icon-information text-[18px] text-lightGrey" />
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
                <Input
                  {...field}
                  disabled={disabled}
                  regExp={/^([0-9\b]*)$/}
                  placeholder="At least 1 member required"
                  isError={!!errors?.minimalVoteThreshold?.message}
                />
              )}
            />
          </FormItem>
          {/* approve rejection abstention */}

          <FormItem
            label={
              <Tooltip
                title={
                  <div className="text-[10px] leading-[12px]">
                    {`The lowest percentage of approve votes required for a proposal to be approved.
                    This is applicable to both voting mechanisms, where "1 token = 1 vote" or "1
                    address = 1 vote".`}
                  </div>
                }
              >
                <span className="form-item-label flex gap-[8px]">
                  <span className="form-item-label-text">Minimum Approval Rate</span>
                  <i className="tmrwdao-icon-information text-[18px] text-lightGrey" />
                </span>
              </Tooltip>
            }
            errorText={errors?.governanceSchemeThreshold?.minimalApproveThreshold?.message}
            // extra={<ApproveThresholdTip percent={minimalApproveThreshold} />}
          >
            <Controller
              name="governanceSchemeThreshold.minimalApproveThreshold"
              control={control}
              rules={{
                required: '',
                validate: {
                  validator: (value) => {
                    const num = Number(value);
                    if (isNaN(num) || !Number.isInteger(num) || num <= 0 || num > 100) {
                      return false;
                    }
                    return true;
                  },
                },
              }}
              render={({ field }) => {
                field.value = field.value.toString();
                return (
                  <div className="flex flex-col items-start lg:flex-row md:flex-row gap-[50px] mt-2">
                    <div className="w-full lg:w-2/5 md:w-2/5 relative">
                      <Input
                        {...field}
                        disabled={disabled}
                        className="font-Montserrat"
                        placeholder="The suggested percentage is no less than 67%."
                        regExp={/^([0-9\b]*)$/}
                        isError={Number(field.value) > 100 || Number(field.value) == 0}
                      />
                      <span className="font-Montserrat text-[16px] text-lightGrey absolute right-4 top-[14px]">
                        %
                      </span>
                      <span className="mt-[5px] block text-[11px] font-Montserrat leading-[17.6px] text-mainColor">
                        {isNaN(Number(field.value)) && `Please input a positive number`}
                        {!Number.isInteger(Number(field.value)) && 'Please input a integer number'}
                        {Number(field.value) == 0 &&
                          `Please input a number larger than 0 Proposals could be approved by a minority rather than a majoritty.`}
                        {Number(field.value) > 0 && Number(field.value) < 50 && (
                          <span className="text-lightGrey">
                            Proposals could be approved by a minority rather than a majority.
                          </span>
                        )}
                        {Number(field.value) >= 50 && Number(field.value) <= 100 && (
                          <span className="text-lightGrey">
                            Proposal will be approved by majority.
                          </span>
                        )}
                        {Number(field.value) > 100 &&
                          `Please input a number smaller than 100 Proposal will be approved by majority.`}
                      </span>
                    </div>
                    <Slider
                      className="w-full lg:w-3/5 md:w-3/5 xl:mt-[12px] md:mt-[12px] lg:mt-[12px] mt-0"
                      min={0}
                      max={100}
                      step={1}
                      disabled={disabled}
                      value={Number(field.value)}
                      onChange={field.onChange}
                    />
                  </div>
                );
              }}
            />
          </FormItem>

          <FormItem
            label={
              <Tooltip
                title={
                  <div className="text-[10px] leading-[12px]">
                    There is no limit on the number of addresses on your multisig. Addresses can
                    create proposals, create and approve transactions, and suggest changes to the
                    DAO settings after creation.
                  </div>
                }
              >
                <span className="flex items-center text-descM15 text-white font-Montserrat gap-[8px]">
                  High Council Members&apos; aelf Sidechain Address
                  <i className="tmrwdao-icon-information text-[18px] text-lightGrey" />
                </span>
              </Tooltip>
            }
            errorText={errors?.highCouncilMembers?.value?.message}
          >
            {membersValue.map((address, index) => (
              <Controller
                key={`${address}_${index}`}
                name="highCouncilMembers.value"
                control={control}
                rules={{
                  required: 'Address is required',
                  validate: {
                    validator: (value) => {
                      if (value.length > highCouncilMembers) {
                        return 'Initial high council members should not exceed number of high council members';
                      }
                      for (const info of value) {
                        if (info.endsWith(`AELF`)) {
                          return 'Must be a SideChain address';
                        }
                        if (!info.startsWith(`ELF`) || !info.endsWith(curChain)) {
                          return 'Must be a valid address';
                        }
                      }
                      return true;
                    },
                  },
                }}
                render={({ field }) => (
                  <div className="flex items-center mb-4">
                    <Input
                      value={address}
                      placeholder={`Enter ELF_..._${curChain}`}
                      onBlur={(value) => {
                        const newList = [...membersValue];
                        newList[index] = value;
                        field.onChange(newList);
                      }}
                      isError={
                        address.endsWith(`AELF`) ||
                        !address.startsWith(`ELF`) ||
                        !address.endsWith(curChain)
                      }
                    />
                    <i
                      className={clsx(
                        'tmrwdao-icon-circle-minus text-white text-[22px] ml-[6px] cursor-pointer',
                        {
                          '!text-darkGray': membersValue.length <= 1,
                        },
                      )}
                      onClick={() => {
                        if (membersValue.length <= 1) return;
                        const originList = [...membersValue];
                        originList.splice(index, 1);
                        field.onChange(originList);
                        trigger();
                      }}
                    />
                  </div>
                )}
              />
            ))}
            <div className="flex items-center gap-[9px]">
              <Button
                className="!py-[4px] !text-[12px]"
                type="default"
                onClick={() => {
                  const originList = [...membersValue, ''];
                  setValue('highCouncilMembers.value', originList);
                }}
              >
                <i className="tmrwdao-icon-circle-add text-[22px] mr-[6px]" />
                Add Address
              </Button>
              <Button
                className="!py-[4px] !text-[12px]"
                type="default"
                onClick={() => {
                  setValue('highCouncilMembers.value', ['']);
                  trigger();
                }}
              >
                <i className="tmrwdao-icon-delete text-[22px] mr-[6px]" />
                Delete All
              </Button>
            </div>
          </FormItem>
          <div className="mt-[32px] mb-[50px]">
            <div className="flex justify-between">
              <span className="flex items-center pb-[8px] justify-between text-descM15 text-white font-Montserrat">
                Total Addresses
              </span>
              <span className="text-descM16 text-white font-Montserrat">
                {membersValue?.length}
              </span>
            </div>
            <div className="text-descM12 font-Montserrat text-Neutral-Secondary-Text">
              Your connected wallet has been automatically added to the list. You can remove it if
              you&apos;d like.
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default memo(HighCouncil);
