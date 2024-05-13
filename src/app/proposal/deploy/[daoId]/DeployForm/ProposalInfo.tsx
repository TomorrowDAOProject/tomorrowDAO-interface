'use client';

import { Radio, Input, Tooltip, Button } from 'aelf-design';
import { InfoCircleOutlined } from '@aelf-design/icons';
import { Form } from 'antd';
import { memo, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ResponsiveSelect } from 'components/ResponsiveSelect';
import MarkdownEditor from 'components/MarkdownEditor';
import Editor from '@monaco-editor/react';
import { ReactComponent as ArrowIcon } from 'assets/imgs/arrow-icon.svg';
import { ContractMethodType, ProposalType, proposalTypeList } from 'types';
import {
  fetchGovernanceMechanismList,
  fetchContractInfo,
  fetchDaoInfo,
  fetchVoteSchemeList,
} from 'api/request';
import { useSelector } from 'redux/store';
import { curChain } from 'config';
import { useAsyncEffect } from 'ahooks';
import { GetDaoProposalTimePeriodContract } from 'contract/callContract';
import dayjs from 'dayjs';

const contractMethodNamePath = ['transaction', 'contractMethodName'];
interface ProposalInfoProps {
  next?: () => void;
  className?: string;
  daoId: string;
  onSubmit: () => void;
}

const ProposalInfo = (props: ProposalInfoProps) => {
  const [governanceMechanismList, setGovernanceMechanismList] = useState<GovernanceSchemeList>();

  const searchParams = useSearchParams();
  const [daoInfo, setDaoInfo] = useState<DaoInfoData>();
  console.log(searchParams, daoInfo);
  const [contractInfo, setContractInfo] = useState<ContractInfoListData>();
  const [voteScheme, setVoteScheme] = useState<IVoteSchemeListData>();
  const [timePeriod, setTimePeriod] = useState<ITimePeriod | null>(null);

  // const info = store.getState().elfInfo.elfInfo;
  const elfInfo = useSelector((state) => state.elfInfo.elfInfo);
  const { className, daoId, onSubmit } = props;

  const governanceMechanismOptions = useMemo(() => {
    return governanceMechanismList?.map((item) => {
      return {
        label: item.governanceMechanism,
        value: item.schemeAddress,
      };
    });
  }, [governanceMechanismList]);
  const contractInfoOptions = useMemo(() => {
    return contractInfo?.contractInfoList.map((item) => {
      return {
        label: item.contractName,
        value: item.contractAddress,
      };
    });
  }, [contractInfo]);
  const form = Form.useFormInstance();
  const contractAddress = Form.useWatch(['transaction', 'toAddress'], form);
  const proposalType = Form.useWatch('proposalType', form);
  const schemeAddress = Form.useWatch(['proposalBasicInfo', 'schemeAddress'], form);
  const params = Form.useWatch(['transaction', 'params'], form);
  const contractMethodOptions = useMemo(() => {
    const contract = contractInfo?.contractInfoList.find(
      (item) => item.contractAddress === contractAddress,
    );
    return (
      contract?.functionList?.map((item) => {
        return {
          label: item,
          value: item,
        };
      }) ?? []
    );
  }, [contractInfo, contractAddress]);
  useEffect(() => {
    const run = async () => {
      const [governanceMechanismListRes, daoInfo, contractInfo, voteSchemeListRes] =
        await Promise.all([
          fetchGovernanceMechanismList({ chainId: elfInfo.curChain, daoId: daoId }),
          fetchDaoInfo({ chainId: elfInfo.curChain, daoId: daoId }),
          fetchContractInfo({ chainId: elfInfo.curChain }),
          fetchVoteSchemeList({ chainId: curChain }),
        ]);
      setGovernanceMechanismList(governanceMechanismListRes.data.data);
      setDaoInfo(daoInfo.data);
      setContractInfo(contractInfo.data);
      setVoteScheme(voteSchemeListRes.data);
    };
    run();
  }, []);
  const proposalDetailDesc = useMemo(() => {
    return proposalTypeList.find((item) => item.value === proposalType)?.desc ?? '';
  }, [proposalType]);
  // reset Method Name if Contract Address change
  useEffect(() => {
    const methodName = form.getFieldValue(contractMethodNamePath);
    if (!contractInfo?.contractInfoList.includes(methodName)) {
      form.setFieldValue(contractMethodNamePath, undefined);
    }
  }, [contractAddress, form, contractInfo]);
  // const
  useAsyncEffect(async () => {
    const timePeriod = await GetDaoProposalTimePeriodContract(daoId, {
      type: ContractMethodType.VIEW,
    });
    setTimePeriod(timePeriod);
  }, [daoId]);
  return (
    <div className={className}>
      <h2 className="text-[20px] leading-[28px] font-weight">Proposal Details</h2>
      <p className=" text-[16px] leading-[24px] text-Neutral-Secondary-Text font-normal mt-[8px] mb-[64px]">
        {proposalDetailDesc}
      </p>
      <Form.Item
        name={['proposalBasicInfo', 'proposalTitle']}
        label={<span className="form-item-label">Title</span>}
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
        <Input type="text" placeholder="Enter the title of the proposal (300 characters max)" />
      </Form.Item>
      <Form.Item
        name={['proposalBasicInfo', 'proposalDescription']}
        label={<span className="form-item-label">Description</span>}
        validateFirst
        rules={[
          {
            required: true,
            message: 'The proposal description is required',
          },
          {
            min: 0,
            max: 300000,
            message: 'The proposal description supports a maximum of 300,000 characters',
          },
        ]}
      >
        <MarkdownEditor maxLen={300000} />
      </Form.Item>

      {/* Discussion on forum */}
      <h2 className="title-primary mt-[64px]">Governance Information</h2>
      <Form.Item
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
      </Form.Item>

      {/* Voters and executors: */}
      <Form.Item
        name={['proposalBasicInfo', 'schemeAddress']}
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
      <Form.Item
        name={['proposalBasicInfo', 'voteSchemeId']}
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
            return (
              <Radio value={item.voteSchemeId} key={item.voteSchemeId}>
                {item.voteMechanismName}
              </Radio>
            );
          })}
        </Radio.Group>
      </Form.Item>
      {/* transaction: */}
      {proposalType === ProposalType.GOVERNANCE && (
        <>
          <Form.Item
            name={['transaction', 'toAddress']}
            rules={[
              {
                required: true,
                message: 'contract address is required',
              },
            ]}
            label={<span className="form-item-label">Contract Address</span>}
          >
            <ResponsiveSelect
              drawerProps={{
                title: 'Contract Address',
              }}
              options={contractInfoOptions}
              optionLabelProp="label"
              placeholder="Select a contract"
            ></ResponsiveSelect>
          </Form.Item>
          <Form.Item
            name={contractMethodNamePath}
            label={<span className="form-item-label">Method Name</span>}
            dependencies={['transaction', 'toAddress']}
            rules={[
              {
                required: true,
                message: 'method name is required',
              },
            ]}
          >
            <ResponsiveSelect
              drawerProps={{
                title: 'Method Name',
              }}
              options={contractMethodOptions}
              optionLabelProp="label"
              placeholder="Select a method name"
            ></ResponsiveSelect>
          </Form.Item>
          <Form.Item
            name={['transaction', 'params']}
            label={<span className="form-item-label">Method Params</span>}
            rules={[
              {
                required: true,
                message: 'method params is required',
              },
            ]}
          >
            <Editor defaultLanguage="json" height={176} />
          </Form.Item>
        </>
      )}

      <Form.Item
        label={
          <Tooltip title="If the proposal is initiated around or at UTC 00:00 and is created after 00:00, the creation date will be the second day. As a result, the voting period will be extended by one day.">
            <span className="form-item-label">
              Voting Period
              <InfoCircleOutlined className="cursor-pointer label-icon" />
            </span>
          </Tooltip>
        }
      >
        <div className="flex h-[48px] px-[16px] py-[8px] items-center rounded-[6px] border-[1px] border-solid border-Neutral-Border bg-Neutral-Hover-BG">
          <span className="text-neutralTitle text-[14px] font-400 leading-[22px] pr-[16px]">
            {dayjs().format('DD MMM, YYYY')}
          </span>
          <ArrowIcon className="color-[#B8B8B8]" />
          <span className="text-neutralTitle text-[14px] font-400 leading-[22px] pl-[16px]">
            {timePeriod?.activeTimePeriod
              ? dayjs().add(Number(timePeriod?.activeTimePeriod), 'days').format('DD MMM, YYYY')
              : '-'}
          </span>
        </div>
      </Form.Item>
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
            {dayjs().format('DD MMM, YYYY')}
          </span>
          <ArrowIcon className="color-[#B8B8B8]" />
          <span className="text-neutralTitle text-[14px] font-400 leading-[22px] pl-[16px]">
            {timePeriod?.executeTimePeriod
              ? dayjs().add(Number(timePeriod?.executeTimePeriod), 'days').format('DD MMM, YYYY')
              : '-'}
          </span>
        </div>
      </Form.Item>
      <div className="flex justify-end mt-[100px]">
        <Button
          type="primary"
          className="w-[156px]"
          // disabled={!title || !description}
          onClick={() => {
            onSubmit();
          }}
        >
          Submit
        </Button>
      </div>
    </div>
  );
};

export default memo(ProposalInfo);
