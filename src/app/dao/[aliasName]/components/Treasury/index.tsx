import React, { useEffect, useRef, useState } from 'react';
import { Form, TableProps, Table, Skeleton, message } from 'antd';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import treasuryIconSrc from 'assets/imgs/treasury-icon.svg';
import { Button, HashAddress } from 'aelf-design';
import { callContract } from 'contract/callContract';
import CommonModal from 'components/CommonModal';
import { emitLoading, eventBus, ResultModal } from 'utils/myEvent';
import { curChain, explorer, treasuryContractAddress } from 'config';
import { CommonOperationResultModalType } from 'components/CommonOperationResultModal';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { INIT_RESULT_MODAL_CONFIG } from 'components/ResultModal';
import { IContractError } from 'types';
import { fetchTreasuryRecords, getDaoTreasury } from 'api/request';
import dayjs from 'dayjs';
import './index.css';
import { ButtonCheckLogin } from 'components/ButtonCheckLogin';
import { EProposalActionTabs } from 'pageComponents/proposal-create/type';
import { useRequest } from 'ahooks';
import useTokenListData from 'hooks/useTokenListData';
import { numberFormatter } from 'utils/numberFormatter';
import { SkeletonLine } from 'components/Skeleton';
import TreasuryNoTxGuide, { ITreasuryNoTxGuideRef } from 'components/TreasuryNoTxGuide';
import { divDecimals } from 'utils/calculate';
import BigNumber from 'bignumber.js';
import Symbol from 'components/Symbol';
import { checkCreateProposal } from 'utils/proposal';
import useAelfWebLoginSync from 'hooks/useAelfWebLoginSync';
interface IProps {
  clssName?: string;
  daoRes?: IDaoInfoRes | null;
  createProposalCheck?: (customRouter?: boolean) => Promise<boolean>;
  aliasName?: string;
  // Define your component's props here
}
const LoadCount = 5;
const tokenListColumns: TableProps<ITreasuryAssetsResponseDataItem>['columns'] = [
  {
    title: 'Token',
    dataIndex: 'symbol',
    render: (symbol) => <Symbol symbol={symbol} />,
  },
  {
    title: 'Blance',
    dataIndex: 'amount',
    render: (amount, record) => divDecimals(amount, record.decimal).toFormat(),
  },
  {
    title: 'Value',
    dataIndex: 'usdValue',
    render: (usdValue) =>
      usdValue === 0 ? 0 : BigNumber(usdValue).toFormat(2, BigNumber.ROUND_FLOOR),
  },
];
const Treasury: React.FC<IProps> = (props) => {
  const { clssName, daoRes, createProposalCheck, aliasName } = props;
  const daoData = daoRes?.data;
  const [form] = Form.useForm();
  const [choiceOpen, setChoiceOpen] = useState(false);
  // const [isValidatedSymbol, setIsValidatedSymbol] = useState(false);
  // const [depoistOpen, setDepoistOpen] = useState(false);
  // const [depositLoading, setDepositLoading] = useState(false);
  const treasuryNoTxGuideref = useRef<ITreasuryNoTxGuideRef>(null);
  const decimalsRef = useRef<number>(8);
  const router = useRouter();

  const { creator } = daoData ?? {};

  // treasuryAddress
  const { data: treasuryAddress, loading: treasuryAddressLoading } = useRequest(async () => {
    // fetchTreasuryAssets({
    //   daoId: id,
    //   chainId: curChain,
    // }),
    const res = await getDaoTreasury({
      chainId: curChain,
      alias: aliasName as string,
    });
    return res.data;
  });
  const { totalValueUSD, tokenList, tokenListLoading } = useTokenListData({
    currentChain: curChain,
    alias: aliasName,
  });
  const {
    data: transferList,
    // error: transferListError,
    loading: transferListLoading,
    run,
  } = useRequest(
    async () => {
      const treasuryRecordsRes = await fetchTreasuryRecords({
        ChainId: curChain,
        TreasuryAddress: treasuryAddress ?? '',
      });
      const list = treasuryRecordsRes?.data?.data ?? [];
      return list;
    },
    {
      manual: true,
    },
  );
  const { walletInfo: wallet } = useConnectWallet();
  const [createProposalLoading, setCreateProposalLoading] = useState(false);
  const handleCreateProposal = async () => {
    setCreateProposalLoading(true);
    try {
      if (!daoRes) {
        message.error('The DAO information is not available.');
        setCreateProposalLoading(false);
        return;
      }
      const checkRes = await checkCreateProposal(daoRes, wallet!.address);
      if (checkRes) {
        router.push(`/dao/${aliasName}/proposal/create?tab=${EProposalActionTabs.TREASURY}`);
      }
    } catch (error) {
      console.log('handleCreateProposal', error);
    } finally {
      setCreateProposalLoading(false);
    }
  };
  const { isSyncQuery } = useAelfWebLoginSync();
  const initTreasury = async () => {
    if (!isSyncQuery()) {
      return;
    }
    try {
      const params = {
        daoId: daoData?.id,
      };
      emitLoading(true, 'The changes is being processed...');
      const res = await callContract('CreateTreasury', params, treasuryContractAddress);
      emitLoading(false);
      eventBus.emit(ResultModal, {
        open: true,
        type: CommonOperationResultModalType.Success,
        primaryContent: 'Enable Treasury successfully.',
        footerConfig: {
          buttonList: [
            {
              children: (
                <Button
                  type="primary"
                  onClick={() => {
                    eventBus.emit(ResultModal, INIT_RESULT_MODAL_CONFIG);
                  }}
                >
                  OK
                </Button>
              ),
            },
          ],
        },
      });
    } catch (error) {
      const err = error as IContractError;
      emitLoading(false);
      eventBus.emit(ResultModal, {
        open: true,
        type: CommonOperationResultModalType.Error,
        primaryContent: 'Enable Treasury Error',
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
  useEffect(() => {
    if (treasuryAddress) {
      run();
    }
  }, [run, treasuryAddress]);
  const cls = `${clssName} treasury-wrap border-0 lg:border lg:mb-[10px] border-fillBg8 border-solid rounded-lg bg-darkBg px-4 lg:px-6 lg:py-[25px]`;
  const existTransaction = Boolean(transferList?.length);
  return (
    <div className={cls}>
      {treasuryAddressLoading || transferListLoading ? (
        <SkeletonLine />
      ) : (
        <>
          {!treasuryAddress && (
            <div className="flex flex-col items-center">
              <img src={treasuryIconSrc} alt="" className="treasury-icon" />
              <h3 className="assets-title">Treasury Assets</h3>
              <p className="assets-help-message assets-help-message-text-wrap">
                The treasury function is not currently enabled for this DAO.
              </p>
              {wallet?.address === creator && (
                <Button className="w-[172px] mt-6" type="primary" onClick={initTreasury}>
                  Enable Treasury
                </Button>
              )}
            </div>
          )}
          {treasuryAddress && (
            <>
              <div className={existTransaction ? 'block' : 'hidden'}>
                <div className="flex items-center justify-between">
                  <h2 className="card-title">Treasury Assets</h2>
                  <Link href={`/dao/${aliasName}/treasury`} prefetch={true}>
                    <Button size="medium" type="primary" className="small-button">
                      View all
                    </Button>
                  </Link>
                </div>
                <div className="flex items-center mt-6 mb-[32px]">
                  <p className="usd-value">
                    {tokenListLoading ? (
                      <Skeleton.Button active size={'small'} block={false} />
                    ) : (
                      `$${totalValueUSD}`
                    )}
                  </p>
                  <ButtonCheckLogin
                    type="primary"
                    onClick={() => {
                      setChoiceOpen(true);
                    }}
                    className="small-button"
                    size="medium"
                  >
                    New transfer
                  </ButtonCheckLogin>
                </div>
                {tokenListLoading ? (
                  <SkeletonLine lines={3} splitBorder={false} />
                ) : (
                  tokenList.length > 0 && (
                    <Table
                      className="token-list-table"
                      columns={tokenListColumns}
                      bordered
                      dataSource={tokenList}
                      pagination={false}
                      scroll={{ x: true }}
                    />
                  )
                )}
                <div>
                  <p className="flex justify-between">
                    <span className="card-title mb-6">Transactions</span>
                  </p>
                  {transferListLoading ? (
                    <SkeletonLine />
                  ) : (
                    <ul>
                      {transferList?.slice(0, LoadCount).map((item) => {
                        const isOut = treasuryAddress === item.fromAddress;
                        return (
                          <li className="treasury-info-item" key={item.transactionId}>
                            <div className="flex justify-between treasury-info-item-line-1 ">
                              <span className="">
                                {dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss')}{' '}
                                {isOut ? 'Withdraw' : 'Deposit'}
                              </span>
                              <span>
                                {numberFormatter(item.amountAfterDecimals)} {item.symbol}
                              </span>
                            </div>
                            <div className="treasury-info-item-line-2 text-14-22-500">
                              <span>Transaction ID:</span>
                              <Link href={`${explorer}/tx/${item.transactionId}`} target="_blank">
                                <HashAddress
                                  className="pl-[4px]"
                                  ignorePrefixSuffix={true}
                                  preLen={8}
                                  endLen={11}
                                  address={item.transactionId}
                                ></HashAddress>
                              </Link>
                            </div>
                            <div className="treasury-info-item-line-3 text-14-22-500">
                              <span>Address:</span>
                              <Link
                                href={`${explorer}/address/${
                                  isOut ? item.toAddress : item.fromAddress
                                }`}
                                target="_blank"
                              >
                                <HashAddress
                                  className="pl-[4px]"
                                  preLen={8}
                                  endLen={11}
                                  address={isOut ? item.toAddress : item.fromAddress}
                                  chain={curChain}
                                ></HashAddress>
                              </Link>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>

              <TreasuryNoTxGuide
                ref={treasuryNoTxGuideref}
                address={treasuryAddress}
                className={existTransaction ? 'hidden' : 'block'}
              />
            </>
          )}
        </>
      )}
      {/* choice: Deposit /  WithDraw*/}
      <CommonModal
        open={choiceOpen}
        title={<div className="text-center">New transfer</div>}
        wrapClassName="choice-modal-wrap"
        destroyOnClose
        onCancel={() => {
          setChoiceOpen(false);
        }}
        className="treasury-choice-modal"
      >
        <ul className="choice-items">
          <li className="choice-item">
            <p className="choice-item-text-subtitle">Send assets to the DAO treasury</p>
            <Button
              type="primary"
              onClick={() => {
                // setDepoistOpen(true);
                treasuryNoTxGuideref.current?.setDepoistOpen(true);
                setChoiceOpen(false);
              }}
              className="choice-item-btn"
            >
              Deposit
            </Button>
          </li>
          <li className="choice-item">
            <p className="choice-item-text-subtitle">Create a proposal to withdraw assets</p>
            <Button
              loading={createProposalLoading}
              onClick={handleCreateProposal}
              className="choice-item-btn"
            >
              Withdraw
            </Button>
          </li>
        </ul>
      </CommonModal>
    </div>
  );
};

export default Treasury;
