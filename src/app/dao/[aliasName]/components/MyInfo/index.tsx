import { Descriptions, Divider, Form, InputNumber, message } from 'antd';
import { HashAddress, Button, Tooltip } from 'aelf-design';
import { InfoCircleOutlined } from '@aelf-design/icons';
import React, { ReactNode, useState, useEffect, useCallback } from 'react';
import CommonModal from 'components/CommonModal';
import { useWalletService } from 'hooks/useWallet';
import { fetchProposalMyInfo } from 'api/request';
import { store } from 'redux/store';
import { useSelector } from 'react-redux';
import { callContract, GetBalanceByContract } from 'contract/callContract';
import { curChain, sideChainSuffix, voteAddress } from 'config';
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
type TInfoTypes = {
  height?: number | string;
  children?: ReactNode;
  clssName?: string;
  daoId: string;
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
  const elfInfo = store.getState().elfInfo.elfInfo;
  const { walletInfo } = useSelector((store: any) => store.userInfo);
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

  const [form] = Form.useForm();
  const fetchMyInfo = useCallback(async () => {
    if (!isLogin || !elfInfo.curChain || !daoId || !walletInfo.address) {
      return;
    }
    const reqMyInfoParams: IProposalMyInfoReq = {
      chainId: elfInfo.curChain,
      daoId: daoId,
      address: walletInfo.address,
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
        owner: walletInfo.address,
      },
      { chain: curChain },
    );
    setElfBalance(divDecimals(balance, res?.data?.decimal || '8').toNumber());
    setIsLoading(false);
    if (!res.data) {
      return;
    }
    const data: IMyInfo = res?.data;
    if (!data?.symbol) {
      data.symbol = 'ELF';
    }
    console.log('data?.stakeAmount', data?.stakeAmount);
    const decimal = data?.decimal;
    data.availableUnStakeAmount = divDecimals(data?.availableUnStakeAmount, decimal).toNumber();
    data.stakeAmount = divDecimals(data?.stakeAmount, decimal).toNumber();
    const votesAmountTokenBallot = divDecimals(data.votesAmountTokenBallot, decimal).toNumber();
    data.votesAmount = votesAmountTokenBallot + data.votesAmountUniqueVote;
    setInfo(data);
  }, [daoId, proposalId, elfInfo.curChain, walletInfo.address, isLogin]);

  useEffect(() => {
    fetchMyInfo();
  }, [fetchMyInfo]);

  const myInfoItems = [
    {
      key: '0',
      label: '',
      children: info && (
        <HashAddress
          preLen={8}
          endLen={11}
          address={walletInfo.address}
          className="form-item-title"
          chain={sideChainSuffix}
        ></HashAddress>
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
      className={`flex flex-col border border-Neutral-Divider border-solid rounded-lg bg-white lg:px-8 px-[16px] py-6 ${clssName}`}
      style={{
        height: height || 'auto',
      }}
    >
      <div className="card-title mb-[24px]">{titleNode ?? 'My Info'}</div>
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
          <Button className="w-full mb-4" type="primary" onClick={login}>
            Log in
          </Button>
          <div className="text-center text-Neutral-Secondary-Text">{notLoginTip}</div>
        </div>
      )}
      <div>{props.children}</div>
    </div>
  );
}
