import { Typography, FontWeightEnum, Button, HashAddress } from 'aelf-design';
import CommonModal from 'components/CommonModal';
import { useRef, useState } from 'react';
import Info from '../Info';
import { fetchExecutableList } from 'api/request';
import { curChain, explorer } from 'config';
import { useRequest } from 'ahooks';
import dayjs from 'dayjs';
import './index.css';
import { emitLoading } from 'utils/myEvent';
import { proposalCreateContractRequest } from 'contract/proposalCreateContract';
import Link from 'next/link';
import NoData from '../NoData';
import useIsNetworkDao from 'hooks/useIsNetworkDao';
import LinkNetworkDao from 'components/LinkNetworkDao';
import useAelfWebLoginSync from 'hooks/useAelfWebLoginSync';

type TmodalInfoType = {
  title: string;
  type: 'success' | 'failed';
  btnText: string;
  txId?: string;
  firstText?: string;
};

const successModalInfo: TmodalInfoType = {
  title: 'Proposal Executed Successfully',
  type: 'success',
  btnText: 'OK',
};
const failedModalInfo: TmodalInfoType = {
  title: 'Proposal Executed Failed',
  type: 'failed',
  btnText: 'I Know',
};
interface IExecutdProposals {
  daoId: string;
  address: string;
}

export default function ExecutdProposals(props: IExecutdProposals) {
  const { daoId, address } = props;
  // confirm modal: boolean
  const [showModal, setShowModal] = useState(false);
  // success or fail modal: boolean
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);
  // success or fail modal content
  const [modalInfo, setModalInfo] = useState<TmodalInfoType>(successModalInfo);
  const currentProposalidref = useRef<string>('');
  const { isNetWorkDao } = useIsNetworkDao();
  const { isSyncQuery } = useAelfWebLoginSync();
  const {
    data: executableListData,
    error: executableListError,
    // loading: executableListLoading,
  } = useRequest(async () => {
    const params: IExecutableListReq = {
      skipCount: 0,
      maxResultCount: 1000,
      chainId: curChain,
      daoId: daoId,
      proposer: address,
    };
    return fetchExecutableList(params);
  });

  const handleExecute = (id: string) => {
    setShowModal(true);
    currentProposalidref.current = id;
  };

  const handleClose = () => {
    setShowModal(false);
  };

  const handleMaskExecuted = async () => {
    if (!currentProposalidref.current || !isSyncQuery()) {
      return;
    }
    try {
      setShowModal(false);
      emitLoading(true, 'The transaction is being processed...');
      const createRes = await proposalCreateContractRequest(
        'ExecuteProposal',
        currentProposalidref.current,
      );
      setShowInfoModal(true);
      setModalInfo({
        ...successModalInfo,
        txId: createRes.TransactionId,
      });
      emitLoading(false);
    } catch (error: any) {
      const message = error?.errorMessage?.message || error?.message;
      setShowInfoModal(true);
      setModalInfo({
        ...failedModalInfo,
        firstText: message,
      });
      emitLoading(false);
    }
  };

  const handleCloseInfo = () => {
    setShowInfoModal(false);
  };

  return (
    <div className="page-content-bg-border">
      <div className="card-title mb-[24px]">To be executed proposals</div>
      <div className="max-h-96 overflow-y-scroll">
        {!executableListData?.data?.items?.length && <NoData />}
        {executableListData?.data?.items.map((item, index) => {
          return (
            <div className="flex justify-between items-center px-8 max-h-80 mb-8" key={index}>
              <div>
                <div className="block lg:flex items-center">
                  <Typography.Text fontWeight={FontWeightEnum.Medium}>Proposal ID:</Typography.Text>
                  {isNetWorkDao ? (
                    <LinkNetworkDao href={`/proposal-detail-tmrw/${item.proposalId}`}>
                      <HashAddress
                        ignorePrefixSuffix
                        preLen={8}
                        endLen={11}
                        address={item.proposalId}
                      ></HashAddress>
                    </LinkNetworkDao>
                  ) : (
                    <Link href={`/proposal/${item.proposalId}`}>
                      <HashAddress
                        ignorePrefixSuffix
                        preLen={8}
                        endLen={11}
                        address={item.proposalId}
                      ></HashAddress>
                    </Link>
                  )}
                </div>
                <Typography.Text className="text-Neutral-Secondary-Text">
                  Expires On {dayjs(item.executeEndTime).format('YYYY-MM-DD HH:mm:ss')}
                </Typography.Text>
              </div>
              <Button
                type="primary"
                size="small"
                onClick={() => {
                  handleExecute(item.proposalId);
                }}
              >
                Execute
              </Button>
            </div>
          );
        })}
      </div>
      <CommonModal
        open={showModal}
        onCancel={handleClose}
        title="This proposal needs to be executed"
      >
        {/* <Typography.Text>
          As a member of this organisation， you need to initiate a request to this organisation to
          execute the proposal.
        </Typography.Text>
        <Button type="link" className="!px-0">
          Click here to view how to execute a proposal
        </Button> */}
        <Typography.Text>
          Once you mark this proposal as executed, it wil be tagged as executed status meaning that
          other addresses within your organisation will no longer be able to execute this proposal.
          Please ensure that you have completed the execution of this proposal before marking its
          status.
        </Typography.Text>
        <div className="flex mt-6 flex-col  execute-confirm-buttons-group">
          <Button
            className="order-1 lg:order-2 execute-confirm-button"
            onClick={() => {
              handleClose();
            }}
          >
            Cancel
          </Button>
          <Button
            className="order-2 lg:order-1 execute-confirm-button"
            type="primary"
            danger
            onClick={() => {
              handleMaskExecuted();
            }}
          >
            Mark as executed
          </Button>
        </div>
      </CommonModal>
      <CommonModal open={showInfoModal} onCancel={handleCloseInfo}>
        <Info
          title={modalInfo.title}
          type={modalInfo.type}
          btnText={modalInfo.btnText}
          onOk={handleCloseInfo}
          firstText={modalInfo.firstText}
        ></Info>
        {modalInfo.txId && (
          <Link href={`${explorer}/tx/${modalInfo.txId}`}>
            <Button className="mx-auto" type="link">
              View Transaction Details
            </Button>
          </Link>
        )}
      </CommonModal>
    </div>
  );
}
