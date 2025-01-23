import { Descriptions, Divider, Form, InputNumber, message } from 'antd';
import { HashAddress, Button, Tooltip } from 'aelf-design';
import { InfoCircleOutlined } from '@aelf-design/icons';
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
import { okButtonConfig } from 'components/ResultModal';
import Symbol from 'components/Symbol';
import { useParams } from 'next/navigation';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';

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
        <a href={`${explorer}/address/${wallet?.address}`} target="_blank" rel="noreferrer">
          <HashAddress
            preLen={8}
            endLen={11}
            address={wallet?.address ?? ''}
            className="form-item-title"
            chain={sideChainSuffix}
          ></HashAddress>
        </a>
      ),
    },
    {
      key: '1',
      label: (
        <span className="card-sm-text text-Neutral-Secondary-Text">
          {info?.symbol || 'ELF'} Balance
        </span>
      ),
      children: (
        <div className="w-full text-right card-sm-text-bold">
          {elfBalance} <SymbolText symbol={info?.symbol || 'ELF'} />
        </div>
      ),
    },
    {
      key: '2',
      label: (
        <span className="card-sm-text text-Neutral-Secondary-Text">{info?.symbol} Staked</span>
      ),
      children: (
        <div className="w-full text-right card-sm-text-bold">
          {info?.stakeAmount} <SymbolText symbol={info?.symbol || 'ELF'} />
        </div>
      ),
    },
    {
      key: '3',
      label: <span className="card-sm-text text-Neutral-Secondary-Text">Votes</span>,
      children: (
        <div className="w-full text-right card-sm-text-bold">{info?.votesAmount} Votes</div>
      ),
    },
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUnstakeAmModalOpen, setIsUnstakeAmIsModalOpen] = useState(false);
  const { isSyncQuery } = useAelfWebLoginSync();

  const handleClaim = useCallback(async () => {
    // call contract
    if (!daoId) {
      message.error('daoId is required');
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
          buttonList: [okButtonConfig],
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
      <div className="text-[18px] text-white font-Montserrat mb-[20px]">
        {titleNode ?? 'My Info'}
      </div>
      {isLogin ? (
        isLoading || isExtraDataLoading ? (
          <SkeletonLine lines={6} />
        ) : (
          <>
            {!isOnlyShowVoteOption && (
              <>
                <Descriptions colon={false} title="" items={myInfoItems} column={1} />
                {/* cliam */}
                <Divider className="my-0" />
                <div className="flex justify-between items-start my-[16px]">
                  <div>
                    <div className="card-sm-text text-Neutral-Secondary-Text mb-1">
                      Available for Unstaking
                    </div>
                    <div className="text-Primary-Text  card-sm-text-bold">
                      {info?.availableUnStakeAmount} {info?.symbol}
                    </div>
                  </div>
                  <Button
                    type="primary"
                    size="medium"
                    className="!rounded-[42px]"
                    onClick={() => {
                      if (info?.availableUnStakeAmount === 0) {
                        message.info('Available for Unstaking is 0');
                      } else {
                        setIsModalOpen(true);
                      }
                    }}
                  >
                    Unstake
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
              open={isModalOpen}
              title={<div className="text-center">Unstake {info?.symbol} on aelf SideChain</div>}
              destroyOnClose
              onCancel={() => {
                form.setFieldValue('unStakeAmount', 0);
                setIsModalOpen(false);
              }}
            >
              <div className="text-center color-text-Primary-Text font-medium">
                <span className="text-[32px] leading-[40px] font-medium">
                  {info?.availableUnStakeAmount}
                </span>
                <span className="normal-text-bold pl-[8px]">{info.symbol}</span>
              </div>
              <div className="text-center card-sm-text text-Neutral-Secondary-Text mb-[24px]">
                Available for Unstaking
              </div>
              <Form form={form} layout="vertical" variant="filled" onFinish={handleClaim}>
                <Form.Item<TFieldType>
                  label={
                    <Tooltip
                      title={
                        <div>
                          Currently, the only supported method is to unstake all the available{' '}
                          {info.symbol} in one time.
                        </div>
                      }
                    >
                      <div className="flex items-center">
                        <span className="form-item-title font-normal ">Unstake Amount</span>
                        <InfoCircleOutlined className="cursor-pointer pl-[8px] text-Neutral-Disable-Text" />
                      </div>
                    </Tooltip>
                  }
                  name="unstakeAmount"
                  className=""
                >
                  <InputNumber
                    className="w-full"
                    placeholder="pleas input Unstake Amount"
                    defaultValue={info?.availableUnStakeAmount}
                    disabled
                    prefix={
                      <div className="flex items-center">
                        <Symbol symbol={info.symbol} className="unstake-form-token" />
                        <Divider type="vertical" />
                      </div>
                    }
                  />
                </Form.Item>
                <Button className="mx-auto" type="primary" htmlType="submit">
                  Unstake
                </Button>
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
