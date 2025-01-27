import { message as antdMessage } from 'antd';
import OptionDynamicList from './OptionDynamicList';
import { IContractError } from 'types';
import { useRouter } from 'next/navigation';
import { emitLoading } from 'utils/myEvent';
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
import FormItem from 'components/FormItem';
import { Controller, useForm } from 'react-hook-form';
import Input from 'components/Input';
import Upload, { IRefHandle } from 'components/Upload';
import { shortenFileName } from 'utils/file';
import Select from 'components/Select';
import Radio from 'components/Radio';
import Tooltip from 'components/Tooltip';
import { TIME_OPTIONS } from 'constants/proposal';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/themes/dark.css';
import dayjs from 'dayjs';
import './index.css';
import SimpleDatePicker from 'components/SimpleDatePicker';
import SimpleTimePicker from 'components/SimpleTimePicker';
import { combineDateAndTime } from 'utils/time';
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
        activeStartTime: 1,
        activeEndTime: 1,
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
  const [startTime, setStartTime] = useState<TIME_OPTIONS>(TIME_OPTIONS.Now);
  const [endTime, setEndTime] = useState<TIME_OPTIONS>(TIME_OPTIONS.Now);
  const [date, setDate] = useState(new Date());
  const banner = watch('banner');
  const activeStartTime = watch('proposalBasicInfo.activeStartTime');
  const activeEndTime = watch('proposalBasicInfo.activeEndTime');

  const [governanceMechanismList, setGovernanceMechanismList] = useState<TGovernanceSchemeList>();
  const governanceMechanismOptions = useMemo(() => {
    return governanceMechanismList?.map((item) => {
      return {
        label: item.governanceMechanism,
        value: item.schemeAddress,
      };
    });
  }, [governanceMechanismList]);
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
          <FormItem label="Banner" errorText={errors?.banner?.message}>
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
        <span className="block mb-[50px] pt-[50px] border-0 border-solid border-t-[1px] border-fillBg8 text-[20px] font-light font-Unbounded text-white">
          Proposal Information
        </span>
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
                options={governanceMechanismOptions}
                isError={!!errors.proposalBasicInfo?.schemeAddress?.message}
                onChange={({ value }) => field.onChange(value)}
              />
            )}
          />
        </FormItem>
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
                  Define how long the voting should last in days, or add an exact date and time for
                  it to conclude.
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
      </form>

      <div className="flex justify-end mt-[32px]">
        <ButtonCheckLogin type="primary" onClick={handleSubmit}>
          Submit
        </ButtonCheckLogin>
      </div>
    </div>
  );
}
