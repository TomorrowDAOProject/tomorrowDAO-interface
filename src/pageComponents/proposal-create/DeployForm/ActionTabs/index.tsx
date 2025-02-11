import React, { useRef } from 'react';
import { Input, Tabs } from 'aelf-design';
import {
  AddCircleOutlined,
  RightArrowOutlined,
  UserAddOutlined,
  DeleteOutlined,
} from '@aelf-design/icons';
import { ResponsiveSelect } from 'components/ResponsiveSelect';
import { useEffect, useMemo, useState } from 'react';
import Editor from '@monaco-editor/react';
import { Form, TabsProps } from 'antd';
import { EProposalActionTabs } from '../../type';
import { useAsyncEffect } from 'ahooks';
import { fetchContractInfo } from 'api/request';
import { curChain } from 'config';
import AmountInput from './FormAmountInput';
import './index.css';
import BigNumber from 'bignumber.js';
import Symbol from 'components/Symbol';
import { GetTokenInfo } from 'contract/callContract';
import { EDaoGovernanceMechanism } from 'app/(createADao)/create/type';
import DeleteMultisigMembers from './TabContent/DeleteMultisigMembers';
import AddMultisigMembers from './TabContent/AddMultisigMembers';
import DeleteHCMembers from './TabContent/DeleteHCMembers';
import AddHCMembers from './TabContent/AddHCMembers';
import ErrorBoundary from 'components/ErrorBoundary';
import { divDecimals } from 'utils/calculate';
import { IssueIcon } from './TabContent/IssueToken/Icon';
import IssueToken from './TabContent/IssueToken';
import { Controller } from 'react-hook-form';
import FormItem from 'components/FormItem';
import Select from 'components/Select';

interface IActionTabsProps {
  form: any;
  daoId: string;
  onTabChange?: (activeKey: string) => void;
  activeTab?: string;
  daoData?: IDaoInfoData;
  treasuryAssetsData?: ITreasuryAssetsResponseDataItem[];
  governanceMechanismList: TGovernanceSchemeList;
}
// const emptyTabItem = (...([]));
export default function TabsCom(props: IActionTabsProps) {
  const {
    form,
    daoId,
    onTabChange,
    activeTab,
    treasuryAssetsData,
    daoData,
    governanceMechanismList,
  } = props;
  const {
    watch,
    setValue,
    getValues,
    control,
    formState: { errors },
  } = form;
  const onTabChangeRef = useRef<(activeKey: string) => void>();
  onTabChangeRef.current = onTabChange;
  const contractAddress = watch('transaction.toAddress');
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
      form.setFieldValue(['treasury', 'amountInfo', 'symbol'], selectOptions?.[0]?.value);
    }
  }, [selectOptions, form]);
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
  }, [contractAddress, form, contractInfo]);

  const tabItems = useMemo(() => {
    const initItems = [
      treasuryAssetsData?.length
        ? {
            label: (
              <span className="proposal-action-tabs-label">
                <RightArrowOutlined />
                <span
                  className={`proposal-action-tabs-text ${
                    activeTab === EProposalActionTabs.TREASURY ? 'active' : ''
                  }`}
                >
                  Withdraw Assets
                </span>
              </span>
            ),
            key: EProposalActionTabs.TREASURY,
            children: (
              <>
                <Form.Item
                  name={['treasury', 'recipient']}
                  label={<span className="form-item-label">Recipient</span>}
                  validateFirst
                  extra={'The wallet that receives the tokens.'}
                  rules={[
                    {
                      required: true,
                      message: 'The recipient is required',
                    },
                    {
                      validator: (_, value) => {
                        return new Promise<void>((resolve, reject) => {
                          if (value.endsWith(`AELF`)) {
                            reject(new Error('Must be a SideChain address'));
                          }
                          if (!value.startsWith(`ELF`) || !value.endsWith(curChain)) {
                            reject(new Error('Must be a valid address'));
                          }
                          resolve();
                        });
                      },
                    },
                  ]}
                >
                  <Input type="text" placeholder={`Enter ELF_..._${curChain}`} />
                </Form.Item>
                <Form.Item
                  name={['treasury', 'amountInfo']}
                  label={<span className="form-item-label">Amount</span>}
                  validateFirst
                  rules={[
                    {
                      validator: (_, value) => {
                        return new Promise<void>((resolve, reject) => {
                          if (!value) {
                            reject(new Error('The amount is required'));
                          }
                          if (typeof value.amount !== 'number') {
                            reject(new Error('The amount is required'));
                          }
                          if (value.amount <= 0) {
                            reject(new Error('The amount must be greater than 0'));
                          }
                          if (typeof value.symbol !== 'string') {
                            reject(new Error('The symbol is required'));
                          }
                          resolve();
                        });
                      },
                    },
                    {
                      validator: (_, value) => {
                        return new Promise<void>((resolve, reject) => {
                          const { amount, symbol } = value;
                          const symbolInfo = treasuryAssetsData?.find(
                            (item) => item.symbol === symbol,
                          );
                          if (!symbolInfo) {
                            reject(new Error('The symbol is invalid'));
                            return;
                          }
                          if (!symbolInfo) {
                            reject(new Error('The symbol is invalid'));
                            return;
                          }
                          const amountWithDecimals = BigNumber(amount);
                          const decimalPlaces = amountWithDecimals.decimalPlaces();
                          if (decimalPlaces && decimalPlaces > symbolInfo.decimal) {
                            return reject(
                              new Error(
                                `The maximum number of decimal places is ${symbolInfo.decimal}`,
                              ),
                            );
                          }
                          if (
                            amountWithDecimals.gt(
                              divDecimals(symbolInfo.amount, symbolInfo.decimal),
                            )
                          ) {
                            reject(
                              new Error(
                                'The withdrawal amount should be less than the available treasury assets.',
                              ),
                            );
                          } else {
                            resolve();
                          }
                        });
                      },
                    },
                  ]}
                  initialValue={{
                    symbol: selectOptions?.[0]?.value,
                  }}
                >
                  <AmountInput
                    daoId={daoId}
                    selectOptions={selectOptions}
                    treasuryAssetsData={treasuryAssetsData}
                  />
                </Form.Item>
              </>
            ),
          }
        : {},
      daoData?.governanceMechanism === EDaoGovernanceMechanism.Multisig
        ? {
            label: (
              <span className="proposal-action-tabs-label">
                <AddCircleOutlined />
                <span
                  className={`proposal-action-tabs-text ${
                    activeTab === EProposalActionTabs.AddMultisigMembers ? 'active' : ''
                  }`}
                >
                  Add Multisig Members
                </span>
              </span>
            ),
            key: EProposalActionTabs.AddMultisigMembers,
            children: <AddMultisigMembers form={form} />,
          }
        : {},
      daoData?.governanceMechanism === EDaoGovernanceMechanism.Multisig
        ? {
            label: (
              <span className="proposal-action-tabs-label">
                <DeleteOutlined />
                <span
                  className={`proposal-action-tabs-text ${
                    activeTab === EProposalActionTabs.DeleteMultisigMembers ? 'active' : ''
                  }`}
                >
                  Delete Multisig Members
                </span>
              </span>
            ),
            key: EProposalActionTabs.DeleteMultisigMembers,
            children: <DeleteMultisigMembers daoId={daoId} form={form} />,
          }
        : {},
      daoData?.governanceMechanism === EDaoGovernanceMechanism.Multisig
        ? {
            label: (
              <span className="proposal-action-tabs-label">
                <IssueIcon />
                <span
                  className={`proposal-action-tabs-text ${
                    activeTab === EProposalActionTabs.IssueToken ? 'active' : ''
                  }`}
                >
                  Issue Token
                </span>
              </span>
            ),
            key: EProposalActionTabs.IssueToken,
            children: <IssueToken governanceMechanismList={governanceMechanismList} />,
          }
        : {},
      daoData?.governanceMechanism === EDaoGovernanceMechanism.Token && daoData.isHighCouncilEnabled
        ? {
            label: (
              <span className="proposal-action-tabs-label">
                <AddCircleOutlined />
                <span
                  className={`proposal-action-tabs-text ${
                    activeTab === EProposalActionTabs.AddMultisigMembers ? 'active' : ''
                  }`}
                >
                  Add HC Members
                </span>
              </span>
            ),
            key: EProposalActionTabs.AddHcMembers,
            children: <AddHCMembers form={form} />,
          }
        : {},
      daoData?.governanceMechanism === EDaoGovernanceMechanism.Token && daoData.isHighCouncilEnabled
        ? {
            label: (
              <span className="proposal-action-tabs-label">
                <DeleteOutlined />
                <span
                  className={`proposal-action-tabs-text ${
                    activeTab === EProposalActionTabs.DeleteMultisigMembers ? 'active' : ''
                  }`}
                >
                  Delete HC Members
                </span>
              </span>
            ),
            key: EProposalActionTabs.DeleteHcMembers,
            children: <DeleteHCMembers daoId={daoId} form={form} />,
          }
        : {},
      {
        label: (
          <span className="proposal-action-tabs-label">
            <UserAddOutlined />
            <span
              className={`proposal-action-tabs-text ${
                activeTab === EProposalActionTabs.CUSTOM_ACTION ? 'active' : ''
              }`}
            >
              Custom Action
            </span>
          </span>
        ),
        key: EProposalActionTabs.CUSTOM_ACTION,
        children: (
          <>
            <FormItem
              label={
                <span className="mb-2 block text-descM15 font-Montserrat text-white">
                  Contract Address
                </span>
              }
              errorText={errors?.transaction?.contractMethodName?.message}
            >
              <Controller
                name="transaction.toAddress"
                control={control}
                rules={{ required: 'contract address is required' }}
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
                <p className="text-error">
                  An error occurred while loading the JSON editor. Please refresh the page and try
                  again.
                </p>
              }
            >
              <FormItem
                label="Method Parameter"
                errorText={errors?.transaction?.contractMethodName?.message}
              >
                <Controller
                  name="transaction.params"
                  control={control}
                  rules={{ required: 'method params is required' }}
                  render={({ field }) => (
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
                      className="proposal-custom-action-params-editor"
                      height={176}
                      options={{
                        minimap: {
                          enabled: false,
                        },
                      }}
                    />
                  )}
                />
              </FormItem>
            </ErrorBoundary>
          </>
        ),
      },
    ];
    return initItems.filter((item) => item.label) as TabsProps['items'];
  }, [
    activeTab,
    contractInfoOptions,
    contractMethodOptions,
    daoData?.governanceMechanism,
    daoData?.isHighCouncilEnabled,
    daoId,
    form,
    selectOptions,
    treasuryAssetsData,
  ]);

  useEffect(() => {
    const keys = tabItems?.map((item) => item.key);
    if (activeTab && !keys?.includes(activeTab) && tabItems?.[0]?.key) {
      onTabChangeRef?.current?.(tabItems?.[0]?.key);
    }
  }, [tabItems, activeTab]);
  return (
    <Tabs
      defaultActiveKey={activeTab}
      className="proposal-action-tabs"
      type="card"
      onChange={onTabChange}
      animated
      destroyInactiveTabPane={true}
      items={tabItems}
    />
  );
}
