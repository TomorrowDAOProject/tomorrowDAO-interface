'use client';

import { useMachine } from '@xstate/react';
import { formMachine } from './xstate';
import { Button, Progress } from 'aelf-design';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { message as antdMessage, FormInstance, Result, Switch, Tag } from 'antd';
import { useWebLoginEvent, WebLoginEvents, useWebLogin, WebLoginState } from 'aelf-web-login';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import SubmitButton, { ISubmitRef } from './component/SubmitButton';
import { daoCreateContractRequest } from 'contract/daoCreateContract';
import useResponsive from 'hooks/useResponsive';
import { useSelector } from 'redux/store';
import { timesDecimals } from 'utils/calculate';
import { ReactComponent as ArrowRight } from 'assets/imgs/arrow-right.svg';
import { ReactComponent as ArrowLeft } from 'assets/imgs/arrow-left.svg';
import { CommonOperationResultModalType } from 'components/CommonOperationResultModal';
import {
  EDaoGovernanceMechanism,
  IFile,
  IStepsContext,
  StepEnum,
  StepsContext,
  defaultStepsFormMap,
} from './type';
import { emitLoading } from 'utils/myEvent';
import Link from 'next/link';
import { IFormValidateError, IContractError } from 'types';
import { cloneDeep, cloneDeepWith } from 'lodash-es';
import { NetworkName } from 'config';
import formValidateScrollFirstError from 'utils/formValidateScrollFirstError';
import useAelfWebLoginSync from 'hooks/useAelfWebLoginSync';
import breadCrumb from 'utils/breadCrumb';
import { FirstScreen } from './FirstScreen';
import './index.css';
import { trimAddress } from 'utils/address';

const CreateDaoPage = () => {
  const [snapshot, send] = useMachine(formMachine);
  const currentStep = snapshot.context.currentView.step;
  const currentStepString = currentStep.toString() as StepEnum;

  const isHighCouncilStep = currentStepString === StepEnum.step2;
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const daoCreateToken = useSelector((store) => store.daoCreate.token);
  const { isSyncQuery } = useAelfWebLoginSync();
  const submitButtonRef = useRef<ISubmitRef>(null);
  const router = useRouter();
  const { loginState } = useWebLogin();
  const isNotFirstStep = currentStep > 0;
  const [nextLoading, setNextLoading] = useState(false);

  const [isShowHighCouncil, setIsShowHighCouncil] = useState(false);
  const [isShowSecondScreen, setIsShowSecondScreen] = useState(false);

  const stepsFormMapRef = useRef<IStepsContext>(cloneDeepWith(defaultStepsFormMap));

  const handleNextStep = () => {
    const form = stepsFormMapRef.current.stepForm[currentStepString].formInstance;
    if (form) {
      setNextLoading(true);
      form
        ?.validateFields()
        .then((res) => {
          console.log('res', res);
          setNextLoading(false);
          stepsFormMapRef.current.stepForm[currentStepString].submitedRes = res;
          send({ type: 'NEXT' });
        })
        .catch((err: IFormValidateError) => {
          setNextLoading(false);
          formValidateScrollFirstError(form, err);
        });
    } else {
      messageApi.open({
        type: 'error',
        content: 'No registration form',
      });
    }
  };
  // const handleSkip = () => {
  //   isSkipHighCouncil.current = true;
  //   stepsFormMapRef.current.stepForm[StepEnum.step2].submitedRes = undefined;
  //   send({ type: 'NEXT' });
  // };

  const onRegisterHandler = useCallback(
    (ins: FormInstance) => {
      stepsFormMapRef.current.stepForm[currentStepString].formInstance = ins;
    },
    [currentStepString],
  );
  const isMultisig =
    stepsFormMapRef.current?.stepForm[StepEnum.step0]?.submitedRes?.governanceMechanism ===
    EDaoGovernanceMechanism.Multisig;
  const handleCreateDao = async () => {
    if (!isSyncQuery()) {
      return;
    }
    const stepForm = stepsFormMapRef.current.stepForm;
    const form = stepForm[StepEnum.step3].formInstance;
    const isNetworkDaoLocal = localStorage.getItem('is_network_dao');
    if (form) {
      const res = await form?.validateFields();
      stepForm[StepEnum.step3].submitedRes = res;
      const originMetadata = stepForm[StepEnum.step0].submitedRes;
      const originSocialMedia = (originMetadata?.metadata?.socialMedia ?? {}) as object;
      const socialMedia = Object.keys(originSocialMedia).reduce((acc, key) => {
        const k = key as keyof typeof originSocialMedia;
        if (originSocialMedia[k]) {
          acc[key] = originSocialMedia[k];
        }
        return acc;
      }, {} as Record<string, string>);
      const metadata = {
        ...originMetadata,
        members: {
          value: originMetadata?.members?.value?.map((item) => trimAddress(item)) ?? [],
        },
        metadata: {
          ...originMetadata?.metadata,
          logoUrl: originMetadata?.metadata?.logoUrl?.[0]?.response?.url,
          socialMedia,
        },
      };

      try {
        const files: IFile[] =
          stepForm[StepEnum.step3].submitedRes?.files?.map((file) => {
            const url = new URL(file.response.url);
            // const url = file.response.url;
            const id = url.pathname.split('/').pop() ?? '';
            return {
              cid: id,
              name: file.name,
              url: file.response.url,
            };
          }) ?? [];
        let governanceConfig = stepForm[StepEnum.step1].submitedRes;
        // governanceToken is exist
        if (governanceConfig && daoCreateToken && metadata.governanceToken) {
          const { minimalVoteThreshold, proposalThreshold } = governanceConfig;
          governanceConfig = cloneDeep(governanceConfig);
          governanceConfig.minimalVoteThreshold = Number(
            timesDecimals(minimalVoteThreshold, daoCreateToken.decimals),
          );
          governanceConfig.proposalThreshold = Number(
            timesDecimals(proposalThreshold, daoCreateToken.decimals),
          );
        }
        if (governanceConfig) {
          governanceConfig = {
            ...governanceConfig,
            minimalApproveThreshold: governanceConfig.minimalApproveThreshold * 100,
            maximalRejectionThreshold: governanceConfig.maximalRejectionThreshold * 100,
            maximalAbstentionThreshold: governanceConfig.maximalAbstentionThreshold * 100,
          };
          // isMultisig, it is a percentage
          if (isMultisig) {
            governanceConfig.minimalRequiredThreshold =
              governanceConfig.minimalRequiredThreshold * 100;
          }
        }
        const params: any = {
          ...metadata,
          governanceSchemeThreshold: {
            ...(governanceConfig ?? {}),
          },
          files,
          isNetworkDao: isNetworkDaoLocal
            ? isNetworkDaoLocal === 'true'
            : metadata.metadata.name === NetworkName,
        };
        // highCouncil not skip
        if (isShowHighCouncil && !isMultisig) {
          let highCouncilForm = stepForm[StepEnum.step2].submitedRes;
          if (highCouncilForm && daoCreateToken?.decimals) {
            const stakingAmount = highCouncilForm.highCouncilConfig.stakingAmount;
            const minimalVoteThreshold =
              highCouncilForm.governanceSchemeThreshold.minimalVoteThreshold;
            const stakingAmountDecimals = Number(
              timesDecimals(stakingAmount, daoCreateToken.decimals),
            );
            highCouncilForm = {
              highCouncilConfig: {
                ...highCouncilForm.highCouncilConfig,
                stakingAmount: stakingAmountDecimals,
              },
              governanceSchemeThreshold: {
                ...highCouncilForm.governanceSchemeThreshold,
                minimalRequiredThreshold:
                  highCouncilForm.governanceSchemeThreshold.minimalRequiredThreshold * 100,
                minimalVoteThreshold: Number(
                  timesDecimals(minimalVoteThreshold, daoCreateToken.decimals),
                ),
                minimalApproveThreshold:
                  highCouncilForm.governanceSchemeThreshold.minimalApproveThreshold * 100,
                maximalRejectionThreshold:
                  highCouncilForm.governanceSchemeThreshold.maximalRejectionThreshold * 100,
                maximalAbstentionThreshold:
                  highCouncilForm.governanceSchemeThreshold.maximalAbstentionThreshold * 100,
              },
              highCouncilMembers: {
                value:
                  highCouncilForm?.highCouncilMembers?.value?.map((item) => trimAddress(item)) ??
                  [],
              },
            };
          }

          params.highCouncilInput = {
            ...(highCouncilForm ?? {}),
          };
        }
        emitLoading(true, 'The transaction is being processed...');
        await daoCreateContractRequest('CreateDAO', params);
        emitLoading(false);
        submitButtonRef.current?.setResultModalConfig({
          open: true,
          type: CommonOperationResultModalType.Success,
          primaryContent: `${originMetadata?.metadata.name} Created Successfully`,
          secondaryContent: (
            <>
              Feel free to join TMRWDAO&lsquo;s
              <Link
                className="text-colorPrimary cursor-pointer px-[3px]"
                href={'https://t.me/tmrwdao'}
                target="_blank"
              >
                Telegram group
              </Link>
              to connect with the team and get assistance with tasks such as modifying the
              DAO&lsquo;s information.
            </>
          ),
          footerConfig: {
            buttonList: [
              {
                children: (
                  <Link
                    href={`/explore`}
                    onClick={() => {
                      antdMessage.open({
                        type: 'success',
                        content:
                          'created successfully, it will appear in the list in a few minutes',
                      });
                    }}
                  >
                    <span className="text-white">View My DAO</span>
                  </Link>
                ),
              },
            ],
          },
        });
      } catch (err) {
        if (typeof err === 'string') {
          antdMessage.open({
            type: 'error',
            content: 'Please check your internet connection and try again. ',
          });
          return;
        }
        const error = err as IFormValidateError | IContractError;
        // form Error
        if ('errorFields' in error) {
          return;
        }
        const message = error?.errorMessage?.message || error?.message;
        emitLoading(false);
        submitButtonRef.current?.setResultModalConfig({
          open: true,
          type: CommonOperationResultModalType.Error,
          primaryContent: 'DAO Creation Failed',
          secondaryContent: message,
          footerConfig: {
            buttonList: [
              {
                children: 'Back',
                onClick: () => {
                  submitButtonRef.current?.initResultModalConfig();
                },
              },
            ],
          },
        });
      }
    }
  };

  useWebLoginEvent(WebLoginEvents.LOGOUT, () => {
    router.push('/create');
  });

  const isLogin = loginState === WebLoginState.logined;

  useEffect(() => {
    if (isMultisig && isShowHighCouncil) {
      setIsShowHighCouncil(false);
    }
  }, [isMultisig, isShowHighCouncil]);

  useEffect(() => {
    breadCrumb.updateCreateDaoPage();
  }, []);

  return isShowSecondScreen ? (
    isLogin ? (
      <>
        <div className="page-content-bg-border  dao-steps-wrap">
          <p className="title-wrap">
            <h3 className="title">Create your DAO</h3>
            <span className="current-step-number">
              <span className="current-text">Step {currentStep + 1}</span> / 4
            </span>
          </p>
          <Progress
            percent={((currentStep + 1) / 4) * 100}
            showInfo={false}
            size={['100%', 6]}
            className="step-progress"
            strokeColor="#FA9D2B"
          />
          <div className="current-step-desc">
            {currentStep == 0 && (
              <>
                <h2 className="step-title">Basic Information</h2>
                <p className="step-subtext">Basic Details.</p>
              </>
            )}
            {currentStep == 1 && (
              <>
                <h2 className="step-title">Referendum</h2>
                <p className="step-subtitle">the primary governance mechamism</p>
              </>
            )}
            {currentStep == 2 && (
              <>
                <div className="flex justify-between">
                  <h2 className="step-title flex items-center">
                    High Council{' '}
                    {/* <Tag color="#F6F6F6" className="h-[30px] ml-2 flex-center">
                      <span className="normal-text-bold text-Neutral-Secondary-Text">Optional</span>
                    </Tag> */}
                  </h2>
                  <Switch
                    disabled={isMultisig}
                    onChange={(check) => {
                      setIsShowHighCouncil(check);
                    }}
                    value={isShowHighCouncil}
                  />
                </div>
                <p className="step-subtitle">a supplementary governance mechanism</p>
                <p className="step-subtext">
                  High Council is an optional governance choice that supplements referendum. High
                  Council members have the authority and responsibility in DAO governance.
                </p>
              </>
            )}
            {currentStep == 3 && (
              <>
                <h2 className="step-title">Docs</h2>
                <p className="step-subtext">
                  It is recommended to upload at least a white paper and a roadmap.
                </p>
              </>
            )}
          </div>
        </div>
        <div className="page-content-bg-border">
          {contextHolder}
          <StepsContext.Provider
            value={{
              ...stepsFormMapRef.current,
              onRegister: onRegisterHandler,
              isShowHighCouncil,
            }}
          >
            <div className="dao-steps-content-wrap">{snapshot.context.currentView.Component}</div>

            <div
              className={clsx(
                'flex py-6 lg:py-8 border-0 border-t border-solid border-Neutral-Divider',
                isNotFirstStep ? 'gap-3 justify-between' : 'justify-end',
                isHighCouncilStep && !isShowHighCouncil ? 'border-t-0' : '',
              )}
            >
              {isNotFirstStep && (
                <Button
                  type="primary"
                  ghost
                  className="flex-1 lg:w-40 lg:flex-none gap-2"
                  onClick={() => send({ type: 'PREVIOUS' })}
                >
                  <ArrowLeft />
                  <span>Back</span>
                </Button>
              )}

              {currentStep === 3 ? (
                <SubmitButton
                  buttonProps={{
                    type: 'primary',
                    className: 'flex-1 lg:w-40 lg:flex-none gap-2',
                  }}
                  onConfirm={handleCreateDao}
                  ref={submitButtonRef}
                >
                  <span>Submit</span>
                  <ArrowRight />
                </SubmitButton>
              ) : (
                <Button
                  type="primary"
                  className="flex-1 lg:w-40 lg:flex-none gap-2"
                  onClick={handleNextStep}
                  loading={nextLoading}
                >
                  <span>Next</span>
                  <ArrowRight />
                </Button>
              )}
            </div>
          </StepsContext.Provider>
        </div>
      </>
    ) : (
      <Result
        className="px-4 lg:px-8"
        status="warning"
        title="Please Login first before creating a DAO"
      />
    )
  ) : (
    <FirstScreen
      onClick={() => {
        setIsShowSecondScreen(true);
      }}
    />
  );
};

export default memo(CreateDaoPage);
