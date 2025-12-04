import React from 'react';
import { useEffect, useMemo, useState } from 'react';
import Editor from '@monaco-editor/react';
import { EProposalActionTabs } from '../../type';
import { useAsyncEffect } from 'ahooks';
import { fetchContractInfo } from 'api/request';
import { curChain } from 'config';
import AmountInput from './FormAmountInput';
import './index.css';
import BigNumber from 'bignumber.js';
import Symbol from 'components/Symbol';
import { EDaoGovernanceMechanism } from 'app/(createADao)/create/type';
import DeleteMultisigMembers from './TabContent/DeleteMultisigMembers';
import AddMultisigMembers from './TabContent/AddMultisigMembers';
import DeleteHCMembers from './TabContent/DeleteHCMembers';
import AddHCMembers from './TabContent/AddHCMembers';
import ErrorBoundary from 'components/ErrorBoundary';
import { divDecimals } from 'utils/calculate';
import IssueToken from './TabContent/IssueToken';
import { Controller } from 'react-hook-form';
import FormItem from 'components/FormItem';
import Select from 'components/Select';
import Input from 'components/Input';
import CustomTabs, { TabItem } from 'components/CustomTabs';

interface IActionTabsProps {
  form: any;
  daoId: string;
  activeTab?: string;
  daoData?: IDaoInfoData;
  treasuryAssetsData?: ITreasuryAssetsResponseDataItem[];
  onTabChange?: (activeKey: string) => void;
}
// const emptyTabItem = (...([]));
export default function TabsCom(props: IActionTabsProps) {
  const { form, daoId, daoData, activeTab, treasuryAssetsData, onTabChange } = props;
  const {
    watch,
    setValue,
    getValues,
    control,
    formState: { errors },
  } = form;
  const contractAddress = watch('transaction.toAddress');
  const addHighCouncilsValue = watch('addHighCouncils.value') ?? [];

  const [contractInfo, setContractInfo] = useState<IContractInfoListData>();
  const contractInfoOptions = useMemo(() => {
    return contractInfo?.contractInfoList.map((item) => {
      return {
        label: item.contractName,
        value: item.contractAddress,
      };
    });
  }, [contractInfo]);
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
  const selectOptions = useMemo(() => {
    return (
      treasuryAssetsData?.map((item) => {
        return {
          label: <Symbol symbol={item.symbol} />,
          value: item.symbol,
        };
      }) ?? []
    );
  }, [treasuryAssetsData]);
  useEffect(() => {
    if (selectOptions.length) {
      setValue('treasury.amountInfo.symbol', selectOptions?.[0]?.value);
    }
  }, [selectOptions, setValue]);
  useAsyncEffect(async () => {
    const contractInfo = await fetchContractInfo({
      chainId: curChain,
      daoId: daoId,
      governanceMechanism: daoData?.governanceMechanism,
    });
    setContractInfo(contractInfo.data);
  }, [daoId]);
  // reset Method Name if Contract Address change
  useEffect(() => {
    const methodName = getValues('transaction.contractMethodName');
    if (!contractInfo?.contractInfoList.includes(methodName)) {
      setValue('transaction.contractMethodName', undefined);
    }
  }, [contractAddress, contractInfo, getValues, setValue]);

  const tabItems: TabItem[] = useMemo(() => {
    const initItems = [
      treasuryAssetsData?.length
        ? {
            label: 'Withdraw Assets',
            icon: <i className="tmrwdao-icon-wallet text-[16px]" />,
            key: EProposalActionTabs.TREASURY,
          }
        : {},
      daoData?.governanceMechanism === EDaoGovernanceMechanism.Multisig
        ? {
            label: 'Add Multisig Members',
            icon: <i className="tmrwdao-icon-circle-add text-[16px]" />,
            key: EProposalActionTabs.AddMultisigMembers,
          }
        : {},
      daoData?.governanceMechanism === EDaoGovernanceMechanism.Multisig
        ? {
            label: 'Delete Multisig Members',
            icon: <i className="tmrwdao-icon-delete text-[16px]" />,
            key: EProposalActionTabs.DeleteMultisigMembers,
          }
        : {},
      daoData?.governanceMechanism === EDaoGovernanceMechanism.Multisig
        ? {
            label: 'Issue Token',
            icon: <i className="tmrwdao-icon-issue-token text-[16px]" />,
            key: EProposalActionTabs.IssueToken,
          }
        : {},
      daoData?.governanceMechanism === EDaoGovernanceMechanism.Token && daoData.isHighCouncilEnabled
        ? {
            label: 'Add HC Members',
            icon: <i className="tmrwdao-icon-circle-add text-[16px]" />,
            key: EProposalActionTabs.AddHcMembers,
          }
        : {},
      daoData?.governanceMechanism === EDaoGovernanceMechanism.Token && daoData.isHighCouncilEnabled
        ? {
            label: 'Delete HC Members',
            icon: <i className="tmrwdao-icon-delete text-[16px]" />,
            key: EProposalActionTabs.DeleteHcMembers,
          }
        : {},
      {
        label: 'Custom Action',
        icon: <i className="tmrwdao-icon-custom text-[16px]" />,
        key: EProposalActionTabs.CUSTOM_ACTION,
      },
    ];
    return initItems.filter((item) => item.label) as TabItem[];
  }, [treasuryAssetsData, daoData?.governanceMechanism, daoData?.isHighCouncilEnabled]);

  useEffect(() => {
    const keys = tabItems?.map((item) => item.key);
    if (activeTab && !keys?.includes(activeTab) && tabItems?.[0]?.key) {
      onTabChange?.(tabItems?.[0]?.key);
    }
  }, [tabItems, activeTab, onTabChange]);

  return (
    <>
      <CustomTabs activeKey={activeTab} onChange={onTabChange} items={tabItems} />
      <div className="mt-[30px]">
        {activeTab === EProposalActionTabs.TREASURY && (
          <>
            <FormItem
              label="Recipient"
              className="!mb-[30px]"
              errorText={errors?.treasury?.recipient?.message}
            >
              <Controller
                name="treasury.recipient"
                control={control}
                rules={{
                  required: 'The recipient is required',
                  validate: {
                    validAddress: (value) => {
                      if (value.endsWith('AELF')) {
                        return 'Must be a SideChain address';
                      }
                      if (!value.startsWith('ELF') || !value.endsWith(curChain)) {
                        return 'Must be a valid address';
                      }
                      return true;
                    },
                  },
                }}
                render={({ field }) => (
                  <>
                    <Input
                      {...field}
                      placeholder={`Enter ELF_..._${curChain}`}
                      isError={!!errors?.treasury?.recipient?.message}
                    />
                    <span className="mt-[6px] text-descM11 text-lightGrey">
                      The wallet that receives the tokens.
                    </span>
                  </>
                )}
              />
            </FormItem>

            <FormItem
              label="Amount"
              className="!mb-[30px]"
              errorText={errors?.treasury?.amountInfo?.message}
            >
              <Controller
                name="treasury.amountInfo"
                control={control}
                rules={{
                  validate: {
                    required: (value) => {
                      if (!value || typeof value.amount !== 'number') {
                        return 'The amount is required';
                      }
                      if (value.amount <= 0) {
                        return 'The amount must be greater than 0';
                      }
                      if (typeof value.symbol !== 'string') {
                        return 'The symbol is required';
                      }
                      return true;
                    },
                    validateAmount: (value) => {
                      const { amount, symbol } = value;
                      const symbolInfo = treasuryAssetsData?.find((item) => item.symbol === symbol);
                      if (!symbolInfo) {
                        return 'The symbol is invalid';
                      }
                      const amountWithDecimals = BigNumber(amount);
                      const decimalPlaces = amountWithDecimals.decimalPlaces();
                      if (decimalPlaces && decimalPlaces > symbolInfo.decimal) {
                        return `The maximum number of decimal places is ${symbolInfo.decimal}`;
                      }
                      if (
                        amountWithDecimals.gt(divDecimals(symbolInfo.amount, symbolInfo.decimal))
                      ) {
                        return 'The withdrawal amount should be less than the available treasury assets.';
                      }
                      return true;
                    },
                  },
                }}
                render={({ field }) => (
                  <AmountInput
                    {...field}
                    daoId={daoId}
                    selectOptions={selectOptions}
                    treasuryAssetsData={treasuryAssetsData}
                  />
                )}
              />
            </FormItem>
          </>
        )}
        {activeTab === EProposalActionTabs.IssueToken && <IssueToken form={form} />}
        {activeTab === EProposalActionTabs.AddHcMembers && (
          <AddHCMembers form={form} addHighCouncilsValue={addHighCouncilsValue} />
        )}
        {activeTab === EProposalActionTabs.DeleteHcMembers && (
          <DeleteHCMembers daoId={daoId} form={form} />
        )}
        {activeTab === EProposalActionTabs.AddMultisigMembers && <AddMultisigMembers form={form} />}
        {activeTab === EProposalActionTabs.DeleteMultisigMembers && (
          <DeleteMultisigMembers daoId={daoId} form={form} />
        )}
        {activeTab === EProposalActionTabs.CUSTOM_ACTION && (
          <>
            <FormItem
              label="Contract Address"
              className="!mb-[30px]"
              errorText={errors?.transaction?.toAddress?.message}
            >
              <Controller
                name="transaction.toAddress"
                control={control}
                rules={{ required: 'Contract address is required' }}
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select a contract"
                    overlayClassName="!py-3"
                    overlayItemClassName="flex flex-col gap-2 !py-3 text-white text-descM16 font-Montserrat"
                    options={contractInfoOptions}
                    isError={!!errors?.transaction?.toAddress?.message}
                    onChange={(option) => field.onChange(option.value)}
                  />
                )}
              />
            </FormItem>

            <FormItem
              label={
                <span className="mb-2 block text-descM15 font-Montserrat text-white">
                  Method Name
                </span>
              }
              errorText={errors?.transaction?.contractMethodName?.message}
            >
              <Controller
                name="transaction.contractMethodName"
                control={control}
                rules={{ required: 'method name is required' }}
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select a method name"
                    overlayClassName="!py-3"
                    overlayItemClassName="flex flex-col gap-2 !py-3 text-white text-descM16 font-Montserrat"
                    options={contractMethodOptions}
                    isError={!!errors?.transaction?.contractMethodName?.message}
                    onChange={(option) => field.onChange(option.value)}
                  />
                )}
              />
            </FormItem>

            <ErrorBoundary
              errorMsg={
                <p className="font-Montserrat text-descM12 text-lightGrey">
                  An error occurred while loading the JSON editor. Please refresh the page and try
                  again.
                </p>
              }
            >
              <FormItem
                label="Method Parameter"
                className="!mb-[30px]"
                errorText={errors?.transaction?.params?.message}
              >
                <Controller
                  name="transaction.params"
                  control={control}
                  rules={{ required: 'method params is required' }}
                  render={({ field }) => (
                    <div className="border-solid border-fillBg8 border-[1px] rounded-[8px] py-[13px] overflow-hidden">
                      <Editor
                        {...field}
                        defaultValue={JSON.stringify(
                          {
                            'parameter name': 'Please enter the content of your parameter.',
                          },
                          null,
                          2,
                        )}
                        defaultLanguage="json"
                        theme="vs-dark"
                        className="proposal-custom-action-params-editor"
                        height={176}
                        options={{
                          minimap: {
                            enabled: false,
                          },
                          fontSize: 14,
                          codeLensFontSize: 14,
                        }}
                      />
                    </div>
                  )}
                />
              </FormItem>
            </ErrorBoundary>
          </>
        )}
      </div>
    </>
  );
}
