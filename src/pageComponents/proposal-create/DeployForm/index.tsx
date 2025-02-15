'use client';

import { memo, useEffect, useState } from 'react';
import useNetworkDaoRouter from 'hooks/useNetworkDaoRouter';
import ProposalInfo from './ProposalInfo';
import { IContractError, ProposalType as ProposalTypeEnum } from 'types';
import clsx from 'clsx';
import CommonOperationResultModal, {
  CommonOperationResultModalType,
  TCommonOperationResultModalProps,
} from 'components/CommonOperationResultModal';
import { proposalCreateContractRequest } from 'contract/proposalCreateContract';
import useAelfWebLoginSync from 'hooks/useAelfWebLoginSync';
import { emitLoading } from 'utils/myEvent';
import { parseJSON, uint8ToBase64 } from 'utils/parseJSON';
import { getContract } from '../util';
import { curChain, daoAddress, NetworkDaoProposalOnChain } from 'config';
import { useRouter, useSearchParams } from 'next/navigation';
import useIsNetworkDao from 'hooks/useIsNetworkDao';
import { useRequest } from 'ahooks';
import { ActiveStartTimeEnum, EProposalActionTabs } from '../type';
import { GetTokenInfo } from 'contract/callContract';
import {
  fetchAddressTokenList,
  fetchDaoInfo,
  fetchTokenIssue,
  fetchVoteSchemeList,
} from 'api/request';
import { timesDecimals } from 'utils/calculate';
import { trimAddress } from 'utils/address';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import { replaceUrlParams } from 'utils/url';
import dayjs from 'dayjs';
import { proposalTypeList } from 'types';
import Button from 'components/Button';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import Breads from 'components/Breads';
import FormItem from 'components/FormItem';
import Select from 'components/Select';

const convertParams = async (address: string, methodName: string, originParams: any) => {
  const contractInfo = await getContract(address);
  const method = contractInfo[methodName];
  let decoded;
  if (Array.isArray(originParams)) {
    decoded = method.packInput([...originParams]);
  } else if (typeof originParams === 'object' && originParams !== null) {
    decoded = method.packInput(JSON.parse(JSON.stringify(originParams)));
  } else {
    decoded = method.packInput(originParams);
  }
  const finalParams = uint8ToBase64(decoded || []) || [];
  return finalParams;
};
enum ETokenOrigin {
  TokenContract = 1,
  SymbolMarket = 2,
}
interface IGovernanceModelProps {
  aliasName: string;
}
type TResultModalConfig = Pick<
  TCommonOperationResultModalProps,
  'open' | 'type' | 'primaryContent' | 'secondaryContent' | 'footerConfig'
>;
const INIT_RESULT_MODAL_CONFIG: TResultModalConfig = {
  open: false,
  type: CommonOperationResultModalType.Success,
  primaryContent: '',
  secondaryContent: '',
};
const GovernanceModel = (props: IGovernanceModelProps) => {
  const form = useForm({
    defaultValues: {
      proposalType: ProposalTypeEnum.GOVERNANCE,
      treasury: {
        recipient: '',
        amountInfo: {
          symbol: '',
          amount: '',
        },
      },
      transaction: {
        params: '{}',
        toAddress: '',
        to_address: '',
        contractMethodName: '',
      },
      removeMembers: {
        value: [],
      },
      addMembers: {
        value: [''],
      },
      removeHighCouncils: {
        value: [],
      },
      addHighCouncils: {
        value: [''],
      },
      issueObj: { symbol: '', to: '', decimals: '', amount: 0 },
      proposalBasicInfo: {
        proposalTitle: '',
        proposalDescription: '',
        schemeAddress: '',
        activeStartTime: 1,
        activeEndTime: [0, 0, 1],
      },
      banner: '',
      options: [''],
    },
    mode: 'onChange',
  });
  const {
    watch,
    control,
    formState: { errors },
    trigger,
    setValue,
    getValues,
  } = form;
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab');
  const router = useNetworkDaoRouter();
  const [activeTab, setActiveTab] = useState(tab ?? EProposalActionTabs.TREASURY);

  const [isValidating, setIsValidating] = useState(false);
  const [isNext, setNext] = useState(!!tab);
  const { isNetWorkDao } = useIsNetworkDao();
  const nextRouter = useRouter();
  const [resultModalConfig, setResultModalConfig] = useState(INIT_RESULT_MODAL_CONFIG);
  const { isSyncQuery } = useAelfWebLoginSync();
  const { aliasName } = props;
  const { data: daoData, loading: daoLoading } = useRequest(async () => {
    if (!aliasName) {
      toast.error('aliasName is required');
      return null;
    }
    return fetchDaoInfo({ chainId: curChain, alias: aliasName });
  });
  const daoId = daoData?.data?.id;

  const to_address = watch('transaction.to_address');

  useEffect(() => {
    setValue('transaction.contractMethodName', '');
    setValue('transaction.params', '');
  }, [setValue, to_address]);

  const openErrorModal = (
    primaryContent = 'Failed to Create the proposal',
    secondaryContent = 'Failed to Create the proposal',
  ) => {
    setResultModalConfig({
      open: true,
      type: CommonOperationResultModalType.Error,
      primaryContent: primaryContent,
      secondaryContent: secondaryContent,
      footerConfig: {
        buttonList: [
          {
            children: (
              <Button
                type="danger"
                className="w-full"
                onClick={() => setResultModalConfig(INIT_RESULT_MODAL_CONFIG)}
              >
                Back
              </Button>
            ),
          },
        ],
      },
    });
  };
  const handleNext = () => {
    const proposalType = getValues('proposalType');
    if (proposalType === NetworkDaoProposalOnChain.label) {
      router.push(`/apply`);
    } else {
      setNext(true);
    }
  };

  const { data: addressTokenList, run: fetchTokenList } = useRequest(
    async (daoId: string) => {
      return fetchAddressTokenList({
        daoId: daoId ?? '',
        chainId: curChain,
        maxResultCount: 1000,
        skipCount: 0,
      });
    },
    {
      manual: true,
    },
  );
  const treasuryAssetsData = addressTokenList?.data;
  const { walletInfo: wallet } = useConnectWallet();
  useEffect(() => {
    if (daoId) {
      fetchTokenList(daoId);
    }
  }, [daoId, fetchTokenList, wallet?.address]);

  const handleSubmit = async () => {
    try {
      if (!isSyncQuery()) {
        return;
      }
      if (!daoId) {
        openErrorModal();
        return;
      }
      const result = await trigger();
      if (!result) return;
      setIsValidating(true);
      const res = getValues();
      emitLoading(true, 'Publishing the proposal...');
      const voteSchemeList = await fetchVoteSchemeList({ chainId: curChain, daoId: daoId });
      setIsValidating(false);
      const voteSchemeId = voteSchemeList?.data?.voteSchemeList?.[0]?.voteSchemeId;
      if (!voteSchemeId) {
        toast.error('The voting scheme for this DAO cannot be found');
        emitLoading(false);
        return;
      }
      let proposalBasicInfo = res.proposalBasicInfo;
      let timeParams = {};
      const activeStartTime =
        proposalBasicInfo.activeStartTime === ActiveStartTimeEnum.now
          ? Date.now()
          : proposalBasicInfo.activeStartTime;
      const duration = proposalBasicInfo.activeEndTime;
      const activeEndTime = Array.isArray(duration)
        ? dayjs(activeStartTime)
            .add(duration[0], 'minutes')
            .add(duration[1], 'hours')
            .add(duration[2], 'days')
            .valueOf()
        : duration;
      // if start time is now, convert to period
      if (proposalBasicInfo.activeStartTime === ActiveStartTimeEnum.now) {
        timeParams = {
          activeTimePeriod: Math.floor((activeEndTime - activeStartTime) / 1000),
          activeStartTime: 0,
          activeEndTime: 0,
        };
      } else {
        timeParams = {
          activeTimePeriod: 0,
          activeStartTime: Math.floor(activeStartTime / 1000),
          activeEndTime: Math.floor(activeEndTime / 1000),
        };
      }
      proposalBasicInfo = {
        ...proposalBasicInfo,
        ...timeParams,
      };
      const basicInfo = {
        ...proposalBasicInfo,
        daoId,
        voteSchemeId,
      };
      if (
        activeTab === EProposalActionTabs.TREASURY &&
        res.proposalType === ProposalTypeEnum.GOVERNANCE
      ) {
        const tokenInfo = await GetTokenInfo(
          {
            symbol: res.treasury.amountInfo.symbol,
          },
          { chain: curChain },
        );
        const contractParams = {
          proposalBasicInfo: basicInfo,
          recipient: res.treasury.recipient,
          symbol: res.treasury.amountInfo.symbol,
          amount: timesDecimals(res.treasury.amountInfo.amount, tokenInfo.decimals).toNumber(),
        };
        await proposalCreateContractRequest('CreateTransferProposal', contractParams);
      } else {
        const {
          removeMembers,
          addMembers,
          removeHighCouncils,
          addHighCouncils,
          proposalType,
          issueObj,
          ...restRes
        } = res;
        const contractParams = {
          proposalType,
          proposalBasicInfo: {
            ...basicInfo,
          },
          transaction: {},
        };
        if (res.proposalType === ProposalTypeEnum.GOVERNANCE) {
          console.log('activeTab', activeTab);
          if (activeTab === EProposalActionTabs.IssueToken) {
            const { symbol, to, decimals } = issueObj;
            let { amount } = issueObj;
            amount = timesDecimals(amount, decimals).toNumber();
            const issueRes = await fetchTokenIssue({
              symbol: symbol,
              chainId: curChain,
            });
            // SYFFABC
            if (issueRes.data.tokenOrigin === ETokenOrigin.TokenContract) {
              const params = { symbol, amount, to, memo: '' };
              const finalParams = await convertParams(
                issueRes.data.tokenContractAddress,
                'Issue',
                params,
              );
              contractParams.transaction = {
                toAddress: issueRes.data.tokenContractAddress,
                contractMethodName: 'Issue',
                params: finalParams,
              };
            } else if (issueRes.data.tokenOrigin === ETokenOrigin.SymbolMarket) {
              const params = { symbol, amount, to, memo: '' };
              const tokenContractParams = await convertParams(
                issueRes.data.tokenContractAddress,
                'Issue',
                params,
              );
              const finalParams = await convertParams(
                issueRes.data.proxyAccountContractAddress,
                'ForwardCall',
                {
                  proxyAccountHash: issueRes.data.proxyAccountHash,
                  contractAddress: issueRes.data.tokenContractAddress,
                  methodName: 'Issue',
                  args: tokenContractParams,
                },
              );
              contractParams.transaction = {
                toAddress: issueRes.data.proxyAccountContractAddress,
                contractMethodName: 'ForwardCall',
                params: finalParams,
              };
            }
          }
          if (activeTab === EProposalActionTabs.CUSTOM_ACTION) {
            const params = res.transaction.params;
            const parsedParams = parseJSON(params);
            const finalParams = await convertParams(
              res.transaction.toAddress,
              res.transaction.contractMethodName,
              parsedParams,
            );
            contractParams.transaction = {
              ...res.transaction,
              params: finalParams,
            };
          }
          if (activeTab === EProposalActionTabs.AddMultisigMembers) {
            const params = {
              daoId: daoId,
              addMembers: {
                value: addMembers.value.map((address: string) => trimAddress(address)),
              },
            };

            const finalParams = await convertParams(daoAddress, 'AddMember', params);
            contractParams.transaction = {
              toAddress: daoAddress,
              contractMethodName: 'AddMember',
              params: finalParams,
            };
          }
          if (activeTab === EProposalActionTabs.DeleteMultisigMembers) {
            const params = {
              daoId: daoId,
              removeMembers: {
                value: removeMembers.value.map((address: string) => trimAddress(address)),
              },
            };
            const finalParams = await convertParams(daoAddress, 'RemoveMember', params);
            contractParams.transaction = {
              toAddress: daoAddress,
              contractMethodName: 'RemoveMember',
              params: finalParams,
            };
          }
          if (activeTab === EProposalActionTabs.AddHcMembers) {
            const params = {
              daoId: daoId,
              addHighCouncils: {
                value: addHighCouncils.value.map((address: string) => trimAddress(address)),
              },
            };
            const finalParams = await convertParams(daoAddress, 'AddHighCouncilMembers', params);
            contractParams.transaction = {
              toAddress: daoAddress,
              contractMethodName: 'AddHighCouncilMembers',
              params: finalParams,
            };
          }
          if (activeTab === EProposalActionTabs.DeleteHcMembers) {
            const params = {
              daoId: daoId,
              removeHighCouncils: {
                value: removeHighCouncils.value.map((address: string) => trimAddress(address)),
              },
            };
            const finalParams = await convertParams(daoAddress, 'RemoveHighCouncilMembers', params);
            contractParams.transaction = {
              toAddress: daoAddress,
              contractMethodName: 'RemoveHighCouncilMembers',
              params: finalParams,
            };
          }
        }
        console.log('contractParams', contractParams);
        const methodName =
          res.proposalType === ProposalTypeEnum.VETO ? 'CreateVetoProposal' : 'CreateProposal';
        await proposalCreateContractRequest(methodName, contractParams);
      }
      emitLoading(false);
      setResultModalConfig({
        open: true,
        type: CommonOperationResultModalType.Success,
        primaryContent: 'Proposal Published',
        secondaryContent: (
          <>
            {res.proposalBasicInfo.proposalTitle}:{res.proposalBasicInfo.proposalDescription}
          </>
        ),
        footerConfig: {
          buttonList: [
            {
              children: (
                <Button
                  type="primary"
                  className="w-full"
                  onClick={() => {
                    toast.success(
                      'created successfully, it will appear in the list in a few minutes',
                    );
                    nextRouter.push(isNetWorkDao ? `/network-dao` : `/dao/${aliasName}`);
                  }}
                >
                  OK
                </Button>
              ),
            },
          ],
        },
      });
    } catch (err) {
      setIsValidating(false);
      if (typeof err === 'string') {
        toast.error('Please check your internet connection and try again. ');
        return;
      }
      const error = err as IContractError;
      // form Error
      const message = error?.errorMessage?.message || error?.message;
      emitLoading(false);
      openErrorModal(undefined, message);
    }
  };

  return (
    <>
      <Breads className="mb-[27px] mt-[24px] md:mt-[67px]" />
      <div className="py-[25px] px-[22px] md:px-[30px] lg:mb-[25px] lg:px-[38px] rounded-[8px] bg-darkBg border-fillBg8 border border-solid">
        {!isNext ? (
          <form>
            <FormItem
              label={
                <>
                  <span className="mb-[50px] block text-[20px] font-Unbounded font-light text-white">
                    Choose Proposal Type
                  </span>
                  <span className="text-lightGrey text-descM15 font-Montserrat">
                    When creating a proposal, please choose the appropriate type based on its
                    impact.
                  </span>
                </>
              }
              errorText={errors?.proposalType?.message}
            >
              <Controller
                name="proposalType"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select
                    {...field}
                    value={field.value as string}
                    overlayClassName="!py-3"
                    overlayItemClassName="flex flex-col gap-2 !py-3 text-white text-descM16 font-Montserrat"
                    options={proposalTypeList}
                    isError={!!errors?.proposalType?.message}
                    onChange={(option) => field.onChange(option.value)}
                  />
                )}
              />
            </FormItem>
            <div className="flex justify-end">
              <Button type="primary" onClick={handleNext}>
                Continue
                <i className="ml-[10px] tmrwdao-icon-default-arrow text-[16px] text-inherit" />
              </Button>
            </div>
          </form>
        ) : daoId ? (
          <ProposalInfo
            form={form}
            isValidating={isValidating}
            className={clsx({ hidden: !isNext })}
            daoData={daoData?.data}
            daoId={daoId}
            onSubmit={handleSubmit}
            onTabChange={(key: string) => {
              replaceUrlParams('tab', key);
              setActiveTab(key);
            }}
            activeTab={activeTab}
            treasuryAssetsData={treasuryAssetsData?.data}
            daoDataLoading={daoLoading}
          />
        ) : null}
      </div>
      <CommonOperationResultModal
        {...resultModalConfig}
        onCancel={() => {
          setResultModalConfig(INIT_RESULT_MODAL_CONFIG);
        }}
      />
    </>
  );
};

export default memo(GovernanceModel);
