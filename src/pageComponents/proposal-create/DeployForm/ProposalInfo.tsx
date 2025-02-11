'use client';

import { InfoCircleOutlined } from '@aelf-design/icons';
import { memo, useMemo, useState } from 'react';
import { ResponsiveSelect } from 'components/ResponsiveSelect';
import MarkdownEditor from 'components/MarkdownEditor';
import { ReactComponent as ArrowIcon } from 'assets/imgs/arrow-icon.svg';
import { ContractMethodType, ProposalType, proposalTypeList } from 'types';
import { fetchGovernanceMechanismList } from 'api/request';
import { curChain } from 'config';
import { useAsyncEffect } from 'ahooks';
import { GetDaoProposalTimePeriodContract } from 'contract/callContract';
import dayjs from 'dayjs';
import { HighCouncilName, ReferendumName, Organization, TIME_OPTIONS } from 'constants/proposal';
import ActionTabs from './ActionTabs/index';
import { SkeletonTab } from 'components/Skeleton';
import { getTimeMilliseconds } from '../util/time';
import { activeEndTimeName, activeStartTimeName, voterAndExecuteNamePath } from './constant';
import TimeRange from './TimeRange';
import { Controller } from 'react-hook-form';
import FormItem from 'components/FormItem';
import Input from 'components/Input';
import Tooltip from 'components/Tooltip';
import Select from 'components/Select';
import { Form } from 'antd';
import Button from 'components/Button';
import Spinner from 'components/Spinner';
import SimpleTimePicker from 'components/SimpleTimePicker';
import SimpleDatePicker from 'components/SimpleDatePicker';
import { combineDateAndTime } from 'utils/time';
import Radio from 'components/Radio';

const periodName = ['proposalBasicInfo', 'activeTimePeriod'];

interface ProposalInfoProps {
  form: any;
  next?: () => void;
  className?: string;
  daoId: string;
  daoData?: IDaoInfoData;
  onSubmit: () => void;
  onTabChange?: (activeKey: string) => void;
  activeTab?: string;
  treasuryAssetsData?: ITreasuryAssetsResponseDataItem[];
  daoDataLoading?: boolean;
  isValidating?: boolean;
}

const ProposalInfo = (props: ProposalInfoProps) => {
  const [governanceMechanismList, setGovernanceMechanismList] = useState<TGovernanceSchemeList>();
  // const [voteScheme, setVoteScheme] = useState<IVoteSchemeListData>();
  const [timePeriod, setTimePeriod] = useState<ITimePeriod | null>(null);

  const {
    form,
    className,
    daoId,
    onSubmit,
    onTabChange,
    activeTab,
    treasuryAssetsData,
    daoData,
    daoDataLoading,
    isValidating,
  } = props;
  const {
    watch,
    control,
    formState: { errors },
    trigger,
    setValue,
    getValues,
  } = form;

  const proposalType = watch('proposalType');
  const voterAndExecute = watch(voterAndExecuteNamePath);
  const activeTimePeriod = watch(periodName);
  const activeEndTime = watch(activeEndTimeName);
  const activeStartTime = watch(activeStartTimeName);

  const [startTime, setStartTime] = useState<TIME_OPTIONS>(TIME_OPTIONS.Now);
  const [endTime, setEndTime] = useState<TIME_OPTIONS>(TIME_OPTIONS.Now);

  const timeMilliseconds = useMemo(() => {
    return getTimeMilliseconds(activeStartTime, activeEndTime);
  }, [activeEndTime, activeStartTime]);
  const currentGovernanceMechanism = useMemo(() => {
    return governanceMechanismList?.find((item) => item.schemeAddress === voterAndExecute);
  }, [voterAndExecute, governanceMechanismList]);
  const isReferendumLike = [Organization, ReferendumName].includes(
    currentGovernanceMechanism?.governanceMechanism ?? '',
  );
  const isHighCouncil = currentGovernanceMechanism?.governanceMechanism === HighCouncilName;
  const isGovernance = proposalType === ProposalType.GOVERNANCE;

  const governanceMechanismOptions = useMemo(() => {
    return governanceMechanismList?.map((item) => {
      return {
        label: item.governanceMechanism,
        value: item.schemeAddress,
        disabled:
          proposalType === ProposalType.VETO && item.governanceMechanism === HighCouncilName,
      };
    });
  }, [governanceMechanismList, proposalType]);

  useAsyncEffect(async () => {
    const governanceMechanismListRes = await fetchGovernanceMechanismList({
      chainId: curChain,
      daoId: daoId,
    });
    setGovernanceMechanismList(governanceMechanismListRes.data.data);
    // setVoteScheme(voteSchemeListRes.data);
  }, [daoId]);
  const proposalDetailDesc = useMemo(() => {
    return proposalTypeList.find((item) => item.value === proposalType)?.desc ?? '';
  }, [proposalType]);

  // const
  useAsyncEffect(async () => {
    const timePeriod = await GetDaoProposalTimePeriodContract(daoId, {
      type: ContractMethodType.VIEW,
    });
    setTimePeriod(timePeriod);
  }, [daoId]);
  return (
    <div className={`${className} proposal-form`}>
      <div className="text-[20px] text-white font-Unbounded leading-[28px]">Create a Proposal</div>
      {/* <p className=" text-[16px] leading-[24px] text-Neutral-Secondary-Text font-normal mt-[8px] mb-[64px]">
        {proposalDetailDesc}
      </p>
      <FormItem label="Name" errorText={errors?.proposalBasicInfo?.proposalTitle?.message}>
        <Controller
          name="proposalBasicInfo.proposalTitle"
          control={control}
          rules={{
            required: 'The proposal title is required',
            maxLength: {
              value: 300,
              message: 'The proposal title supports a maximum of 300 characters',
            },
          }}
          render={({ field }) => (
            <Input
              {...field}
              placeholder="Enter the title of the list (300 characters max)"
              isError={!!errors?.proposalBasicInfo?.proposalTitle?.message}
            />
          )}
        />
      </FormItem>
      <FormItem
        label="Description"
        errorText={errors?.proposalBasicInfo?.proposalDescription?.message}
      >
        <Controller
          name="proposalBasicInfo.proposalDescription"
          control={control}
          rules={{
            required: 'The proposal description is required',
            maxLength: {
              value: 256,
              message: 'The proposal description supports a maximum of 256 characters',
            },
          }}
          render={({ field }) => (
            <MarkdownEditor {...field} maxLen={256} id="proposalBasicInfo_proposalDescription" />
          )}
        />
      </FormItem>

      {/* Discussion on forum */}
      <div className="text-white mt-[50px] font-Montserrat text-[16px] font-medium">
        {isGovernance ? 'Governance Information' : 'Proposal Information'}
      </div>
      {/* <Form.Item
        name={['proposalBasicInfo', 'forumUrl']}
        label={
          <span className="form-item-label">
            Discussion on Forum <span>(Optional)</span>
          </span>
        }
        rules={[
          {
            type: 'url',
            message: 'Please input a correct tmrwdao forum address',
          },
        ]}
      >
        <Input type="text" placeholder="https://URL" />
      </Form.Item> */}
      {/* veto proposal id */}
      {proposalType === ProposalType.VETO && (
        <FormItem
          label={
            <Tooltip title="You can find the published proposal id on the proposal details page">
              <span className="flex items-center text-descM15 text-white font-Montserrat gap-[8px]">
                Veto proposal id
                <i className="tmrwdao-icon-information text-lightGrey text-[18px]" />
              </span>
            </Tooltip>
          }
          errorText={errors?.vetoProposalId?.message}
        >
          <Controller
            name="vetoProposalId"
            control={control}
            rules={{
              required: 'the veto proposal id is required',
              maxLength: {
                value: 100,
                message: 'The veto proposal supports a maximum of 100 characters',
              },
            }}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="Enter the veto proposal id"
                isError={!!errors?.vetoProposalId?.message}
              />
            )}
          />
        </FormItem>
      )}

      {/* Voters and executors: */}
      <FormItem
        label={
          <span className="mb-2 block text-descM15 font-Montserrat text-white">
            Voters and executors
          </span>
        }
        errorText={errors?.proposalType?.message}
      >
        <Controller
          name="proposalBasicInfo.schemeAddress"
          control={control}
          rules={{ required: 'voters and executors is required' }}
          render={({ field }) => (
            <Select
              {...field}
              overlayClassName="!py-3"
              overlayItemClassName="flex flex-col gap-2 !py-3 text-white text-descM16 font-Montserrat"
              options={governanceMechanismOptions}
              isError={!!errors?.proposalType?.message}
              onChange={(option) => field.onChange(option.value)}
            />
          )}
        />
      </FormItem>
      {/* 1a1v/1t1v */}
      {/* <Form.Item
        name={voteSchemeName}
        label={<span className="form-item-label">Voting mechanism</span>}
        initialValue={voteScheme?.voteSchemeList?.[0]?.voteSchemeId}
        rules={[
          {
            required: true,
            message: 'vote model is required',
          },
        ]}
      >
        <Radio.Group>
          {voteScheme?.voteSchemeList.map((item) => {
            const isDisabled =
              activeTab === EProposalActionTabs.TREASURY &&
              EVoteMechanismNameType.UniqueVote === item.voteMechanismName &&
              proposalType === ProposalType.GOVERNANCE;
            return (
              <Radio value={item.voteSchemeId} key={item.voteSchemeId} disabled={isDisabled}>
                {VoteMechanismNameLabel[item.voteMechanismName]}
              </Radio>
            );
          })}
        </Radio.Group>
      </Form.Item> */}
      {/* transaction: */}
      {proposalType === ProposalType.GOVERNANCE &&
        (daoDataLoading ? (
          <SkeletonTab />
        ) : (
          <ActionTabs
            form={form}
            onTabChange={onTabChange}
            daoId={daoId}
            activeTab={activeTab}
            treasuryAssetsData={treasuryAssetsData}
            daoData={daoData}
            governanceMechanismList={governanceMechanismList ?? []}
          />
        ))}

      <FormItem
        label={
          <Tooltip
            title={
              <p className="text-[10px] leading-[12px] font-Montserrat font-medium text-lightGrey">
                Define when a proposal should be active to receive approvals. If now is selected,
                the proposal is immediately active after publishing.
              </p>
            }
          >
            <span className="flex items-center text-descM15 text-white font-Montserrat gap-[8px]">
              Voting start time
              <i className="tmrwdao-icon-information text-[18px]" />
            </span>
          </Tooltip>
        }
        labelClassName="!mb-[25px]"
      >
        <Controller
          name="proposalBasicInfo.activeStartTime"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <>
              <Radio
                value={startTime}
                options={[
                  { label: 'Now', value: TIME_OPTIONS.Now },
                  { label: 'Specific date & time', value: TIME_OPTIONS.Specific },
                ]}
                onChange={(value) => {
                  setStartTime(value as TIME_OPTIONS);
                  if (value === TIME_OPTIONS.Now) {
                    field.onChange(value);
                  }
                }}
              />
              {startTime === TIME_OPTIONS.Specific && (
                <div className="flex flex-row items-center flex-wrap gap-[9px] mt-[32px]">
                  <SimpleDatePicker
                    className="flex-1"
                    disabled={{
                      before: dayjs().add(1, 'day').toDate(),
                    }}
                    onChange={(day) =>
                      field.onChange(combineDateAndTime(day, activeStartTime as number))
                    }
                  />
                  <SimpleTimePicker
                    className="flex-1"
                    onChange={(time) => field.onChange(combineDateAndTime(activeStartTime, time))}
                  />
                </div>
              )}
            </>
          )}
        />
      </FormItem>
      <FormItem
        label={
          <Tooltip
            title={
              <p className="!mb-4 text-[10px] leading-[12px] font-Montserrat font-medium text-lightGrey">
                Define how long the voting should last in days, or add an exact date and time for it
                to conclude.
              </p>
            }
          >
            <span className="flex items-center text-descM15 text-white font-Montserrat gap-[8px]">
              Voting end time
              <i className="tmrwdao-icon-information text-[18px]" />
            </span>
          </Tooltip>
        }
        labelClassName="!mb-[25px]"
      >
        <Controller
          name="proposalBasicInfo.activeEndTime"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <>
              <Radio
                value={endTime}
                options={[
                  { label: 'Duration', value: TIME_OPTIONS.Now },
                  { label: 'Specific date & time', value: TIME_OPTIONS.Specific },
                ]}
                onChange={(value) => setEndTime(value as TIME_OPTIONS)}
              />
              {endTime === TIME_OPTIONS.Now ? (
                <div className="mt-[25px] flex flex-col lg:flex-row items-center gap-[25px]">
                  <div className="flex flex-col gap-2 w-full">
                    <span className="text-descM12 font-Montserrat text-lightGrey">Minutes</span>
                    <Input placeholder="0" regExp={/^([0-9\b]*)$/} defaultValue="0" />
                  </div>
                  <div className="flex flex-col gap-2 w-full">
                    <span className="text-descM12 font-Montserrat text-lightGrey">Hours</span>
                    <Input placeholder="0" regExp={/^([0-9\b]*)$/} defaultValue="0" />
                  </div>
                  <div className="flex flex-col gap-2 w-full">
                    <span className="text-descM12 font-Montserrat text-lightGrey">Days</span>
                    <Input placeholder="0" regExp={/^([0-9\b]*)$/} defaultValue="1" />
                  </div>
                </div>
              ) : (
                <div className="flex flex-row items-center flex-wrap gap-[9px] mt-[32px]">
                  <SimpleDatePicker
                    className="flex-1"
                    disabled={{
                      before:
                        activeStartTime === 1
                          ? dayjs().add(1, 'day').toDate()
                          : dayjs(activeStartTime).add(1, 'day').toDate(),
                    }}
                    onChange={(day) =>
                      field.onChange(combineDateAndTime(day, activeEndTime as number))
                    }
                  />
                  <SimpleTimePicker
                    className="flex-1"
                    onChange={(time) =>
                      field.onChange(combineDateAndTime(activeEndTime as number, time))
                    }
                  />
                </div>
              )}
            </>
          )}
        />
      </FormItem>
      {/* <Form.Item
        label={
          <Tooltip title="If the proposal is initiated around or at UTC 00:00 and is created after 00:00, the creation date will be the second day. As a result, the voting period will be extended by one day.">
            <span className="form-item-label">
              Voting Period
              <InfoCircleOutlined className="cursor-pointer label-icon" />
            </span>
          </Tooltip>
        }
        initialValue={1}
        name={periodName}
        extra={
          activeTimePeriod && (
            <div className="flex h-[48px] px-[16px] py-[8px] items-center rounded-[6px] border-[1px] border-solid border-Neutral-Border bg-Neutral-Hover-BG mt-[16px]">
              <span className="text-neutralTitle text-[14px] font-400 leading-[22px] pr-[16px]">
                {dayjs().format('DD MMM, YYYY')}
              </span>
              <ArrowIcon className="color-[#B8B8B8]" />
              <span className="text-neutralTitle text-[14px] font-400 leading-[22px] pl-[16px]">
                {activeTimePeriod
                  ? dayjs().add(Number(activeTimePeriod), 'hours').format('DD MMM, YYYY')
                  : '-'}
              </span>
            </div>
          )
        }
      >
        <RadioButtons
          options={[
            {
              label: '1 Hour',
              value: 1,
            },
            {
              label: '1 Day',
              value: 1 * 24,
            },
            {
              label: '3 Days',
              value: 1 * 24 * 3,
            },
          ]}
        />
      </Form.Item> */}

      {/* 
  advisory -> null
  Vote -> [now + activeTimePeriod, now + activeTimePeriod + executeTimePeriod]
  Governance 
    R: [now + activeTimePeriod, now + activeTimePeriod + executeTimePeriod]
    H: [now + activeTimePeriod + pendingTimePeriod
  , now + activeTimePeriod + executeTimePeriod + pendingTimePeriod]
      */}

      {[ProposalType.VETO, ProposalType.GOVERNANCE].includes(proposalType) &&
        currentGovernanceMechanism && (
          <Form.Item
            label={
              <Tooltip title="If the proposal is initiated around or at UTC 00:00 and is created after 00:00, the creation date will be the second day. As a result, the execution period will be extended by one day.">
                <span className="form-item-label">
                  Execution Period
                  <InfoCircleOutlined className="cursor-pointer label-icon" />
                </span>
              </Tooltip>
            }
          >
            <div className="flex h-[48px] px-[16px] py-[8px] items-center rounded-[6px] border-[1px] border-solid border-Neutral-Border bg-Neutral-Hover-BG">
              <span className="text-neutralTitle text-[14px] font-400 leading-[22px] pr-[16px]">
                {(proposalType === ProposalType.VETO || (isGovernance && isReferendumLike)) &&
                  dayjs(timeMilliseconds?.activeEndTime).format('DD MMM, YYYY')}
                {isGovernance &&
                  isHighCouncil &&
                  dayjs(timeMilliseconds?.activeEndTime)
                    .add(Number(timePeriod?.pendingTimePeriod), 'seconds')
                    .format('DD MMM, YYYY')}
              </span>
              <ArrowIcon className="color-[#B8B8B8]" />
              <span className="text-neutralTitle text-[14px] font-400 leading-[22px] pl-[16px]">
                {(proposalType === ProposalType.VETO || (isGovernance && isReferendumLike)) &&
                  dayjs(timeMilliseconds?.activeEndTime)
                    .add(Number(timePeriod?.executeTimePeriod), 'seconds')
                    .format('DD MMM, YYYY')}
                {isGovernance &&
                  isHighCouncil &&
                  dayjs(timeMilliseconds?.activeEndTime)
                    .add(Number(timePeriod?.pendingTimePeriod), 'seconds')
                    .add(Number(timePeriod?.executeTimePeriod), 'seconds')
                    .format('DD MMM, YYYY')}
              </span>
            </div>
          </Form.Item>
        )}

      <div className="flex justify-end mt-[100px]">
        <Button
          type="primary"
          className="w-[156px]"
          onClick={() => {
            onSubmit();
          }}
        >
          {isValidating && <Spinner />}
          Submit
        </Button>
      </div>
    </div>
  );
};

export default memo(ProposalInfo);
