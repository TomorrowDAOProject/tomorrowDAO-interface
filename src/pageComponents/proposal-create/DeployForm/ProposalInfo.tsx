'use client';

import { Tooltip, Button } from 'aelf-design';
import { InfoCircleOutlined } from '@aelf-design/icons';
import { Form } from 'antd';
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
import { HighCouncilName, ReferendumName, Organization } from 'constants/proposal';
import ActionTabs from './ActionTabs/index';
import { SkeletonTab } from 'components/Skeleton';
import { getTimeMilliseconds } from '../util/time';
import { activeEndTimeName, activeStartTimeName, voterAndExecuteNamePath } from './constant';
import TimeRange from './TimeRange';

import Input from 'components/Input';

const periodName = ['proposalBasicInfo', 'activeTimePeriod'];

interface ProposalInfoProps {
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

  const form = Form.useFormInstance();

  const proposalType = Form.useWatch('proposalType', form);
  const voterAndExecute = Form.useWatch(voterAndExecuteNamePath, form);
  const activeTimePeriod = Form.useWatch(periodName, form);
  const activeEndTime = Form.useWatch(activeEndTimeName, form);
  const activeStartTime = Form.useWatch(activeStartTimeName, form);
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
      </p> */}
      <Form.Item
        name={['proposalBasicInfo', 'proposalTitle']}
        label={
          <span className="text-white mt-[50px] font-Montserrat text-[16px] font-medium">
            Title
          </span>
        }
        validateFirst
        rules={[
          {
            required: true,
            message: 'The proposal title is required',
          },
          {
            min: 0,
            max: 300,
            message: 'The proposal title supports a maximum of 300 characters',
          },
        ]}
      >
        <Input placeholder="Enter the title of the proposal (300 characters max)" />
      </Form.Item>
      <Form.Item
        name={['proposalBasicInfo', 'proposalDescription']}
        label={
          <span className="text-white mt-[50px] font-Montserrat text-[16px] font-medium">
            Description
          </span>
        }
        validateFirst
        rules={[
          {
            required: true,
            message: 'The proposal description is required',
          },
          {
            min: 0,
            max: 256,
            message: 'The proposal description supports a maximum of 256 characters',
          },
        ]}
      >
        <MarkdownEditor maxLen={256} id="proposalBasicInfo_proposalDescription" />
      </Form.Item>

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
        <Form.Item
          name={'vetoProposalId'}
          label={
            <Tooltip title="You can find the published proposal id on the proposal details page">
              <span className="form-item-label">
                Veto proposal id <InfoCircleOutlined className="cursor-pointer label-icon" />
              </span>
            </Tooltip>
          }
          rules={[
            {
              required: true,
              message: 'the veto proposal id is required',
              max: 100,
            },
          ]}
        >
          <Input placeholder="Enter the veto proposal id" />
        </Form.Item>
      )}

      {/* Voters and executors: */}
      <Form.Item
        name={voterAndExecuteNamePath}
        label={<span className="form-item-label">Voters and executors</span>}
        rules={[
          {
            required: true,
            message: 'voters and executors is required',
          },
        ]}
      >
        <ResponsiveSelect
          drawerProps={{
            title: 'Proposal Type',
          }}
          options={governanceMechanismOptions}
          optionLabelProp="label"
        ></ResponsiveSelect>
      </Form.Item>
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
            onTabChange={onTabChange}
            daoId={daoId}
            activeTab={activeTab}
            treasuryAssetsData={treasuryAssetsData}
            daoData={daoData}
            governanceMechanismList={governanceMechanismList ?? []}
          />
        ))}

      <TimeRange />
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
          // disabled={!title || !description}
          onClick={() => {
            onSubmit();
          }}
          loading={isValidating}
        >
          Submit
        </Button>
      </div>
    </div>
  );
};

export default memo(ProposalInfo);
