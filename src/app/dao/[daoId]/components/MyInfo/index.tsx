import { Descriptions, Divider, Form, List, InputNumber } from 'antd';
import { HashAddress, Typography, FontWeightEnum, Button } from 'aelf-design';
import { ReactNode, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import ElfIcon from 'assets/imgs/elf-icon.svg';
import SuccessGreenIcon from 'assets/imgs/success-green.svg';
import CommonModal from 'components/CommonModal';
import { useWalletService } from 'hooks/useWallet';
import Info from '../Info';
import { fetchProposalMyInfo, ProposalMyInfo } from 'api/request';
import { store } from 'redux/store';
import { useSelector } from 'react-redux';
import { callContract, GetBalanceByContract } from 'contract/callContract';
import { curChain, voteAddress } from 'config';
import { emitLoading } from 'utils/myEvent';
import { getExploreLink } from 'utils/common';
import BigNumber from 'bignumber.js';

type InfoTypes = {
  height?: number;
  children?: ReactNode;
  clssName?: string;
  daoId: string;
  proposalId?: string;
};

type FieldType = {
  unstakeAmount: number;
};

export default function MyInfo(props: InfoTypes) {
  const { height, clssName, daoId, proposalId } = props;
  const { login, isLogin } = useWalletService();
  const elfInfo = store.getState().elfInfo.elfInfo;
  const { walletInfo } = useSelector((store: any) => store.userInfo);
  const [elfBalance, setElfBalance] = useState(0);
  const [txHash, setTxHash] = useState('');
  const [info, setInfo] = useState<ProposalMyInfo>({
    symbol: 'ELF',
    availableUnStakeAmount: 1000,
    stakeAmount: '',
    votesAmount: '',
    canVote: true,
    proposalIdList: [],
  });

  const [form] = Form.useForm();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailedModal, setShowFailedModal] = useState(false);
  const fetchMyInfo = useCallback(async () => {
    if (!isLogin || !elfInfo.curChain || !daoId || !walletInfo.address) {
      return;
    }
    const reqMyInfoParams: ProposalMyInfoReq = {
      chainId: elfInfo.curChain,
      daoId: daoId,
      address: walletInfo.address,
    };
    if (proposalId) {
      reqMyInfoParams.proposalId = proposalId;
    }

    const res = await fetchProposalMyInfo(reqMyInfoParams);
    const data: ProposalMyInfo = res?.data || {};
    if (!data?.symbol) {
      data.symbol = 'ELF';
    }
    console.log(data);
    setInfo(data);
  }, [daoId, proposalId, elfInfo.curChain, walletInfo.address, isLogin]);

  useEffect(() => {
    fetchMyInfo();
  }, [fetchMyInfo]);

  const getBalance = useCallback(async () => {
    console.log('getBalance');
    if (!isLogin || !walletInfo.address || !curChain) {
      return;
    }
    const { balance } = await GetBalanceByContract(
      {
        symbol: info?.symbol || 'ELF',
        owner: walletInfo.address,
      },
      { chain: curChain },
    );
    // aelf decimal 8
    setElfBalance(new BigNumber(balance).div(10 ** 8).toNumber());
  }, [isLogin, walletInfo.address, info?.symbol]);

  useEffect(() => {
    getBalance();
  }, [getBalance]);

  // const listData = Array.from({ length: 3 }, (index: number) => {
  //   return {
  //     name: 'fasf',
  //     value: 11 + index,
  //   };
  // });

  const myInfoItems = [
    {
      key: '0',
      label: '',
      children: info && (
        <HashAddress
          preLen={8}
          endLen={11}
          address={walletInfo.address}
          className="address"
        ></HashAddress>
      ),
    },
    {
      key: '1',
      label: 'ELF Balance',
      children: <div className="w-full text-right">{elfBalance} ELF</div>,
    },
    {
      key: '2',
      label: 'Staked ' + info?.symbol,
      children: (
        <div className="w-full text-right">
          {info?.stakeAmount} {info?.symbol}
        </div>
      ),
    },
    {
      key: '3',
      label: 'Voted',
      children: <div className="w-full text-right">{info?.votesAmount} Votes</div>,
    },
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUnstakeAmModalOpen, setIsUnstakeAmIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleClaim = async (values: FieldType) => {
    // call contract
    const contractParams = {
      daoId,
      withdrawAmount: values.unstakeAmount,
      votingItemIdList: info?.proposalIdList,
    };
    try {
      emitLoading(true, 'The unstake is being processed...');
      const result = await callContract('Withdraw', contractParams, voteAddress);
      emitLoading(false);
      console.log(result);
      setTxHash('123123123');
      const resData = false;
      // success
      if (resData) {
        setShowSuccessModal(true);
      } else {
        setShowFailedModal(true);
      }
    } catch (error) {
      setShowFailedModal(true);
      emitLoading(false);
    }
  };

  return (
    <div
      className={`${clssName} border-0 lg:border border-Neutral-Divider border-solid rounded-lg bg-white px-4 pt-2 pb-6 lg:px-8  lg:py-6`}
      style={{
        height: height || 'auto',
      }}
    >
      <Typography.Title fontWeight={FontWeightEnum.Medium} level={6} className="pb-6">
        My Info
      </Typography.Title>
      {isLogin ? (
        <div>
          <Descriptions colon={false} title="" items={myInfoItems} column={1} />
          {/* cliam */}
          <Divider className="mt-0 mb-4" />
          <div className="flex justify-between items-start">
            <div>
              <div className="text-Neutral-Secondary-Text text-sm mb-1">Available to unstake</div>
              <div className="text-Primary-Text font-medium">
                {info?.availableUnStakeAmount} {info?.symbol}
              </div>
            </div>
            <Button type="primary" size="medium" onClick={showModal}>
              Claim
            </Button>
          </div>
          {info?.canVote && (
            <div className="flex justify-between items-center mt-4">
              <Button type="primary" size="medium" millisecondOfDebounce={1000}>
                Approve
              </Button>
              <Button type="primary" size="medium" danger millisecondOfDebounce={1000}>
                Reject
              </Button>
              <Button
                type="primary"
                size="medium"
                millisecondOfDebounce={1000}
                className="bg-abstention"
              >
                Abstain
              </Button>
            </div>
          )}
          {/* Claim Modal  */}
          <CommonModal
            open={isModalOpen}
            title={<div className="text-center">Claim ELF on MainChain AELF</div>}
            onCancel={handleCancel}
          >
            {/* <p className="text-center color-text-Primary-Text font-medium">
              An upgrade of smart contract ELF_DBCC...C3BW_AELF on MainChain AELF on MainChain AELF
            </p> */}
            <div className="text-center color-text-Primary-Text font-medium">
              <span className="text-[32px] mr-1">{info?.availableUnStakeAmount}</span>
              <span>ELF</span>
            </div>
            <div className="text-center text-Neutral-Secondary-Text">Available to unstake</div>
            <Form form={form} layout="vertical" variant="filled" onFinish={handleClaim}>
              <Form.Item<FieldType>
                label="Unstake Amount"
                name="unstakeAmount"
                tooltip="Currently, only one-time withdrawal of all unlocked ELF is supported."
                rules={[{ required: true, message: 'Please input Unstake Amount!' }]}
              >
                <InputNumber
                  className="w-full"
                  placeholder="pleas input Unstake Amount"
                  min={0}
                  max={info?.availableUnStakeAmount}
                  prefix={
                    <div className="flex items-center">
                      <Image width={24} height={24} src={ElfIcon} alt="" />
                      <span className="text-Neutral-Secondary-Text ml-1">ELF</span>
                      <Divider type="vertical" />
                    </div>
                  }
                />
              </Form.Item>
              <Form.Item>
                <Button className="mx-auto" type="primary" htmlType="submit">
                  Claim
                </Button>
              </Form.Item>
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
            <p>Currently, only one-time withdrawal of all unlocked ELF is supported.</p>
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

          {/* success */}
          <CommonModal
            title="Transaction submitted successfully!"
            open={showSuccessModal}
            onCancel={() => {
              setShowSuccessModal(false);
            }}
          >
            <Image className="mx-auto block" width={56} height={56} src={SuccessGreenIcon} alt="" />
            <div className="text-center text-Primary-Text font-medium">
              <span className="text-[32px] mr-1">{form.getFieldValue('unstakeAmount')}</span>
              <span>ELF</span>
            </div>
            <p className="text-center text-Neutral-Secondary-Text font-medium">
              Congratulations, transaction submitted successfully!
            </p>
            {/* <List
              size="small"
              dataSource={listData}
              className="bg-Neutral-Hover-BG py-2"
              renderItem={(item) => (
                <List.Item className="border-0">
                  <Typography.Text> {item.name}</Typography.Text>
                  <Typography.Text> {item.value}</Typography.Text>
                </List.Item>
              )}
            /> */}
            <Button
              className="mx-auto mt-6 w-[206px]"
              type="primary"
              onClick={() => {
                setShowSuccessModal(false);
              }}
            >
              I Know
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
            open={showFailedModal}
            onCancel={() => {
              setShowFailedModal(false);
            }}
          >
            <Info
              title="Transaction Failed!"
              firstText="Insufficient transaction fee."
              secondText="Please transfer some ELF to the account."
              btnText="Back"
              type="failed"
              onOk={() => {
                setShowFailedModal(false);
              }}
            ></Info>
          </CommonModal>
        </div>
      ) : (
        <div>
          <Button className="w-full mb-4" type="primary" onClick={login}>
            Log In
          </Button>
          <div className="text-center text-Neutral-Secondary-Text">
            Connect wallet to view your votes.
          </div>
        </div>
      )}
      <div>{props.children}</div>
    </div>
  );
}
