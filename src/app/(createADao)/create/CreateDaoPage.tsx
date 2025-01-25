'use client';

import { useMachine } from '@xstate/react';
import { formMachine } from './xstate';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Result } from 'antd';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import SubmitButton, { ISubmitRef } from './component/SubmitButton';
import { useSelector } from 'redux/store';
import { timesDecimals } from 'utils/calculate';
import { CommonOperationResultModalType } from 'components/CommonOperationResultModal';
import {
  BasicInfoSubmitedRes,
  EDaoGovernanceMechanism,
  FilesSubmitedRes,
  IFile,
  IGovernanceSchemeThreshold,
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
import { curChain, daoAddress, NetworkName } from 'config';
import useAelfWebLoginSync from 'hooks/useAelfWebLoginSync';
import breadCrumb from 'utils/breadCrumb';
import { FirstScreen } from './FirstScreen';
import './index.css';
import { trimAddress } from 'utils/address';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import ProgressBar from 'components/Progress';
import Button from 'components/Button';
import Navigation from './component/Navigation';
import { UseFormReturn } from 'react-hook-form';
import { toast } from 'react-toastify';
import Switch from 'components/Switch';
import { formatErrorMsg } from 'contract/util';
import { sleep } from 'utils/common';
import { getTxResult } from 'utils/getTxResult';

const CreateDaoPage = () => {
  const [snapshot, send] = useMachine(formMachine);
  const currentStep = snapshot.context.currentView.step;
  const currentStepString = currentStep.toString() as StepEnum;

  const isHighCouncilStep = currentStepString === StepEnum.step2;
  const daoCreateToken = useSelector((store) => store.daoCreate.token);
  const { isSyncQuery } = useAelfWebLoginSync();
  const submitButtonRef = useRef<ISubmitRef>(null);
  const router = useRouter();
  const isNotFirstStep = currentStep > 0;
  const [nextLoading, setNextLoading] = useState(false);

  const [isShowHighCouncil, setIsShowHighCouncil] = useState(false);
  const [isShowSecondScreen, setIsShowSecondScreen] = useState(false);

  const stepsFormMapRef = useRef<IStepsContext>(cloneDeepWith(defaultStepsFormMap));
  const { isConnected, callSendMethod } = useConnectWallet();

  const handleNextStep = () => {
    const form = stepsFormMapRef.current.stepForm[currentStepString].formInstance;
    if (form) {
      setNextLoading(true);
      form
        ?.trigger()
        .then((isValid: boolean) => {
          setNextLoading(false);
          if (isValid) {
            const values = form?.getValues();
            stepsFormMapRef.current.stepForm[currentStepString].submitedRes = values;
            send({ type: 'NEXT' });
          }
        })
        .catch((err: IFormValidateError) => {
          console.error(err);
          setNextLoading(false);
        });
    } else {
      toast.error('No registration form');
    }
  };

  const onRegisterHandler = useCallback(
    (
      ins: UseFormReturn<
        BasicInfoSubmitedRes | IGovernanceSchemeThreshold | IHighCouncilInput | FilesSubmitedRes
      >,
    ) => {
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
      await form?.trigger();
      const originMetadata = stepForm[StepEnum.step0].submitedRes;
      const socialMedia =
        Array.isArray(originMetadata?.metadata?.socialMedia) &&
        Object.fromEntries(originMetadata?.metadata?.socialMedia);
      const metadata = {
        ...originMetadata,
        metadata: {
          ...originMetadata?.metadata,
          socialMedia,
        },
        members: {
          value:
            originMetadata?.members?.value
              ?.filter((address) => address)
              ?.map((item) => trimAddress(item)) ?? [],
        },
      };

      try {
        const files: IFile[] =
          stepForm[StepEnum.step3].submitedRes?.files?.map((file) => {
            const url = new URL(file.response.url);
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
            minimalApproveThreshold: (governanceConfig?.minimalApproveThreshold || 0) * 100,
          };
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
            : metadata?.metadata?.name === NetworkName,
        };
        // highCouncil not skip
        if (isShowHighCouncil && !isMultisig) {
          let highCouncilForm = stepForm[StepEnum.step2].submitedRes;
          if (highCouncilForm && daoCreateToken?.decimals) {
            const minimalVoteThreshold =
              highCouncilForm.governanceSchemeThreshold.minimalVoteThreshold;
            highCouncilForm = {
              governanceSchemeThreshold: {
                ...highCouncilForm.governanceSchemeThreshold,
                minimalVoteThreshold: Number(
                  timesDecimals(minimalVoteThreshold, daoCreateToken.decimals),
                ),
                minimalApproveThreshold:
                  (highCouncilForm?.governanceSchemeThreshold?.minimalApproveThreshold || 0) * 100,
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
        const res = await callSendMethod({
          contractAddress: daoAddress,
          methodName: 'CreateDAO',
          args: params,
          chainId: curChain,
        });
        const result = res as IContractError;
        if (result?.error || result?.code || result?.Error) {
          throw formatErrorMsg(result);
        }

        const { transactionId, TransactionId } = result.result || result;
        const resTransactionId = TransactionId || transactionId;
        await sleep(1000);
        await getTxResult(resTransactionId!, curChain as Chain);
        emitLoading(false);
        submitButtonRef.current?.setResultModalConfig({
          open: true,
          type: CommonOperationResultModalType.Success,
          primaryContent: `${originMetadata?.metadata.name} is successfully created`,
          secondaryContent: (
            <>
              {`If you wish to modify the DAO's display information, \nyou can join the`}{' '}
              <Link
                className="text-mainColor cursor-pointer underline"
                href={'https://t.me/tmrwdao'}
                target="_blank"
              >
                Telegram group
              </Link>
              {`.`}
            </>
          ),
          footerConfig: {
            buttonList: [
              {
                children: (
                  <Link
                    className="py-2 px-[14px] w-full lg:py-[11px] lg:px-5 flex items-center justify-center border border-solid text-descM12 font-Montserrat lg:text-descM15 rounded-[42px] bg-mainColor border-mainColor text-white hover:bg-transparent hover:text-mainColor hover:border-mainColor appearence-none outline-none transition-[background,color] duration-300 ease-in-out"
                    href={`/explore`}
                    onClick={() => {
                      toast.error(
                        'created successfully, it will appear in the list in a few minutes',
                      );
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
          toast.error('Please check your internet connection and try again. ');
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
                children: (
                  <Button
                    type="danger"
                    className="w-full"
                    onClick={() => submitButtonRef.current?.initResultModalConfig()}
                  >
                    Back
                  </Button>
                ),
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
      <div className="w-full m-auto">
        <Navigation />
        <div className="mb-[15px] py-[25px] px-[30px] lg:mb-[25px] lg:px-[38px] rounded-[8px] bg-darkBg border-fillBg8 border border-solid ">
          <p className="!mb-[22px] flex items-center justify-between">
            <p className="text-h5 text-white font-Unbounded">Create your DAO</p>
            <span className="text-descM14 text-white font-Montserrat">
              <span>Step {currentStep + 1}</span>
            </span>
          </p>
          <ProgressBar percent={((currentStep + 1) / 4) * 100} />
          <div className="mt-[22px]">
            {currentStep == 0 && (
              <>
                <h2 className="text-descM15 text-white font-Montserrat mb-2">Basic Information</h2>
                <p className="text-desc12 text-lightGrey font-Montserrat">Basic Details</p>
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
                    High Council
                    <span className="ml-[10px] px-3 py-[3px] bg-fillBg8 rounded-[25px] inline-block text-descM12 font-Montserrat text-lightGrey">
                      Optional
                    </span>
                  </h2>
                  <Switch
                    disabled={isMultisig}
                    onChange={(check) => {
                      setIsShowHighCouncil(check);
                    }}
                    value={isShowHighCouncil}
                  />
                </div>
                <p className="!mb-2 text-descM13 text-white font-Montserrat">
                  A supplementary governance mechanism
                </p>
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
                'flex',
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
                <SubmitButton onConfirm={handleCreateDao} ref={submitButtonRef}>
                  <span>Submit</span>{' '}
                  <i className="tmrwdao-icon-default-arrow text-[16px] text-inherit" />
                </SubmitButton>
              ) : (
                <Button
                  type="primary"
                  className="lg:flex-none gap-2"
                  onClick={handleNextStep}
                  loading={nextLoading}
                >
                  <span>Next</span>
                  <i className="tmrwdao-icon-default-arrow text-[16px] text-inherit" />
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
