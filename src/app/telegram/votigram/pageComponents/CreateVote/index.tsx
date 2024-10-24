import { Button, Form, Divider } from 'antd';
import { useRef, useState } from 'react';
import { Input } from 'aelf-design';
import DynamicOption from '../../components/DynamicOptionFormItem';
import AWSUpload from 'components/S3Upload';
import { useConfig } from 'components/CmsGlobalConfig/type';
import CommonModal, { ICommonModalRef } from '../../components/CommonModal';
import { EOptionType } from 'pageComponents/proposal-create-option/type';
import { ProposalType as ProposalTypeEnum } from 'types';
import { TimeRangeStartTime } from 'pageComponents/proposal-create/DeployForm/TimeRange';
import './index.css';
import { activeEndTimeName } from 'pageComponents/proposal-create/DeployForm/constant';
import ActiveEndTime from '../../components/ActiveEndTime';
import CommonDrawer, { ICommonDrawerRef } from '../../components/CommonDrawer';
import VoteItem from '../../components/VoteItem';
import { fetchGovernanceMechanismList, fetchVoteSchemeList, saveVoteOptions } from 'api/request';
import { curChain } from 'config';
import { formmatDescription } from 'pageComponents/proposal-create-option/utils';
import { ESourceType } from 'pageComponents/proposal-create-option/type';
import formValidateScrollFirstError from 'utils/formValidateScrollFirstError';
import { IContractError, IFormValidateError } from 'types';
import { proposalCreateContractRequest } from 'contract/proposalCreateContract';
import { getProposalTimeParams } from '../../util/getProposalTimeParams';
import Loading from '../../components/Loading';
import { SuccessSubmitIcon } from 'components/Icons';

interface ICreateVoteProps {
  closeCreateForm?: () => void;
}
export function CreateVote(props: ICreateVoteProps) {
  const { closeCreateForm } = props;
  const [form] = Form.useForm();
  const submitModalRef = useRef<ICommonModalRef>(null);
  const loadingModalRef = useRef<ICommonModalRef>(null);
  const previewDrawerRef = useRef<ICommonDrawerRef>(null);
  const [previewData, setPreviewData] = useState<any>({});
  const { communityDaoId } = useConfig() ?? {};
  const [errorMessage, setErrorMessage] = useState('');
  const handlePreview = async () => {
    const res = await form.validateFields();
    const previewData = {
      ...res,
      title: res?.proposalBasicInfo?.proposalTitle,
      icon: res?.banner?.[0]?.url,
    };
    setPreviewData(previewData);
    previewDrawerRef.current?.open();
  };
  const handleSubmit = async () => {
    try {
      const res = await form.validateFields();
      loadingModalRef.current?.open();
      const saveReqApps: ISaveAppListReq['apps'] = res.options.map((item: any) => {
        return {
          ...item,
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
      const [saveRes, voteSchemeListRes, governanceMechanismListRes] = await Promise.all([
        saveVoteOptions({
          chainId: curChain,
          apps: saveReqApps,
        }),
        fetchVoteSchemeList({ chainId: curChain, daoId: communityDaoId ?? '' }),
        fetchGovernanceMechanismList({ chainId: curChain, daoId: communityDaoId ?? '' }),
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
      const schemeAddress = governanceMechanismListRes?.data?.data?.[0]?.schemeAddress;
      if (!voteSchemeId) {
        throw new Error('The voting scheme for this DAO cannot be found');
      }
      if (!schemeAddress) {
        throw new Error('The voting scheme address for this DAO cannot be found');
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
        daoId: communityDaoId,
        voteSchemeId,
        schemeAddress,
      };
      const contractParams = {
        proposalType: ProposalTypeEnum.ADVISORY,
        proposalBasicInfo: proposalBasicInfo,
      };
      await proposalCreateContractRequest(methodName, contractParams);

      setErrorMessage('');
      loadingModalRef.current?.close();
      submitModalRef.current?.open();
    } catch (err) {
      const error = err as IFormValidateError | IContractError;
      // form Error
      if (typeof error === 'object' && 'errorFields' in error) {
        formValidateScrollFirstError(form, error);
        return;
      }
      loadingModalRef.current?.close();
      submitModalRef.current?.open();
      const msg =
        (error?.errorMessage?.message || error?.message || err?.toString()) ?? 'Unknown error';
      // showErrorModal('Error', msg);
      setErrorMessage(msg);
    }
  };

  return (
    <div className="votigram-create-vote-form">
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
        <Form.Item name={'banner'} label={<span>Banner</span>} valuePropName="fileList">
          <AWSUpload
            accept=".png,.jpg,.jpeg"
            maxFileCount={1}
            needCrop
            needCheckImgSize
            ratio={[2.9, 3]}
            ratioErrorText="The ratio of the image is incorrect, please upload an image with a ratio of 3:1"
            uploadText={
              (
                <span className="TMRWDAO-upload-button-upload-text">Upload</span>
              ) as unknown as string
            }
            tips={
              <span className="TMRWDAO-upload-button-upload-tips">
                Formats supported: PNG and JPG. Ratio: 3:1, less than 1 MB.
              </span>
            }
          />
        </Form.Item>

        <DynamicOption
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
          optionType={EOptionType.advanced}
          initialValue={[]}
        />
        <Divider />
        <TimeRangeStartTime mobile ignoreToolTip />
        <Form.Item
          label={<span className="form-item-label">Voting end date</span>}
          initialValue={{
            value: 1,
            unit: 'hour',
          }}
          name={activeEndTimeName}
          rules={[
            {
              required: true,
              message: 'The voting end time is required',
            },
          ]}
        >
          <ActiveEndTime />
        </Form.Item>
      </Form>
      <div className="form-buttons">
        <Button className="submit-button" color="primary" onClick={handlePreview}>
          Preview
        </Button>
        <Button type="primary" className="submit-button" onClick={handleSubmit}>
          Create
        </Button>
      </div>
      <CommonDrawer
        title={`Preview List`}
        ref={previewDrawerRef}
        drawerProps={{
          destroyOnClose: true,
        }}
        bodyClassname="create-form-preview-drawer"
        headerClassname="create-form-preview-drawer-header"
        body={
          <div className="vote-list-preview">
            <h2 className="proposal-title font-20-25-weight">{previewData.title}</h2>
            {previewData.icon && <img className="preview-image" src={previewData.icon} alt="" />}
            <div>
              {previewData.options?.map((item: any, i: number) => {
                return (
                  <VoteItem
                    key={item.title}
                    item={item}
                    index={i}
                    canVote={false}
                    showRankIndex={false}
                    showVoteAndLike={false}
                    ingoreShowMoreButtonClick
                  />
                );
              })}
            </div>
          </div>
        }
      />
      <CommonModal
        ref={loadingModalRef}
        title=""
        showCloseIcon={false}
        content={
          <div className="invite-modal-content flex-center pb-[24px]">
            <Loading />
          </div>
        }
      />
      <CommonModal
        ref={submitModalRef}
        title={errorMessage ? 'Oops!' : 'Congratulations!'}
        content={
          <div className="invite-modal-content">
            {errorMessage ? (
              <p className="my-[24px] className='font-14-18 text-white'">{errorMessage}</p>
            ) : (
              <div className="flex flex-col items-center">
                <SuccessSubmitIcon />
                <h2 className="font-14-18 text-white my-[24px]">
                  The list has been successfully created! It will appear on the list in a few
                  minutes.
                </h2>
              </div>
            )}

            <div className="mt-[16px]">
              <Button
                type="primary"
                onClick={() => {
                  submitModalRef.current?.close();
                  if (!errorMessage) {
                    closeCreateForm?.();
                  }
                }}
              >
                {errorMessage ? 'I See' : 'Confirm'}
              </Button>
            </div>
          </div>
        }
      />
    </div>
  );
}
