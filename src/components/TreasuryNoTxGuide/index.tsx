import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Form, InputNumber } from 'antd';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import treasuryIconSrc from 'assets/imgs/treasury-icon.svg';
import { Button, Input } from 'aelf-design';

import { callContract } from 'contract/callContract';
import CommonModal from 'components/CommonModal';
import { GetBalanceByContract, GetTokenInfo } from 'contract/callContract';
import { emitLoading, eventBus, ResultModal } from 'utils/myEvent';
import { curChain, sideChainAddress } from 'config';
import { CommonOperationResultModalType } from 'components/CommonOperationResultModal';

import { INIT_RESULT_MODAL_CONFIG } from 'components/ResultModal';
import { IContractError } from 'types';

import BigNumber from 'bignumber.js';
import { timesDecimals } from 'utils/calculate';
import { ButtonCheckLogin } from 'components/ButtonCheckLogin';
import { getExploreLink } from 'utils/common';
import './index.css';

const formSymbol = 'symbol';
const formAmount = 'amount';
interface ITreasuryNoTxGuideProps {
  address: string;
  className?: string;
  style?: React.CSSProperties;
}
export interface ITreasuryNoTxGuideRef {
  setDepoistOpen: (open: boolean) => void;
}
// wrap with forwardref
// export default React.forwardRef((props: ITreasuryNoTxGuideProps, ref) => {
//   return <TreasuryNoTxGuide {...props} />;
// }
const TreasuryNoTxGuide = forwardRef<ITreasuryNoTxGuideRef, ITreasuryNoTxGuideProps>(
  (props, ref) => {
    const { address: treasuryAddress, style, className } = props;
    const { walletInfo: wallet } = useConnectWallet();
    const [depoistOpen, setDepoistOpen] = useState(false);

    const decimalsRef = useRef<number>(8);
    const [form] = Form.useForm();
    const [depositLoading, setDepositLoading] = useState(false);
    const handleDeposit = async () => {
      setDepositLoading(true);
      const formRes = await form?.validateFields().catch((err) => {
        console.log(err);
        return null;
      });
      setDepositLoading(false);
      if (!formRes) return;
      setDepoistOpen(false);
      try {
        const { symbol, amount } = formRes;
        const params = {
          symbol,
          amount: timesDecimals(amount, decimalsRef.current).toNumber(),
          to: treasuryAddress,
        };
        console.log(formRes);
        emitLoading(true, 'The deposit is being processed...');
        const res = await callContract('Transfer', params, sideChainAddress);
        emitLoading(false);
        eventBus.emit(ResultModal, {
          open: true,
          type: CommonOperationResultModalType.Success,
          primaryContent: 'The deposit have been submitted successfully.',
          footerConfig: {
            buttonList: [
              {
                onClick: () => {
                  eventBus.emit(ResultModal, INIT_RESULT_MODAL_CONFIG);
                },
                children: 'OK',
                type: 'primary',
              },
            ],
          },
          viewTransactionId: res.TransactionId,
        });
      } catch (error) {
        const err = error as IContractError;
        emitLoading(false);
        eventBus.emit(ResultModal, {
          open: true,
          type: CommonOperationResultModalType.Error,
          primaryContent: 'Deposit Error',
          secondaryContent: err?.errorMessage?.message || err?.message,
          footerConfig: {
            buttonList: [
              {
                children: <span>OK</span>,
                onClick: () => {
                  eventBus.emit(ResultModal, INIT_RESULT_MODAL_CONFIG);
                },
              },
            ],
          },
        });
      }
    };
    useImperativeHandle(ref, () => ({
      setDepoistOpen,
    }));
    return (
      <>
        <div className={`flex flex-col items-center ${className}`}>
          <img src={treasuryIconSrc} alt="" className="treasury-no-tx-icon" />
          <h3 className="treasury-no-tx-title">Treasury Assets</h3>
          <div className="treasury-no-tx-help-message">
            <p>Community development and operations require funding.</p>
            <p>Deposit assets to the treasury.</p>
          </div>
          <div className="treasury-no-tx-button-wrap">
            <ButtonCheckLogin
              type="primary"
              className="treasury-no-tx-button-item"
              onClick={() => {
                setDepoistOpen(true);
              }}
            >
              Deposit
            </ButtonCheckLogin>
            <Button className="treasury-no-tx-button-item">
              <a
                href="https://medium.com/@tmrwdao/how-to-enable-and-manage-a-dao-treasury-with-tmrwdao-ead8168d4c9a"
                target="_blank"
                rel="noreferrer"
              >
                Learn More
              </a>
            </Button>
          </div>
        </div>
        <CommonModal
          open={depoistOpen}
          destroyOnClose={true}
          wrapClassName="treasury-no-tx-modal"
          title={<div className="text-center">Deposit</div>}
          onCancel={() => {
            setDepoistOpen(false);
          }}
          afterClose={() => {
            form.resetFields();
            setDepositLoading(false);
          }}
        >
          <div>
            <Form
              layout="vertical"
              name="deposit"
              scrollToFirstError={true}
              autoComplete="off"
              form={form}
              requiredMark={false}
            >
              <Form.Item
                validateFirst
                validateTrigger="onBlur"
                rules={[
                  {
                    required: true,
                    message: 'symbol is required',
                  },
                  {
                    validator: (_, value) => {
                      // setIsValidatedSymbol(false);
                      return new Promise<void>((resolve, reject) => {
                        GetTokenInfo(
                          {
                            symbol: value.toUpperCase(),
                          },
                          { chain: curChain },
                        )
                          .then((res) => {
                            if (!res) {
                              reject(new Error('The token has not yet been issued'));
                            }
                            // setIsValidatedSymbol(true);
                            resolve();
                          })
                          .catch(() => {
                            reject(new Error('The token has not yet been issued.'));
                          });
                      });
                    },
                  },
                ]}
                name={formSymbol}
                label={<span className="treasury-no-tx-label">Symbol</span>}
              >
                <Input
                  placeholder="Enter a token symbol"
                  onBlur={() => {
                    const token = form.getFieldValue('symbol');
                    form.setFieldValue('symbol', token?.toUpperCase());
                  }}
                />
              </Form.Item>
              <Form.Item
                dependencies={[formSymbol]}
                name={formAmount}
                validateFirst
                rules={[
                  {
                    required: true,
                  },
                  {
                    validator: (_, value) => {
                      if (value <= 0) {
                        return Promise.reject(new Error('The amount must be greater than 0'));
                      } else {
                        return Promise.resolve();
                      }
                    },
                  },
                  {
                    validator: (_, value) => {
                      const symbol = form.getFieldValue('symbol');
                      console.log('async validator', symbol);
                      if (!symbol) {
                        return Promise.reject(new Error('Please enter the token symbol'));
                      }
                      return new Promise<void>((resolve, reject) => {
                        Promise.all([
                          GetBalanceByContract(
                            {
                              symbol: symbol,
                              owner: wallet!.address,
                            },
                            { chain: curChain },
                          ),
                          GetTokenInfo(
                            {
                              symbol: symbol,
                            },
                            { chain: curChain },
                          ),
                        ])
                          .then((res) => {
                            const [balanceInfo, tokenInfo] = res;
                            const decimals = tokenInfo?.decimals;
                            decimalsRef.current = decimals;
                            const inputAmount = timesDecimals(value, decimals);
                            const decimalPlaces = BigNumber(value).decimalPlaces();
                            if (decimalPlaces && decimalPlaces > decimals) {
                              return Promise.reject(
                                new Error(`The maximum number of decimal places is ${decimals}`),
                              );
                            }
                            if (BigNumber(balanceInfo.balance).lt(inputAmount)) {
                              return Promise.reject(new Error('Insufficient balance'));
                            } else {
                              resolve();
                            }
                          })
                          .catch((err) => {
                            reject(err);
                          });
                      });
                    },
                  },
                ]}
                label={<span className="treasury-no-tx-label">Amount</span>}
              >
                <InputNumber
                  placeholder="Please enter the amount you want to deposit"
                  controls={false}
                />
              </Form.Item>
            </Form>
            <div className="flex justify-center">
              <Button type="primary" size="medium" onClick={handleDeposit} loading={depositLoading}>
                Submit
              </Button>
            </div>
          </div>
        </CommonModal>
      </>
    );
  },
);
export default TreasuryNoTxGuide;
