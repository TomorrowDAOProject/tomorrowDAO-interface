import { Descriptions, Divider, Form, InputNumber } from 'antd';
import { Tooltip, Button as ButtonAntd } from 'aelf-design';
import HashAddress from 'components/HashAddress';
import { toast } from 'react-toastify';
import React, { ReactNode, useState, useEffect, useCallback, useRef } from 'react';
import CommonModal from 'components/CommonModal';
import { useWalletService } from 'hooks/useWallet';
import { fetchProposalMyInfo } from 'api/request';
import { callContract, GetBalanceByContract } from 'contract/callContract';
import { curChain, explorer, sideChainSuffix, voteAddress } from 'config';
import { SkeletonLine } from 'components/Skeleton';
import { ResultModal, emitLoading, eventBus } from 'utils/myEvent';
import Vote from './vote';
import { timesDecimals, divDecimals } from 'utils/calculate';
import { IContractError } from 'types';
import useAelfWebLoginSync from 'hooks/useAelfWebLoginSync';
import './index.css';
import { CommonOperationResultModalType } from 'components/CommonOperationResultModal';
import { INIT_RESULT_MODAL_CONFIG, okButtonConfig } from 'components/ResultModal';
import { useParams } from 'next/navigation';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import Button from 'components/Button';

type TInfoTypes = {
  height?: number | string;
  children?: ReactNode;
  clssName?: string;
  daoId?: string;
  proposalId?: string;
  voteMechanismName?: string;
  notLoginTip?: React.ReactNode;
  isOnlyShowVoteOption?: boolean;
  isShowVote?: boolean;
  isExtraDataLoading?: boolean;
  titleNode?: React.ReactNode;
};

type TFieldType = {
  unstakeAmount: number;
};
interface IMyInfo extends IProposalMyInfo {
  votesAmount?: number;
}
interface ISymbolTextProps {
  symbol: string;
}
const SymbolText = (props: ISymbolTextProps) => {
  const { symbol } = props;
  return <> {symbol.length > 13 ? '' : symbol}</>;
};
export default function MyInfo(props: TInfoTypes) {
  const {
    height,
    clssName,
    daoId,
    proposalId = '',
    voteMechanismName = '',
    notLoginTip = 'Log in to view your votes.',
    isOnlyShowVoteOption,
    isShowVote,
    isExtraDataLoading,
    titleNode,
  } = props;
  const { login, isLogin } = useWalletService();
  const { walletInfo: wallet } = useConnectWallet();
  const [elfBalance, setElfBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [info, setInfo] = useState<IMyInfo>({
    symbol: 'ELF',
    decimal: '8',
    availableUnStakeAmount: 0,
    stakeAmount: 0,
    votesAmount: 0,
    canVote: false,
    withdrawList: [],
    votesAmountTokenBallot: 0,
    votesAmountUniqueVote: 0,
  });

  const { aliasName } = useParams<{ aliasName: string }>();
  const [form] = Form.useForm();
  const fetchMyInfoRef = useRef<() => void>();
  const fetchMyInfo = useCallback(async () => {
    const reqMyInfoParams: IProposalMyInfoReq = {
      chainId: curChain,
      alias: aliasName,
      address: wallet?.address ?? '',
    };
    if (proposalId) {
      reqMyInfoParams.proposalId = proposalId;
    }

    setIsLoading(true);
    const res = await fetchProposalMyInfo(reqMyInfoParams);
    const symbol = res?.data?.symbol ?? 'ELF';
    const { balance } = await GetBalanceByContract(
      {
        symbol: symbol,
        owner: wallet?.address ?? '',
      },
      { chain: curChain },
    );
    setElfBalance(divDecimals(balance, res?.data?.decimal ?? '8').toNumber());
    setIsLoading(false);
    if (!res.data) {
      return;
    }
    const data: IMyInfo = res?.data;
    if (!data?.symbol) {
      data.symbol = 'ELF';
    }
    const decimal = data?.decimal;
    data.availableUnStakeAmount = divDecimals(data?.availableUnStakeAmount, decimal).toNumber();
    data.stakeAmount = divDecimals(data?.stakeAmount, decimal).toNumber();
    const votesAmountTokenBallot = divDecimals(data.votesAmountTokenBallot, decimal).toNumber();
    data.votesAmount = votesAmountTokenBallot + data.votesAmountUniqueVote;
    setInfo(data);
  }, [aliasName, proposalId, wallet]);
  fetchMyInfoRef.current = fetchMyInfo;

  useEffect(() => {
    if (wallet?.address && isLogin) {
      console.log('fetchMyInfo wallet.address', wallet.address);
      fetchMyInfoRef.current?.();
    }
  }, [wallet?.address, isLogin]);

  const myInfoItems = [
    {
      key: '0',
      label: '',
      children: info && (
        <a
          className="w-full"
          href={`${explorer}/address/${wallet?.address}`}
          target="_blank"
          rel="noreferrer"
        >
          <HashAddress
            preLen={8}
            endLen={11}
            address={wallet?.address ?? ''}
            className="form-item-title !text-white justify-between"
            chain={sideChainSuffix}
            primaryIconColor={'#989DA0'}
            addressHoverColor={'white'}
            addressActiveColor={'white'}
          ></HashAddress>
        </a>
      ),
    },
    {
      key: '1',
      label: <span className="card-sm-text text-lightGrey">{info?.symbol || 'ELF'} Balance</span>,
      children: (
        <div className="w-full text-right card-sm-text-bold text-white">
          {elfBalance} <SymbolText symbol={info?.symbol || 'ELF'} />
        </div>
      ),
    },
    {
      key: '2',
      label: <span className="card-sm-text text-lightGrey">{info?.symbol} Staked</span>,
      children: (
        <div className="w-full text-right card-sm-text-bold text-white">
          {info?.stakeAmount} <SymbolText symbol={info?.symbol || 'ELF'} />
        </div>
      ),
    },
    {
      key: '3',
      label: <span className="card-sm-text text-lightGrey">Votes</span>,
      children: (
        <div className="w-full text-right card-sm-text-bold text-white">
          {info?.votesAmount} Votes
        </div>
      ),
    },
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUnstakeAmModalOpen, setIsUnstakeAmIsModalOpen] = useState(false);
  const { isSyncQuery } = useAelfWebLoginSync();

  const handleClaim = useCallback(async () => {
    // call contract
    if (!daoId) {
      toast.error('daoId is required');
      return;
    }
    const contractParams = {
      daoId,
      withdrawAmount: timesDecimals(info?.availableUnStakeAmount, info?.decimal).toNumber(),
      votingItemIdList: {
        value: info.withdrawList?.[0]?.proposalIdList ?? [],
      },
    };
    try {
      if (!isSyncQuery()) {
        return;
      }
      setIsModalOpen(false);
      emitLoading(true, 'The unstake is being processed...');
      const result = await callContract('Withdraw', contractParams, voteAddress);
      emitLoading(false);
      eventBus.emit(ResultModal, {
        open: true,
        type: CommonOperationResultModalType.Success,
        primaryContent: `Transaction Initiated`,
        footerConfig: {
          buttonList: [okButtonConfig],
        },
        viewTransactionId: result?.TransactionId,
      });
    } catch (err) {
      const error = err as IContractError;
      const message = error?.errorMessage?.message || error?.message;
      eventBus.emit(ResultModal, {
        open: true,
        type: CommonOperationResultModalType.Error,
        primaryContent: 'Transaction Failed',
        secondaryContent: message?.toString?.(),
        footerConfig: {
          buttonList: [
            {
              children: (
                <Button
                  type="danger"
                  className="w-full"
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
      emitLoading(false);
    }
  }, [daoId, info?.availableUnStakeAmount, info?.decimal, info.withdrawList, isSyncQuery]);

  return (
    <div
      className={`my-info-wrap flex flex-col border border-fillBg8 border-solid rounded-lg bg-darkBg px-[24px] py-[25px] ${clssName}`}
      style={{
        height: height || 'auto',
      }}
    >
      <div className="text-[18px] text-white font-Montserrat mb-[20px] font-medium">
        {titleNode ?? 'My Info'}
      </div>
      {isLogin ? (
        isLoading || isExtraDataLoading ? (
          <SkeletonLine lines={6} />
        ) : (
          <>
            {!isOnlyShowVoteOption && (
              <>
                <Descriptions
                  colon={false}
                  title=""
                  className="font-Montserrat"
                  items={myInfoItems}
                  column={1}
                />
                {/* cliam */}
                <div className="h-0 w-full border-0 border-t border-solid border-fillBg8"></div>
                <div className="flex justify-between items-center my-[16px]">
                  <div>
                    <div className="text-lightGrey mb-1 font-Montserrat">
                      Available for Unstaking
                    </div>
                    <div className="text-white card-sm-text-bold font-Montserrat">
                      {info?.availableUnStakeAmount} {info?.symbol}
                    </div>
                  </div>
                  <Button
                    type="primary"
                    className="!rounded-[42px] !h-[32px]"
                    onClick={() => {
                      if (info?.availableUnStakeAmount === 0) {
                        toast.error('Available for Unstaking is 0');
                      } else {
                        setIsModalOpen(true);
                      }
                    }}
                  >
                    <span className="text-[12px]">Unstake</span>
                  </Button>
                </div>
              </>
            )}
            {isShowVote && (
              <Vote
                proposalId={proposalId}
                voteMechanismName={voteMechanismName}
                elfBalance={elfBalance}
                symbol={info?.symbol}
                fetchMyInfo={fetchMyInfo}
                votesAmount={info?.votesAmount ?? 0}
                decimal={info?.decimal}
                canVote={info?.canVote}
                className={isOnlyShowVoteOption ? 'py-[24px]' : 'mt-[24px]'}
              />
            )}

            {/* Claim Modal  */}
            <CommonModal
              className="claim-modal"
              open={isModalOpen}
              title={
                <div className="text-center text-white font-Unbounded !font-[300] xl:text-[20px] md:text-[20px] lg:text-[20px] text-[16px]">
                  Unstake {info?.symbol}
                </div>
              }
              destroyOnClose
              onCancel={() => {
                form.setFieldValue('unStakeAmount', 0);
                setIsModalOpen(false);
              }}
            >
              <div className="text-center color-white font-medium">
                <span className="text-[18px] leading-[40px] font-medium text-white font-Montserrat">
                  {info?.availableUnStakeAmount}
                </span>
                <span className="text-white font-medium pl-[10px] text-[18px]">{info.symbol}</span>
              </div>
              <div className="text-center text-[12px] text-lightGrey mb-[30px]">
                Available for Unstaking
              </div>
              <Form form={form} layout="vertical" variant="filled" onFinish={handleClaim}>
                <Form.Item<TFieldType>
                  label={
                    <Tooltip
                      title={
                        <div className="font-Montserrat">
                          Currently, the only supported method is to unstake all the available{' '}
                          {info.symbol} in one time.
                        </div>
                      }
                    >
                      <div className="flex items-center">
                        <span className="text-[13px] text-white font-medium font-Montserrat">
                          Unstake Amount
                        </span>
                        {/* <InfoCircleOutlined className="cursor-pointer pl-[8px] text-Neutral-Disable-Text" /> */}
                      </div>
                    </Tooltip>
                  }
                  name="unstakeAmount"
                  className=""
                >
                  <InputNumber
                    className="w-full border border-solid border-fillBg8 text-white"
                    placeholder="pleas input Unstake Amount"
                    defaultValue={info?.availableUnStakeAmount}
                    disabled
                    prefix={
                      <div className="flex items-center">
                        <span className="text-lightGrey text-[14px]">{info.symbol}</span>
                        <Divider type="vertical" />
                      </div>
                    }
                  />
                </Form.Item>
                <ButtonAntd
                  className="w-full font-Montserrat text-white bg-mainColor hover:border-mainColor hover:!text-mainColor hover:!bg-transparent !rounded-[42px]"
                  type="primary"
                  htmlType="submit"
                >
                  Unstake
                </ButtonAntd>
              </Form>
            </CommonModal>
            {/* Unstake Amount  */}
            <CommonModal
              open={isUnstakeAmModalOpen}
              title={<div className="text-center">Unstake Amount</div>}
              onCancel={() => {
                setIsUnstakeAmIsModalOpen(false);
              }}
              footer={null}
            >
              <p>
                Currently, the only supported method is to unstake all the available {info.symbol}{' '}
                in one time.
              </p>
              <Button
                className="mx-auto"
                type="primary"
                onClick={() => {
                  setIsUnstakeAmIsModalOpen(false);
                }}
              >
                OK
              </Button>
            </CommonModal>
          </>
        )
      ) : (
        <div>
          <Button
            className="w-full mb-4 !rounded-[42px] bg-mainColor !h-auto !py-2"
            type="primary"
            onClick={login}
          >
            Log in
          </Button>
          <div className="text-center text-lightGrey font-Montserrat text-[12px]">
            {notLoginTip}
          </div>
        </div>
      )}
      <div>{props.children}</div>
    </div>
  );
}
