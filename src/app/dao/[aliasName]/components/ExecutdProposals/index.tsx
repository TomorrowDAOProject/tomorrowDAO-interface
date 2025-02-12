import { Typography, FontWeightEnum, HashAddress } from 'aelf-design';
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
import NoData from 'components/NoData';
import useIsNetworkDao from 'hooks/useIsNetworkDao';
import LinkNetworkDao from 'components/LinkNetworkDao';
import useAelfWebLoginSync from 'hooks/useAelfWebLoginSync';
import Button from 'components/Button';

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
  aliasName: string;
}

export default function ExecutdProposals(props: IExecutdProposals) {
  const { daoId, address, aliasName } = props;
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
      <div className="proposal-execute-lists">
        {!executableListData?.data?.items?.length && (
          <div className="w-full flex items-center text-[12px] justify-center text-lightGrey text-center font-Montserrat">
            No Results found
          </div>
        )}
        {executableListData?.data?.items.map((item, index) => {
          return (
            <div
              className="flex justify-between items-center max-h-80 mb-8 flex-wrap gap-2 xl:gap-0 sm:gap-0"
              key={index}
            >
              <div className="flex-1">
                <div className="flex items-center font-Montserrat text-white flex-wrap">
                  <span className="text-white text-[12px] font-medium">Proposal ID:</span>
                  <Link href={`/dao/${aliasName}/proposal/${item.proposalId}`}>
                    <HashAddress
                      ignorePrefixSuffix
                      preLen={8}
                      endLen={11}
                      address={item.proposalId}
                      primaryIconColor={'#989DA0'}
                      addressHoverColor={'white'}
                      addressActiveColor={'white'}
                    ></HashAddress>
                  </Link>
                </div>
                <div className="text-lightGrey text-[11px] font-Montserrat mt-[6px]">
                  Expires On {dayjs(item.executeEndTime).format('YYYY-MM-DD HH:mm:ss')}
                </div>
              </div>
              <Button
                type="primary"
                size="small"
                className="xl:!w-[57px] xl:!h-[20px] xl:!text-[10px] lg:!w-[57px] lg:!h-[20px] lg:!text-[10px] font-medium"
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
        title={
          <div className="text-white font-Unbounded font-[300] w-full break-words">
            This proposal needs to be executed
          </div>
        }
        className="executed-modal"
      >
        {/* <Typography.Text>
          As a member of this organisation， you need to initiate a request to this organisation to
          execute the proposal.
        </Typography.Text>
        <Button type="link" className="!px-0">
          Click here to view how to execute a proposal
        </Button> */}
        <div className="text-lightGrey text-[12px] font-Montserrat text-center">
          <div>
            Once you mark this proposal as executed, it wil be tagged as executed status meaning
            that other addresses within your organisation will no longer be able to execute this
            proposal.
          </div>
          <div className="mt-[20px]">
            Please ensure that you have completed the execution of this proposal before marking its
            status.
          </div>
        </div>
        <div className="flex mt-6 gap-3">
          <Button
            className="execute-confirm-button w-full"
            type="primary"
            onClick={() => {
              handleMaskExecuted();
            }}
          >
            Mark as executed
          </Button>
          <Button
            className="execute-confirm-button w-full border-white text-white"
            onClick={() => {
              handleClose();
            }}
          >
            Cancel
          </Button>
        </div>
      </CommonModal>
      <CommonModal
        open={showInfoModal}
        onCancel={handleCloseInfo}
        className="executed-confirm-modal"
      >
        <Info
          title={modalInfo.title}
          type={modalInfo.type}
          btnText={modalInfo.btnText}
          onOk={handleCloseInfo}
          firstText={modalInfo.firstText}
        ></Info>
        {modalInfo.txId && (
          <Link href={`${explorer}/tx/${modalInfo.txId}`} className="w-full">
            <Button className="mx-auto w-full" type="link">
              View Transaction Details
            </Button>
          </Link>
        )}
      </CommonModal>
    </div>
  );
}
