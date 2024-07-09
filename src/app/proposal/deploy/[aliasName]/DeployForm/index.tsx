'use client';

import { Form, message as antdMessage, message } from 'antd';
import { memo, useEffect, useState } from 'react';
import useNetworkDaoRouter from 'hooks/useNetworkDaoRouter';
import ProposalType from './ProposalType';
import ProposalInfo from './ProposalInfo';
import { IContractError, IFormValidateError, ProposalType as ProposalTypeEnum } from 'types';
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
import { curChain, daoAddress, NetworkDaoProposalOnChain, treasuryContractAddress } from 'config';
import { useRouter, useSearchParams } from 'next/navigation';
import useIsNetworkDao from 'hooks/useIsNetworkDao';
import { useRequest } from 'ahooks';
import formValidateScrollFirstError from 'utils/formValidateScrollFirstError';
import { EProposalActionTabs } from '../type';
import { callContract, callViewContract, GetTokenInfo } from 'contract/callContract';
import {
  fetchAddressTokenList,
  fetchDaoInfo,
  fetchTreasuryAssets,
  fetchVoteSchemeList,
} from 'api/request';
import { timesDecimals } from 'utils/calculate';
import { trimAddress } from 'utils/address';
import { useWebLogin } from 'aelf-web-login';
import { SkeletonForm } from 'components/Skeleton';
// import { useWalletSyncCompleted } from 'hooks/useWalletSyncCompleted';

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
  const [form] = Form.useForm();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab');
  const router = useNetworkDaoRouter();
  const [activeTab, setActiveTab] = useState(tab ?? EProposalActionTabs.TREASURY);

  const [isNext, setNext] = useState(!!tab);
  const { isNetWorkDao } = useIsNetworkDao();
  const nextRouter = useRouter();
  const [resultModalConfig, setResultModalConfig] = useState(INIT_RESULT_MODAL_CONFIG);
  const { isSyncQuery } = useAelfWebLoginSync();
  // const { getAccountInfoSync } = useWalletSyncCompleted();
  const { aliasName } = props;
  const {
    data: daoData,
    error: daoError,
    loading: daoLoading,
  } = useRequest(async () => {
    if (!aliasName) {
      message.error('aliasName is required');
      return null;
    }
    return fetchDaoInfo({ chainId: curChain, alias: aliasName });
  });
  const daoId = daoData?.data?.id;
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
            children: 'Back',
            onClick: () => {
              setResultModalConfig(INIT_RESULT_MODAL_CONFIG);
            },
          },
        ],
      },
    });
  };
  const handleNext = () => {
    const proposalType = form.getFieldValue('proposalType');
    if (proposalType === NetworkDaoProposalOnChain.label) {
      router.push(`/apply`);
    } else {
      setNext(true);
    }
  };

  const { data: addressTokenList, run: fetchTokenList } = useRequest(
    async (daoId: string) => {
      const address = await callViewContract<string, string>(
        'GetTreasuryAccountAddress',
        daoId,
        treasuryContractAddress,
      );
      if (!address) {
        return null;
      }
      return fetchAddressTokenList(
        {
          address,
        },
        curChain,
      );
    },
    {
      manual: true,
    },
  );
  const treasuryAssetsData = addressTokenList?.data;
  const { wallet } = useWebLogin();
  useEffect(() => {
    if (daoId && wallet.address) {
      fetchTokenList(daoId);
    }
  }, [daoId, fetchTokenList, wallet.address]);
  const handleSubmit = async () => {
    try {
      if (!isSyncQuery()) {
        return;
      }
      if (!daoId) {
        openErrorModal();
        return;
      }
      const res = await form.validateFields();
      emitLoading(true, 'Publishing the proposal...');
      const voteSchemeList = await fetchVoteSchemeList({ chainId: curChain, daoId: daoId });
      const voteSchemeId = voteSchemeList?.data?.voteSchemeList?.[0]?.voteSchemeId;
      if (!voteSchemeId) {
        message.error('The voting scheme for this DAO cannot be found');
        emitLoading(false);
        return;
      }
      const basicInfo = {
        ...res.proposalBasicInfo,
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
        const { removeMembers, addMembers, removeHighCouncils, addHighCouncils, ...restRes } = res;
        const contractParams = {
          ...restRes,
          proposalBasicInfo: {
            ...basicInfo,
          },
        };
        if (res.proposalType === ProposalTypeEnum.GOVERNANCE) {
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
        }
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
              children: 'OK',
              onClick: () => {
                antdMessage.open({
                  type: 'success',
                  content: 'created successfully, it will appear in the list in a few minutes',
                });
                nextRouter.push(isNetWorkDao ? `/network-dao` : `/dao/${aliasName}`);
              },
            },
          ],
          childrenNode: (
            // <Link
            //   href={`/proposal/${createRes.proposalId}`}
            //   className="color-[colorPrimary] font-500 leading-[22px] text-[14px] "
            // >
            //   View Proposal Details
            // </Link>
            <span></span>
          ),
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
        formValidateScrollFirstError(form, error);
        return;
      }
      const message = error?.errorMessage?.message || error?.message;
      emitLoading(false);
      openErrorModal(undefined, message);
    }
  };

  return (
    <div className="deploy-proposal-form mt-[24px] mb-[24px]">
      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
        requiredMark={false}
        scrollToFirstError={true}
        onValuesChange={(changedValues) => {
          if (changedValues?.transaction?.to_address) {
            form.setFieldValue(['transaction', 'contractMethodName'], '');
            form.setFieldValue(['transaction', 'params'], '');
          }
        }}
      >
        <ProposalType className={clsx({ hidden: isNext })} next={handleNext} />
        {daoLoading && isNext ? (
          <SkeletonForm />
        ) : (
          daoId && (
            <ProposalInfo
              className={clsx({ hidden: !isNext })}
              daoData={daoData?.data}
              daoId={daoId}
              onSubmit={handleSubmit}
              onTabChange={(key: string) => {
                setActiveTab(key);
              }}
              activeTab={activeTab}
              treasuryAssetsData={treasuryAssetsData}
              daoDataLoading={daoLoading}
            />
          )
        )}
      </Form>
      <CommonOperationResultModal
        {...resultModalConfig}
        onCancel={() => {
          setResultModalConfig(INIT_RESULT_MODAL_CONFIG);
        }}
      />
    </div>
  );
};

export default memo(GovernanceModel);
