import { Divider, Form, InputNumber, message } from 'antd';
import { Button } from 'aelf-design';
import { useState, useCallback } from 'react';
import CommonModal from 'components/CommonModal';
import Image from 'next/image';
import { EVoteMechanismNameType } from 'pageComponents/proposal-create/type';
import { voteApproveMessage, voteRejectMessage, voteAbstainMessage } from 'utils/constant';
import { callContract, ApproveByContract, GetAllowanceByContract } from 'contract/callContract';
import { ResultModal, emitLoading, eventBus } from 'utils/myEvent';
import { curChain, voteAddress } from 'config';
import { timesDecimals } from 'utils/calculate';
import { EVoteOption, EVoteOptionLabel } from 'types/vote';
import { TokenIconMap } from 'constants/token';
import { IContractError } from 'types';
import BigNumber from 'bignumber.js';
import useAelfWebLoginSync from 'hooks/useAelfWebLoginSync';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';

import { CommonOperationResultModalType } from 'components/CommonOperationResultModal';
import { okButtonConfig } from 'components/ResultModal';

type TVoteTypes = {
  proposalId: string;
  voteMechanismName?: string;
  elfBalance: number;
  symbol: string;
  fetchMyInfo: () => void;
  votesAmount: number;
  decimal: string;
  canVote?: boolean;
  className?: string;
};

type TFieldType = {
  stakeAmount: number;
};

function Vote(props: TVoteTypes) {
  const {
    proposalId,
    voteMechanismName,
    elfBalance,
    symbol,
    fetchMyInfo,
    votesAmount,
    decimal,
    canVote,
    className,
  } = props;
  const [form] = Form.useForm();
  const [currentVoteType, setCurrentVoteType] = useState<EVoteOption>(EVoteOption.APPROVED);
  const [currentTitle, setCurrentTitle] = useState('');
  const [currentMessage, setCurrentMessage] = useState('');
  const [showTokenBallotModal, setShowTokenBallotModal] = useState(false);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const { walletInfo: wallet } = useConnectWallet();

  const handlerModal = (voteType: number) => {
    // if have voted, can't vote again
    if (votesAmount > 0) {
      message.info('You have already voted!');
      return;
    }
    setCurrentVoteType(voteType);
    switch (voteType) {
      case EVoteOption.APPROVED:
        setCurrentTitle('Approve Proposal');
        setCurrentMessage(voteApproveMessage);
        break;
      case EVoteOption.REJECTED:
        setCurrentTitle('Reject Proposal');
        setCurrentMessage(voteRejectMessage);
        break;
      case EVoteOption.ABSTAINED:
        setCurrentTitle('Abstain Proposal');
        setCurrentMessage(voteAbstainMessage);
        break;
      default:
        break;
    }
    if (voteMechanismName === EVoteMechanismNameType.TokenBallot) {
      setShowTokenBallotModal(true);
      return;
    }
    setShowVoteModal(true);
  };
  const { isSyncQuery } = useAelfWebLoginSync();

  const handlerVote = useCallback(async () => {
    const contractParams = {
      votingItemId: proposalId,
      voteOption: currentVoteType,
      // if 1t1v vote, need to approve token
      // elf decimals 8
      voteAmount:
        voteMechanismName === EVoteMechanismNameType.TokenBallot
          ? timesDecimals(form.getFieldValue('stakeAmount'), decimal ?? '8').toNumber()
          : 1,
    };
    try {
      if (!isSyncQuery()) {
        return;
      }
      setShowVoteModal(false);
      setShowTokenBallotModal(false);
      emitLoading(true, 'The vote is being processed...');
      if (voteMechanismName === EVoteMechanismNameType.TokenBallot) {
        const allowance = await GetAllowanceByContract(
          {
            spender: voteAddress || '',
            symbol: symbol || 'ELF',
            owner: wallet!.address,
          },
          {
            chain: curChain,
          },
        );
        if (allowance.error) {
          message.error(allowance.errorMessage?.message || 'unknown error');
        }
        const bigA = BigNumber(contractParams.voteAmount);
        const allowanceBN = BigNumber(allowance?.allowance);
        if (allowanceBN.lt(bigA)) {
          const approveRes = await ApproveByContract(
            {
              spender: voteAddress,
              symbol: symbol || 'ELF',
              amount: contractParams.voteAmount,
            },
            {
              chain: curChain,
            },
          );
          console.log('token approve finish', approveRes);
        }
      }

      const result = await callContract('Vote', contractParams, voteAddress);
      emitLoading(false);
      eventBus.emit(ResultModal, {
        open: true,
        type: CommonOperationResultModalType.Success,
        secondaryContent: `${EVoteOptionLabel[currentVoteType]} votes has been casted for the proposal`,
        footerConfig: {
          buttonList: [okButtonConfig],
        },
        viewTransactionId: result?.TransactionId,
      });
      fetchMyInfo();
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
    // handle vote done close Modal
    setShowTokenBallotModal(false);
    setShowVoteModal(false);
    form.setFieldValue('stakeAmount', 1);
  }, [
    proposalId,
    currentVoteType,
    voteMechanismName,
    form,
    decimal,
    isSyncQuery,
    fetchMyInfo,
    symbol,
    wallet,
  ]);

  return (
    <div className={`flex justify-between gap-[16px] items-center ${className}`}>
      <Button
        type="primary"
        size="medium"
        millisecondOfDebounce={1000}
        className="approve-button flex-1"
        onClick={() => handlerModal(EVoteOption.APPROVED)}
        disabled={!canVote}
      >
        Approve
      </Button>
      <Button
        type="primary"
        size="medium"
        className="reject-button flex-1"
        millisecondOfDebounce={1000}
        onClick={() => handlerModal(EVoteOption.REJECTED)}
        disabled={!canVote}
      >
        Reject
      </Button>
      <Button
        type="primary"
        size="medium"
        millisecondOfDebounce={1000}
        className="abstention-button flex-1"
        onClick={() => handlerModal(EVoteOption.ABSTAINED)}
        disabled={!canVote}
      >
        Abstain
      </Button>

      {/* vote TokenBallot 1t1v Modal  */}
      <CommonModal
        open={showTokenBallotModal}
        destroyOnClose
        title={<div className="text-center">{currentTitle}</div>}
        onCancel={() => {
          form.setFieldValue('stakeAmount', 1);
          setShowTokenBallotModal(false);
        }}
      >
        <div className="text-center color-text-Primary-Text font-medium">
          <span className="text-[32px] mr-1">{elfBalance}</span>
          <span>{symbol}</span>
        </div>
        {/* <div className="text-center text-Neutral-Secondary-Text">Available for Unstaking</div> */}
        <Form
          form={form}
          layout="vertical"
          variant="filled"
          onFinish={() => handlerVote()}
          className="mt-[10px] my-info-form"
          requiredMark={false}
        >
          <Form.Item<TFieldType>
            label="Stake and Vote"
            name="stakeAmount"
            validateFirst
            initialValue={1}
            tooltip={`Currently, the only supported method is to unstake all the available ${symbol} in one time.`}
            rules={[
              { required: true, message: 'Please input stake amount' },
              {
                type: 'integer',
                message: 'Please input an integer',
              },
              {
                validator: (_, value) => {
                  return new Promise<void>((resolve, reject) => {
                    if (value < 1) {
                      reject('The quantity must be greater than or equal to 1');
                    }
                    if (value > elfBalance) {
                      reject('Insufficient balance');
                    }
                    resolve();
                  });
                },
              },
            ]}
          >
            <InputNumber
              className="w-full"
              placeholder="Please input stake amount"
              autoFocus
              prefix={
                <div className="flex items-center">
                  {TokenIconMap[symbol] && (
                    <Image width={24} height={24} src={TokenIconMap[symbol]} alt="" />
                  )}
                  <span className="text-Neutral-Secondary-Text ml-1">{symbol}</span>
                  <Divider type="vertical" />
                </div>
              }
            />
          </Form.Item>
          <div>
            <Button className="mx-auto mt-[24px]" type="primary" htmlType="submit">
              Stake and Vote
            </Button>
          </div>
        </Form>
      </CommonModal>
      {/* UniqueVote vote 1a1v 1 approve  2 Reject  3 Abstain  */}
      <CommonModal
        open={showVoteModal}
        title={<div className="text-center">{currentTitle}</div>}
        onCancel={() => {
          setShowVoteModal(false);
        }}
        footer={null}
      >
        <div className="card-sm-text text-center text-Neutral-Primary-Text mb-6">
          {currentMessage}
        </div>
        <Button
          className="mx-auto"
          type="primary"
          size="medium"
          onClick={() => {
            handlerVote();
          }}
        >
          Vote
        </Button>
      </CommonModal>
    </div>
  );
}

export default Vote;
