'use client';

import { useMachine } from '@xstate/react';
import { formMachine } from './xstate';
import { ReactComponent as LinkIcon } from 'assets/revamp-icon/link.svg';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { message as antdMessage, FormInstance, Result, Switch, Tag } from 'antd';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import SubmitButton, { ISubmitRef } from './component/SubmitButton';
import { daoCreateContractRequest } from 'contract/daoCreateContract';
import { useSelector } from 'redux/store';
import { timesDecimals } from 'utils/calculate';
import { ReactComponent as ArrowRight } from 'assets/imgs/arrow-right.svg';
import { ReactComponent as ArrowLeft } from 'assets/imgs/arrow-left.svg';
import { CommonOperationResultModalType } from 'components/CommonOperationResultModal';
import {
  EDaoGovernanceMechanism,
  IFile,
  IHighCouncilInput,
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
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import ProgressBar from 'components/Progress';
import Button from 'components/Button';
import Navigation from './component/Navigation';

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
  const isNotFirstStep = currentStep > 0;
  const [nextLoading, setNextLoading] = useState(false);

  const [isShowHighCouncil, setIsShowHighCouncil] = useState(false);
  const [isShowSecondScreen, setIsShowSecondScreen] = useState(false);

  const stepsFormMapRef = useRef<IStepsContext>(cloneDeepWith(defaultStepsFormMap));
  const { isConnected } = useConnectWallet();

  const handleNextStep = () => {
    const form = stepsFormMapRef.current.stepForm[currentStepString].formInstance;
    if (form) {
      setNextLoading(true);
      form
        ?.validateFields()
        .then((res) => {
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
          const { minimalVoteThreshold } = governanceConfig;
          governanceConfig = cloneDeep(governanceConfig);
          governanceConfig.minimalVoteThreshold = Number(
            timesDecimals(minimalVoteThreshold, daoCreateToken.decimals),
          );
        }
        if (governanceConfig) {
          governanceConfig = {
            ...governanceConfig,
            minimalApproveThreshold: governanceConfig.minimalApproveThreshold * 100,
            // maximalRejectionThreshold: governanceConfig.maximalRejectionThreshold * 100,
            // maximalAbstentionThreshold: governanceConfig.maximalAbstentionThreshold * 100,
          };
          // isMultisig, it is a percentage
          // if (isMultisig) {
          //   governanceConfig.minimalRequiredThreshold =
          //     governanceConfig.minimalRequiredThreshold * 100;
          // }
        }
        // eslint-disable-next-line prefer-const
        let { proposalThreshold, ...restGovernanceConfig } = governanceConfig ?? {};
        if (daoCreateToken && proposalThreshold) {
          proposalThreshold = Number(timesDecimals(proposalThreshold, daoCreateToken.decimals));
        }
        const params: any = {
          ...metadata,
          proposalThreshold,
          governanceSchemeThreshold: {
            ...(restGovernanceConfig ?? {}),
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
            // const stakingAmount = 1;
            const minimalVoteThreshold =
              highCouncilForm.governanceSchemeThreshold.minimalVoteThreshold;
            // const stakingAmountDecimals = Number(
            //   timesDecimals(stakingAmount, daoCreateToken.decimals),
            // );
            highCouncilForm = {
              // highCouncilConfig: {
              //   maxHighCouncilMemberCount: 10000,
              //   stakingAmount: stakingAmountDecimals,
              //   electionPeriod: Number.MAX_SAFE_INTEGER,
              //   maxHighCouncilCandidateCount: 10000,
              // },
              governanceSchemeThreshold: {
                ...highCouncilForm.governanceSchemeThreshold,
                // minimalRequiredThreshold:
                //   highCouncilForm.governanceSchemeThreshold.minimalRequiredThreshold * 100,
                minimalVoteThreshold: Number(
                  timesDecimals(minimalVoteThreshold, daoCreateToken.decimals),
                ),
                minimalApproveThreshold:
                  highCouncilForm.governanceSchemeThreshold.minimalApproveThreshold * 100,
                // maximalRejectionThreshold:
                //   highCouncilForm.governanceSchemeThreshold.maximalRejectionThreshold * 100,
                // maximalAbstentionThreshold:
                //   highCouncilForm.governanceSchemeThreshold.maximalAbstentionThreshold * 100,
              },
              highCouncilMembers: {
                value:
                  highCouncilForm?.highCouncilMembers?.value?.map((item) => trimAddress(item)) ??
                  [],
              },
            } as IHighCouncilInput;
          }

          params.highCouncilInput = {
            isHighCouncilElectionClose: true,
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
              Feel free to join Tomorrow DAO&apos;s{' '}
              <Link
                className="text-colorPrimary cursor-pointer"
                href={'https://t.me/tmrwdao'}
                target="_blank"
              >
                Telegram group
              </Link>{' '}
              to connect with the team and receive timely assistance
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

  useEffect(() => {
    if (!isConnected) {
      router.push('/create');
    }
  }, [isConnected, router]);

  useEffect(() => {
    if (isMultisig && isShowHighCouncil) {
      setIsShowHighCouncil(false);
    }
  }, [isMultisig, isShowHighCouncil]);

  useEffect(() => {
    breadCrumb.updateCreateDaoPage();
  }, []);

  return isShowSecondScreen ? (
    isConnected ? (
      <div className="w-full">
        <Navigation />
        <div className="mb-[15px] py-[25px] px-[30px] lg:mb-[25px] lg:px-[38px] rounded-[8px] bg-darkBg border-fillBg8 border border-solid ">
          <p className="!mb-[22px] flex items-center justify-between">
            <p className="text-h5 text-white font-Unbounded">Create your DAO</p>
            <span className="text-descM14 text-white font-Montserrat">
              <span>Step {currentStep + 1}</span> / 4
            </span>
          </p>
          <ProgressBar percent={((currentStep + 1) / 4) * 100} />
          <div className="mt-[22px]">
            {currentStep == 0 && (
              <>
                <h2 className="text-descM15 text-white font-Montserrat mb-2">Basic Information</h2>
                <p className="text-desc12 text-lightGrey font-Montserrat">Basic Details.</p>
              </>
            )}
            {currentStep == 1 && (
              <>
                <h2 className="text-descM15 text-white font-Montserrat mb-2">Referendum</h2>
                <p className="text-desc12 text-lightGrey font-Montserrat">
                  The primary governance mechanism
                </p>
              </>
            )}
            {currentStep == 2 && (
              <>
                <div className="flex justify-between">
                  <h2 className="text-descM15 text-white mb-2 flex items-center">
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
                <p className="step-subtitle">A supplementary governance mechanism</p>
                <p className="text-desc12 text-lightGrey font-Montserrat">
                  High Council is an optional governance mechanism that supplements Referendum. High
                  Council members are granted authority and the responsibility to partake in DAO
                  governance.
                </p>
              </>
            )}
            {currentStep == 3 && (
              <>
                <h2 className="text-descM15 text-white mb-2">Docs</h2>
                <p className="text-desc12 text-lightGrey font-Montserrat">
                  It is recommended to upload at least a project whitepaper and roadmap
                </p>
              </>
            )}
          </div>
        </div>
        <div className="py-[25px] px-[30px] lg:mb-[25px] lg:px-[38px] rounded-[8px] bg-darkBg border-fillBg8 border border-solid">
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
                'flex py-6 lg:py-8',
                isNotFirstStep ? 'gap-3 justify-between' : 'justify-end',
                isHighCouncilStep && !isShowHighCouncil ? 'border-t-0' : '',
              )}
            >
              {isNotFirstStep && (
                <Button
                  type="primary"
                  className="lg:flex-none gap-2 border border-white bg-transparent hover:border-white hover:text-white"
                  onClick={() => send({ type: 'PREVIOUS' })}
                >
                  Back
                </Button>
              )}

              {currentStep === 3 ? (
                <SubmitButton
                  buttonProps={{
                    type: 'primary',
                    className: 'lg:flex-none gap-2',
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
                  className="lg:flex-none gap-2"
                  onClick={handleNextStep}
                  loading={nextLoading}
                >
                  <span>Next</span>
                  <LinkIcon className="h-[11px] w-[11px]" />
                </Button>
              )}
            </div>
          </StepsContext.Provider>
        </div>
      </div>
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
