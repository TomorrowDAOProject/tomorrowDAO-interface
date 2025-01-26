import { message as antdMessage } from 'antd';
import OptionDynamicList from './OptionDynamicList';
import { IContractError } from 'types';
import { useRouter } from 'next/navigation';
import { emitLoading } from 'utils/myEvent';
import { voterAndExecuteNamePath } from 'pageComponents/proposal-create/DeployForm/constant';
import { ResponsiveSelect } from 'components/ResponsiveSelect';
import { proposalCreateContractRequest } from 'contract/proposalCreateContract';
import { useAsyncEffect } from 'ahooks';
import { fetchGovernanceMechanismList } from 'api/request';
import { curChain } from 'config';
import { useMemo, useRef, useState } from 'react';
import { ButtonCheckLogin } from 'components/ButtonCheckLogin';
import { ProposalType as ProposalTypeEnum } from 'types';
import { EOptionType, ESourceType } from '../type';
import { showSuccessModal, showErrorModal } from 'utils/globalModal';
import { saveVoteOptions, fetchVoteSchemeList } from 'api/request';
import { formmatDescription } from '../utils';
import { getProposalTimeParams } from 'utils/getProposalTime';
import TimeRange from 'pageComponents/proposal-create/DeployForm/TimeRange';
import FormItem from 'components/FormItem';
import { Controller, useForm } from 'react-hook-form';
import Input from 'components/Input';
import Upload, { IRefHandle } from 'components/Upload';
import { shortenFileName } from 'utils/file';
import LinkGroup from 'app/(createADao)/create/component/LinkGroup';
import { SocialMedia } from 'types/dao';
import Select from 'components/Select';
import Button from 'components/Button';
import clsx from 'clsx';
interface IFormPageProps {
  daoId: string;
  optionType: EOptionType;
  aliasName: string;
}
export default function Page(props: IFormPageProps) {
  const { daoId, optionType, aliasName } = props;
  const nextRouter = useRouter();

  const form = useForm({
    defaultValues: {
      proposalType: optionType,
      proposalBasicInfo: {
        proposalTitle: '',
        schemeAddress: '',
        activeStartTime: 0,
        activeEndTime: 0,
      },
      banner: '',
      options: [''],
    },
  });
  const {
    watch,
    control,
    formState: { errors },
    trigger,
    setValue,
    getValues,
  } = form;
  const uploadRef = useRef<IRefHandle | null>(null);

  const banner = watch('banner');
  const proposalType = watch('proposalType');
  const options = watch('options') ?? [];

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
      await trigger();
      const res = getValues();
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
      const bannerUrl = res?.banner;
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
      const error = err as IContractError;
      const msg =
        (error?.errorMessage?.message || error?.message || err?.toString()) ?? 'Unknown error';
      showErrorModal('Error', msg);
    }
  };
  return (
    <div className="deploy-proposal-options-form">
      <h3 className="card-title lg:mb-[32px] mb-[24px]">Create a List</h3>
      <form>
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
        {optionType === EOptionType.advanced && (
          <FormItem label="Banner" className="lg:mb-0" errorText={errors?.banner?.message}>
            <Controller
              name="banner"
              control={control}
              rules={{
                required: 'Banner is required',
              }}
              render={({ field }) => (
                <>
                  <Upload
                    ref={uploadRef}
                    accept=".png,.jpg,.jpeg"
                    needCheckImgSize
                    ratio={[2.9, 3]}
                    fileLimit="10 MB"
                    ratioErrorText="The ratio of the image is incorrect, please upload an image with a ratio of 3:1"
                    tips={'Formats supported: PNG and JPG. Ratio: 3:1, less than 10 MB.'}
                    onFinish={({ url }) => field.onChange(url)}
                    // needCrop
                  />

                  {banner && (
                    <div className="flex items-center justify-between py-1 md:px-3 mt-[15px] mx-auto">
                      <div className="flex items-center flex-grow">
                        <i className="text-lightGrey tmrwdao-icon-upload-document text-[20px]" />
                        <span className="ml-2 text-lightGrey text-desc14 font-Montserrat">
                          {shortenFileName(banner)}
                        </span>
                      </div>
                      <i
                        className="tmrwdao-icon-circle-minus text-[22px] ml-[6px] cursor-pointer text-Neutral-Secondary-Text"
                        onClick={() => {
                          setValue('banner', '');
                          uploadRef.current?.reset();
                        }}
                      />
                    </div>
                  )}
                </>
              )}
            />
          </FormItem>
        )}
        <FormItem label="Options" errorText={errors?.options?.message}>
          <Controller
            name="options"
            control={control}
            rules={{
              required: 'Option is required',
              minLength: {
                value: 1,
                message: 'There should be more than 1 option, please add more options.',
              },
            }}
            render={({ field }) => (
              <OptionDynamicList
                optionType={optionType}
                initialValue={[
                  {
                    title: '',
                  },
                  {
                    title: '',
                  },
                ]}
                onChange={field.onChange}
              />
            )}
          />
        </FormItem>
        <div className="card-title divide-title">Proposal Information</div>
        <FormItem
          label="Voters and executors"
          errorText={errors.proposalBasicInfo?.schemeAddress?.message}
        >
          <Controller
            name="proposalBasicInfo.schemeAddress"
            control={control}
            rules={{
              required: 'voters and executors is required',
            }}
            render={({ field }) => (
              <Select
                {...field}
                label="Name"
                placehoder="Select Social Media"
                options={governanceMechanismOptions}
                isError={!!errors.proposalBasicInfo?.schemeAddress?.message}
              />
            )}
          />
        </FormItem>
        <TimeRange />
      </form>

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
