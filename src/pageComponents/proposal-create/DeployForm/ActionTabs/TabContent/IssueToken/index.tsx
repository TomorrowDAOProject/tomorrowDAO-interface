import { Form, InputNumber } from 'antd';
import { Input, HashAddress } from 'aelf-design';
import { fetchTokenIssue } from 'api/request';
import { curChain } from 'config';
import { divDecimals, timesDecimals } from 'utils/calculate';
import BigNumber from 'bignumber.js';
import useResponsive from 'hooks/useResponsive';
import { voterAndExecuteNamePath } from '../../../constant';
import './index.css';

const symbolNamePath = ['issueObj', 'symbol'];
const amountNamePath = ['issueObj', 'amount'];
const issueToNamePath = ['issueObj', 'to'];
const issueDecimalPath = ['issueObj', 'decimals'];

interface IIssueTokenProps {
  governanceMechanismList: TGovernanceSchemeList;
}
export default function IssueToken(props: IIssueTokenProps) {
  const { governanceMechanismList } = props;
  const form = Form.useFormInstance();
  const { isLG } = useResponsive();
  const schemeAddress = Form.useWatch(voterAndExecuteNamePath);
  return (
    <div className="issue-token-form">
      <p className="org-address normal-text">
        <div> Organisation address:</div>
        {schemeAddress && (
          <HashAddress
            chain={curChain}
            preLen={isLG ? 8 : 0}
            endLen={isLG ? 8 : 0}
            address={schemeAddress}
          />
        )}
      </p>
      <Form.Item
        hidden
        name={issueDecimalPath}
        validateFirst
        label={<span className="form-item-label">Amount</span>}
      >
        <InputNumber placeholder="Please enter the amount you want to issue" className="w-full" />
      </Form.Item>
      <Form.Item
        validateFirst
        rules={[
          {
            required: true,
            message: 'Please enter symbol',
          },
          {
            validator: (_, value) => {
              value = value?.toString().trim();
              const reg = /^[A-Za-z0-9-]{1,20}$/;
              if (!reg.test(value)) {
                return Promise.reject(new Error('symbol name is invalid'));
              } else {
                return Promise.resolve();
              }
            },
          },
          {
            validator: (_, value) => {
              const reqParams = {
                symbol: (value ?? '').toUpperCase(),
                chainId: curChain,
              };
              const schemeAddress = form.getFieldValue(voterAndExecuteNamePath);
              if (!schemeAddress) {
                return Promise.reject(
                  new Error('The symbol cannot be issued by the organisation address'),
                );
              }
              return new Promise<void>((resolve, reject) => {
                fetchTokenIssue(reqParams)
                  .then((res) => {
                    if (!res?.data?.totalSupply) {
                      reject('The token has not yet been created');
                    }
                    if (!res?.data?.realIssuers?.includes(schemeAddress)) {
                      reject('The symbol cannot be issued by the organisation address');
                    }
                    form.setFieldValue(issueDecimalPath, res?.data?.decimals);
                    resolve();
                  })
                  .catch(() => {
                    reject('query token error');
                  });
              });
            },
          },
        ]}
        validateTrigger="onBlur"
        dependencies={[voterAndExecuteNamePath]}
        name={symbolNamePath}
        label={<span className="form-item-label">Symbol</span>}
        className="governance-token-item"
      >
        <Input
          placeholder="Please enter the symbol you want to issue"
          onBlur={() => {
            const token = form.getFieldValue(symbolNamePath);
            form.setFieldValue(symbolNamePath, token?.toUpperCase());
          }}
        />
      </Form.Item>
      <Form.Item
        dependencies={[symbolNamePath]}
        name={amountNamePath}
        validateFirst
        rules={[
          {
            required: true,
            message: 'The amount is required',
          },
          {
            validator: (_, value) => {
              if (BigNumber(value).lte(0)) {
                return Promise.reject(new Error('The amount must be greater than 0'));
              } else {
                return Promise.resolve();
              }
            },
          },
          {
            validator: (_, value) => {
              const symbol = form.getFieldValue(symbolNamePath);
              if (!symbol) {
                return Promise.reject(new Error('Please enter symbol'));
              }
              return new Promise<void>((resolve, reject) => {
                const reqParams = {
                  symbol: symbol.toString().toUpperCase(),
                  chainId: curChain,
                };
                fetchTokenIssue(reqParams)
                  .then((res) => {
                    const { totalSupply, decimals, supply } = res?.data ?? {};
                    if (
                      typeof decimals !== 'number' ||
                      typeof totalSupply !== 'number' ||
                      typeof supply !== 'number'
                    ) {
                      return reject(new Error('Please enter a valid symbol'));
                    }
                    const inputAmount = timesDecimals(value, decimals);
                    const decimalPlaces = BigNumber(value).decimalPlaces();
                    if (decimalPlaces && decimalPlaces > decimals) {
                      return reject(
                        new Error(`The maximum number of decimal places is ${decimals}`),
                      );
                    }
                    const inputTotal = BigNumber(totalSupply - supply);
                    if (inputTotal.lt(inputAmount)) {
                      return reject(
                        new Error(
                          `The maximum amount that can be issued: ${divDecimals(
                            inputTotal,
                            decimals,
                          ).toFormat()}`,
                        ),
                      );
                    }
                    resolve();
                  })
                  .catch((err) => {
                    console.error(err);
                    reject(new Error('get token info error'));
                  });
              });
            },
          },
        ]}
        label={<span className="form-item-label">Amount</span>}
      >
        <InputNumber
          placeholder="Please enter the amount you want to issue"
          className="w-full"
          controls={false}
          stringMode={true}
        />
      </Form.Item>
      <Form.Item
        name={issueToNamePath}
        label={<span className="form-item-label">Issue To</span>}
        validateFirst
        rules={[
          {
            required: true,
            message: 'The address is required',
          },
          {
            validator: (_, value) => {
              return new Promise<void>((resolve, reject) => {
                if (value.endsWith(`AELF`)) {
                  reject(new Error('Please enter a valid address'));
                }
                if (!value.startsWith(`ELF`) || !value.endsWith(curChain)) {
                  reject(new Error('Please enter a valid address'));
                }
                resolve();
              });
            },
          },
        ]}
      >
        <Input type="text" placeholder={`Enter ELF_..._${curChain}`} />
      </Form.Item>
    </div>
  );
}
