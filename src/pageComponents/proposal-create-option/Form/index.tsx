import { Form, message as antdMessage } from 'antd';
import { Input } from 'aelf-design';
import OptionDynamicList from './OptionDynamicList';
import AWSUpload from 'components/S3Upload';
import formValidateScrollFirstError from 'utils/formValidateScrollFirstError';
import { IContractError, IFormValidateError } from 'types';
import { useRouter } from 'next/navigation';
import { emitLoading } from 'utils/myEvent';
import { voterAndExecuteNamePath } from 'pageComponents/proposal-create/DeployForm/constant';
import { ResponsiveSelect } from 'components/ResponsiveSelect';
import { proposalCreateContractRequest } from 'contract/proposalCreateContract';
import { useAsyncEffect } from 'ahooks';
import { fetchGovernanceMechanismList } from 'api/request';
import { curChain } from 'config';
import { useMemo, useState } from 'react';
import { ButtonCheckLogin } from 'components/ButtonCheckLogin';
import { ProposalType as ProposalTypeEnum } from 'types';
import { EOptionType, ESourceType } from '../type';
import { showSuccessModal, showErrorModal } from 'utils/globalModal';
import { saveVoteOptions, fetchVoteSchemeList } from 'api/request';
import { formmatDescription } from '../utils';
import { getProposalTimeParams } from 'utils/getProposalTime';
import TimeRange from 'pageComponents/proposal-create/DeployForm/TimeRange';
interface IFormPageProps {
  daoId: string;
  optionType: EOptionType;
  aliasName: string;
}
export default function Page(props: IFormPageProps) {
  const { daoId, optionType, aliasName } = props;
  const nextRouter = useRouter();
  const [form] = Form.useForm();
  const proposalType = Form.useWatch('proposalType', form);
  const [governanceMechanismList, setGovernanceMechanismList] = useState<TGovernanceSchemeList>();
  const governanceMechanismOptions = useMemo(() => {
    return governanceMechanismList?.map((item) => {
      return {
        label: item.governanceMechanism,
        value: item.schemeAddress,
      };
    });
  }, [governanceMechanismList, proposalType]);
  useAsyncEffect(async () => {
    if (!daoId) {
      return;
    }
    const governanceMechanismListRes = await fetchGovernanceMechanismList({
      chainId: curChain,
      daoId: daoId,
    });
    setGovernanceMechanismList(governanceMechanismListRes.data.data);
  }, [daoId]);
  const handleSubmit = async () => {
    try {
      const res = await form.validateFields();
      emitLoading(true, 'Publishing the proposal...');
      console.log('res', res);
      const saveReqApps: ISaveAppListReq['apps'] = res.options.map((item: any) => {
        return {
          ...item,
          icon: item.icon?.[0]?.url,
          screenshots: item.screenshots?.map((screenshot: any) => screenshot.url),
          sourceType: ESourceType.TomorrowDao,
        };
      });
      const bannerUrl = res?.banner?.[0]?.url;
      if (bannerUrl) {
        saveReqApps.push({
          title: 'TomorrowDaoBanner',
          icon: bannerUrl,
          sourceType: ESourceType.TomorrowDao,
        });
      }
      const [saveRes, voteSchemeListRes] = await Promise.all([
        saveVoteOptions({
          chainId: curChain,
          apps: saveReqApps,
        }),
        fetchVoteSchemeList({ chainId: curChain, daoId: daoId }),
      ]);
      const appAlias = saveRes?.data ?? [];
      if (!appAlias.length) {
        throw new Error('Failed to create proposal, save options failed');
      }
      const formmatDescriptionStr = formmatDescription(appAlias, bannerUrl);
      if (formmatDescriptionStr.length > 256) {
        throw new Error(
          'Too many options have been added, or the option names are too long. Please simplify the options and try again.',
        );
      }
      const voteSchemeId = voteSchemeListRes?.data?.voteSchemeList?.[0]?.voteSchemeId;
      if (!voteSchemeId) {
        throw new Error('The voting scheme for this DAO cannot be found');
      }
      const methodName = 'CreateProposal';
      const timeParams = getProposalTimeParams(
        res.proposalBasicInfo.activeStartTime,
        res.proposalBasicInfo.activeEndTime,
      );
      const proposalBasicInfo = {
        ...res.proposalBasicInfo,
        ...timeParams,
        proposalDescription: formmatDescriptionStr,
        daoId,
        voteSchemeId,
      };
      const contractParams = {
        proposalType: ProposalTypeEnum.ADVISORY,
        proposalBasicInfo: proposalBasicInfo,
      };
      /**
      {
    "proposalType": 2,
    "proposalBasicInfo": {
      "proposalTitle": "title",
      "proposalDescription": "1",
      "schemeAddress": "nwKhRXz5tZXe6PDDznqcxNuBPjk7DnHn8vVQDjbUnCy3MZJXN",
      "activeStartTime": 0,
      "activeEndTime": 0,
      "activeTimePeriod": 86400,
      "daoId": "9d929173f8244c1a5195098e027c687498c132f48d9ad640efe2ed958147d5eb",
      "voteSchemeId": "934d1295190d97e81bc6c2265f74e589750285aacc2c906c7c4c3c32bd996a64"
    }
  },
       */
      await proposalCreateContractRequest(methodName, contractParams);
      emitLoading(false);
      showSuccessModal({
        primaryContent: 'Proposal Published',
        secondaryContent: res.proposalBasicInfo.proposalTitle,
        onOk: () => {
          antdMessage.open({
            type: 'success',
            content: 'created successfully, it will appear in the list in a few minutes',
          });
          nextRouter.push(`/dao/${aliasName}`);
        },
      });
    } catch (err) {
      emitLoading(false);
      const error = err as IFormValidateError | IContractError;
      // form Error
      if (typeof error === 'object' && 'errorFields' in error) {
        formValidateScrollFirstError(form, error);
        return;
      }
      const msg =
        (error?.errorMessage?.message || error?.message || err?.toString()) ?? 'Unknown error';
      showErrorModal('Error', msg);
    }
  };
  return (
    <div className="deploy-proposal-options-form">
      <h3 className="card-title lg:mb-[32px] mb-[24px]">Create a List</h3>
      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
        requiredMark={true}
        scrollToFirstError={true}
        name="dynamic_form_item"
      >
        <Form.Item
          name={['proposalBasicInfo', 'proposalTitle']}
          label={<span>Title</span>}
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
          <Input type="text" placeholder="Enter the title of the list (300 characters max). " />
        </Form.Item>
        {optionType === EOptionType.advanced && (
          <Form.Item name={'banner'} label={<span>Banner</span>} valuePropName="fileList">
            <AWSUpload
              accept=".png,.jpg,.jpeg"
              maxFileCount={1}
              needCheckImgSize
              ratio={[2.9, 3]}
              fileLimit="10 MB"
              ratioErrorText="The ratio of the image is incorrect, please upload an image with a ratio of 3:1"
              tips={'Formats supported: PNG and JPG. Ratio: 3:1, less than 10 MB.'}
              needCrop
            />
          </Form.Item>
        )}

        <OptionDynamicList
          name={'options'}
          form={form}
          rules={[
            {
              validator: (_, value) => {
                return new Promise<void>((resolve, reject) => {
                  if (!value || !value?.length || value?.length < 2) {
                    reject('There should be more than 1 option, please add more options.');
                  }
                  resolve();
                });
              },
            },
          ]}
          optionType={optionType}
          initialValue={[
            {
              title: '',
            },
            {
              title: '',
            },
          ]}
        />
        <div className="card-title divide-title">Proposal Information</div>
        <Form.Item
          name={voterAndExecuteNamePath}
          required
          label={<span>Voters and executors</span>}
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
        <TimeRange />
      </Form>

      <div className="flex justify-end mt-[32px]">
        <ButtonCheckLogin
          type="primary"
          className="lg:w-[156px] w-full"
          // disabled={!title || !description}
          onClick={handleSubmit}
          loading={false}
        >
          Submit
        </ButtonCheckLogin>
      </div>
    </div>
  );
}
