import React from 'react';
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
import { Alert, Form, TabsProps } from 'antd';
import { EProposalActionTabs } from '../../type';
import { useAsyncEffect } from 'ahooks';
import { fetchContractInfo, fetchTreasuryAssets } from 'api/request';
import { curChain } from 'config';

import AmountInput from './FormAmountInput';
import './index.css';
import { timesDecimals } from 'utils/calculate';
import BigNumber from 'bignumber.js';
import Symbol from 'components/Symbol';
import { GetTokenInfo } from 'contract/callContract';
import { EDaoGovernanceMechanism } from 'app/(createADao)/create/type';
import DeleteMultisigMembers from './TabContent/DeleteMultisigMembers';
import AddMultisigMembers from './TabContent/AddMultisigMembers';

const contractMethodNamePath = ['transaction', 'contractMethodName'];

interface IActionTabsProps {
  daoId: string;
  onTabChange?: (activeKey: string) => void;
  activeTab?: string;
  daoData?: IDaoInfoData;
  treasuryAssetsData?: IAddressTokenListDataItem[];
}
// const emptyTabItem = (...([]));
export default function TabsCom(props: IActionTabsProps) {
  const { daoId, onTabChange, activeTab, treasuryAssetsData, daoData } = props;
  const form = Form.useFormInstance();
  const contractAddress = Form.useWatch(['transaction', 'toAddress'], form);
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
    const contractInfo = await fetchContractInfo({ chainId: curChain });
    setContractInfo(contractInfo.data);
  }, [daoId]);
  // reset Method Name if Contract Address change
  useEffect(() => {
    const methodName = form.getFieldValue(contractMethodNamePath);
    if (!contractInfo?.contractInfoList.includes(methodName)) {
      form.setFieldValue(contractMethodNamePath, undefined);
    }
  }, [contractAddress, form, contractInfo]);
  const tabItems = useMemo(() => {
    const initItems = [
      {
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
                      const symbolInfo = treasuryAssetsData?.find((item) => item.symbol === symbol);
                      if (!symbolInfo) {
                        reject(new Error('The symbol is invalid'));
                        return;
                      }
                      GetTokenInfo(
                        {
                          symbol: symbol,
                        },
                        { chain: curChain },
                      ).then((tokenInfo) => {
                        if (!tokenInfo) {
                          reject(new Error('The symbol is invalid'));
                          return;
                        }
                        const amountWithDecimals = BigNumber(amount);
                        const decimalPlaces = amountWithDecimals.decimalPlaces();
                        if (decimalPlaces && decimalPlaces > tokenInfo.decimals) {
                          return reject(
                            new Error(
                              `The maximum number of decimal places is ${tokenInfo.decimals}`,
                            ),
                          );
                        }
                        if (amountWithDecimals.gt(BigNumber(symbolInfo.balance))) {
                          reject(
                            new Error(
                              'The withdrawal amount should be less than the available treasury assets.',
                            ),
                          );
                        } else {
                          resolve();
                        }
                      });
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
      },
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
            <Form.Item
              name={['transaction', 'toAddress']}
              rules={[
                {
                  required: true,
                  message: 'contract address is required',
                },
              ]}
              label={<span className="form-item-label">Contract Address</span>}
            >
              <ResponsiveSelect
                drawerProps={{
                  title: 'Contract Address',
                }}
                options={contractInfoOptions}
                optionLabelProp="label"
                placeholder="Select a contract"
              ></ResponsiveSelect>
            </Form.Item>
            <Form.Item
              name={contractMethodNamePath}
              label={<span className="form-item-label">Method Name</span>}
              dependencies={['transaction', 'toAddress']}
              rules={[
                {
                  required: true,
                  message: 'method name is required',
                },
              ]}
            >
              <ResponsiveSelect
                drawerProps={{
                  title: 'Method Name',
                }}
                options={contractMethodOptions}
                optionLabelProp="label"
                placeholder="Select a method name"
              ></ResponsiveSelect>
            </Form.Item>
            <Form.Item
              name={['transaction', 'params']}
              label={<span className="form-item-label">Method Parameter</span>}
              rules={[
                {
                  required: true,
                  message: 'method params is required',
                },
              ]}
            >
              <Editor defaultLanguage="json" height={176} />
            </Form.Item>
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
    daoId,
    form,
    selectOptions,
    treasuryAssetsData,
  ]);
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
