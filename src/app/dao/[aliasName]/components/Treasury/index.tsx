import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Form, TableProps, Table, Skeleton, message } from 'antd';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import treasuryIconSrc from 'assets/imgs/treasury-icon.svg';
import HashAddress from 'components/HashAddress';
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
import Button from 'components/Button';
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
                  className="!w-full"
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
              children: (
                <Button className="!w-full text-white" type="danger">
                  OK
                </Button>
              ),
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
  const cls = `${clssName} treasury-wrap border-0 lg:border lg:mb-[25px] xl:mb-[25px] md:mb-[25px] border-fillBg8 border-solid rounded-lg bg-darkBg p-[22px] lg:px-[24px] lg:py-[24px] xl:px-[24px] xl:py-[24px] md:px-[24px] md:py-[24px]`;
  const existTransaction = Boolean(transferList?.length);

  const [list, setList] = useState(transferList);

  useEffect(() => {
    setList(transferList?.slice(0, LoadCount));
  }, [transferList]);

  const showLoadMore = useMemo(() => {
    return Number(transferList?.length) > Number(list?.length);
  }, [list, transferList]);

  const [index, setIndex] = useState(1);

  useEffect(() => {
    setList(transferList?.slice(0, LoadCount * index));
  }, [transferList, index]);

  return (
    <div className={`${cls} min-w-[288px]`}>
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
                <Button
                  className="bg-mainColor !rounded-[42px] py-2 px-[14px] mt-6"
                  type="primary"
                  onClick={initTreasury}
                >
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
                    <Button type="primary" size="small" className="!h-[32px]">
                      <span className="text-[12px] font-medium">View More</span>
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
                    className="bg-mainColor !h-[32px] !rounded-[42px] font-Montserrat hover:!bg-transparent hover:!text-mainColor hover:border hover:border-solid hover:border-mainColor"
                  >
                    <span className="text-[12px] font-medium">New transfer</span>
                  </ButtonCheckLogin>
                </div>
                {tokenListLoading ? (
                  <SkeletonLine lines={3} splitBorder={false} />
                ) : (
                  tokenList.length > 0 && (
                    <Table
                      className="token-list-table"
                      columns={tokenListColumns}
                      bordered={false}
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
                      {list?.map((item) => {
                        const isOut = treasuryAddress === item.fromAddress;
                        return (
                          <li
                            className="treasury-info-item font-Montserrat"
                            key={item.transactionId}
                          >
                            <div className="flex justify-between treasury-info-item-line-1 flex-row">
                              <span className="text-[11px]">
                                {dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss')}{' '}
                                {isOut ? 'Withdraw' : 'Deposit'}
                              </span>
                              <span className="text-[11px]">
                                {numberFormatter(item.amountAfterDecimals)} {item.symbol}
                              </span>
                            </div>
                            <div className="treasury-info-item-line-2 text-14-22-500 flex-row">
                              <span className="text-white text-[13px]">Transaction ID:</span>
                              <Link href={`${explorer}/tx/${item.transactionId}`} target="_blank">
                                <HashAddress
                                  className="pl-[4px] text-white !text-[12px]"
                                  ignorePrefixSuffix={true}
                                  preLen={8}
                                  endLen={11}
                                  iconSize={'16px'}
                                  iconColor={'#989DA0'}
                                  address={item.transactionId}
                                  primaryIconColor={'#989DA0'}
                                  addressHoverColor={'white'}
                                  addressActiveColor={'white'}
                                ></HashAddress>
                              </Link>
                            </div>
                            <div className="treasury-info-item-line-3 text-14-22-500 flex-row">
                              <span className="text-white">Address:</span>
                              <Link
                                href={`${explorer}/address/${
                                  isOut ? item.toAddress : item.fromAddress
                                }`}
                                target="_blank"
                              >
                                <HashAddress
                                  className="pl-[4px] text-white !text-[12px]"
                                  preLen={8}
                                  endLen={11}
                                  address={isOut ? item.toAddress : item.fromAddress}
                                  chain={curChain}
                                  iconSize={'16px'}
                                  iconColor={'#989DA0'}
                                  primaryIconColor={'#989DA0'}
                                  addressHoverColor={'white'}
                                  addressActiveColor={'white'}
                                ></HashAddress>
                              </Link>
                            </div>
                          </li>
                        );
                      })}
                      {showLoadMore && (
                        <div className="flex items-center justify-center mt-[24px]">
                          <Button
                            size="small"
                            className="w-[93px] h-[32px] border-white text-white"
                            onClick={() => {
                              setIndex((pre) => pre + 1);
                            }}
                          >
                            <span className="text-[12px]">Load More</span>
                          </Button>
                        </div>
                      )}
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
        title={<div className="text-center text-white font-Unbounded font-[300]">New transfer</div>}
        wrapClassName="choice-modal-wrap"
        destroyOnClose
        onCancel={() => {
          setChoiceOpen(false);
        }}
        className="treasury-choice-modal"
      >
        <ul className="choice-items">
          <li className="choice-item">
            <p className="text-white font-Montserrat font-medium text-[15px]">
              Send assets to the DAO treasury
            </p>
            <Button
              type="primary"
              onClick={() => {
                // setDepoistOpen(true);
                treasuryNoTxGuideref.current?.setDepoistOpen(true);
                setChoiceOpen(false);
              }}
              className="w-[120px] h-[32px] flex-shrink-0"
            >
              <span className="text-[12px]">Deposit</span>
            </Button>
          </li>
          <li className="choice-item">
            <p className="text-white font-Montserrat font-medium text-[15px]">
              Create a proposal to withdraw assets
            </p>
            <Button
              loading={createProposalLoading}
              onClick={handleCreateProposal}
              className="w-[120px] h-[32px] flex-shrink-0 text-white border-white font-medium"
            >
              <span className="text-[12px]">Withdraw</span>
            </Button>
          </li>
        </ul>
      </CommonModal>
    </div>
  );
};

export default Treasury;
