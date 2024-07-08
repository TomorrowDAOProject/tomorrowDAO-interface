import { ConfigProvider, Divider, Form, InputNumber, message } from 'antd';
import { Button } from 'aelf-design';
import { useState, useCallback } from 'react';
import CommonModal from 'components/CommonModal';
import Image from 'next/image';
import { EVoteMechanismNameType } from 'app/proposal/deploy/[aliasName]/type';
import { voteApproveMessage, voteRejectMessage, voteAbstainMessage } from 'utils/constant';
import SuccessGreenIcon from 'assets/imgs/success-green.svg';
import { getExploreLink } from 'utils/common';
import Info from '../Info';
import { callContract, ApproveByContract, GetAllowanceByContract } from 'contract/callContract';
import { emitLoading } from 'utils/myEvent';
import { curChain, voteAddress } from 'config';
import { timesDecimals } from 'utils/calculate';
import { EVoteOption, EVoteOptionLabel } from 'types/vote';
import { TokenIconMap } from 'constants/token';
import { useSelector } from 'redux/store';
import { IContractError } from 'types';
import BigNumber from 'bignumber.js';
import useAelfWebLoginSync from 'hooks/useAelfWebLoginSync';
import { useWebLogin } from 'aelf-web-login';

type TVoteTypes = {
  proposalId: string;
  voteMechanismName: string;
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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalInfo, setShowFailedModal] = useState({
    isOpen: false,
    message: '',
  });
  const { walletInfo } = useSelector((store) => store.userInfo);
  const { wallet } = useWebLogin();
  const [txHash, setTxHash] = useState('');

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
          ? timesDecimals(form.getFieldValue('stakeAmount'), decimal || '8').toNumber()
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
            owner: wallet.address,
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
      setTxHash(result?.TransactionId);
      setShowSuccessModal(true);
      fetchMyInfo();
    } catch (err) {
      const error = err as IContractError;
      console.log('error', error);
      const message = error?.errorMessage?.message || error?.message;
      setShowFailedModal({
        isOpen: true,
        message,
      });
      emitLoading(false);
    }
    // handle vote done close Modal
    setShowTokenBallotModal(false);
    setShowVoteModal(false);
    form.setFieldValue('stakeAmount', 0);
  }, [
    proposalId,
    currentVoteType,
    voteMechanismName,
    form,
    decimal,
    isSyncQuery,
    fetchMyInfo,
    symbol,
    wallet.address,
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
          form.setFieldValue('stakeAmount', 0);
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
          className="mt-[10px]"
        >
          <Form.Item<TFieldType>
            label="Stake and Vote"
            name="stakeAmount"
            tooltip={`Currently, the only supported method is to unstake all the available ${symbol} in one time.`}
            rules={[{ required: true, message: 'Please input stake Amount!' }]}
          >
            <InputNumber
              className="w-full"
              placeholder="pleas input stake amount"
              autoFocus
              min={0}
              max={elfBalance}
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
          <Form.Item>
            <Button className="mx-auto" type="primary" htmlType="submit">
              Stake and Vote
            </Button>
          </Form.Item>
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
        <div className="text-xs text-Neutral-Primary-Text mb-4">{currentMessage}</div>
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

      {/* success */}
      <CommonModal
        title="Transaction submitted successfully"
        open={showSuccessModal}
        onCancel={() => {
          setShowSuccessModal(false);
        }}
      >
        <Image className="mx-auto block" width={56} height={56} src={SuccessGreenIcon} alt="" />
        <p className="text-center text-Neutral-Secondary-Text font-medium">
          {EVoteOptionLabel[currentVoteType]} votes are casted for the proposal.
        </p>
        <Button
          className="mx-auto mt-6 w-[206px]"
          type="primary"
          onClick={() => {
            setShowSuccessModal(false);
          }}
        >
          OK
        </Button>
        <Button
          type="link"
          className="mx-auto text-colorPrimary"
          size="small"
          onClick={() => {
            window.open(getExploreLink(txHash, 'transaction'));
          }}
        >
          View Transaction Details
        </Button>
      </CommonModal>

      {/* failed */}
      <CommonModal
        open={modalInfo.isOpen}
        onCancel={() => {
          setShowFailedModal({
            ...modalInfo,
            isOpen: false,
          });
        }}
      >
        <Info
          title="Transaction Failed!"
          firstText={modalInfo.message}
          btnText="OK"
          type="failed"
          onOk={() => {
            setShowFailedModal({
              ...modalInfo,
              isOpen: false,
            });
          }}
        ></Info>
      </CommonModal>
    </div>
  );
}

export default Vote;
