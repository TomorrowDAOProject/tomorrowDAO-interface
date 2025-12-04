import BoxWrapper from './BoxWrapper';
import { ResultModal, emitLoading, eventBus } from 'utils/myEvent';
import DetailTag from 'components/DetailTag';
import HashAddress from 'components/HashAddress';
import { colorfulSocialMediaIconMap } from 'assets/imgs/socialMediaIcon';
import Image from 'next/image';
import { memo, useState } from 'react';
import dayjs from 'dayjs';
import { curChain, explorer, sideChainSuffix } from 'config';
import ProposalTag from 'app/dao/[aliasName]/components/ProposalsItem/ProposalTag';
import { IContractError, ProposalTypeString } from 'types';
import { CommonOperationResultModalType } from 'components/CommonOperationResultModal';
import Link from 'next/link';
import ProposalStatusDesc from 'app/dao/[aliasName]/components/ProposalsItem/ProposalStatusDesc';
import useResponsive from 'hooks/useResponsive';
import { getProposalStatusText } from 'utils/proposal';
import useAelfWebLoginSync from 'hooks/useAelfWebLoginSync';
import { proposalCreateContractRequest } from 'contract/proposalCreateContract';
import { okButtonConfig } from 'components/ResultModal';
import { ButtonCheckLogin } from 'components/ButtonCheckLogin';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import { fetchProposalDetail } from 'api/request';
import { useAsyncEffect } from 'ahooks';
import { useParams } from 'next/navigation';
import { tagColorMap } from 'app/dao/[aliasName]/constants';
type TagColorKey = keyof typeof tagColorMap;
// import ProposalDetailFile from 'assets/imgs/proposal-detail-file.svg';
interface IHeaderInfoProps {
  proposalDetailData: IProposalDetailData;
  proposalId: string;
}
const HeaderInfo = (props: IHeaderInfoProps) => {
  const [canExecute, setCanExecute] = useState(false);
  const { proposalDetailData, proposalId } = props;
  const { aliasName } = useParams();
  const handleShare = () => {
    const twTitle = `${proposalDetailData.proposalTitle} @tmrwdao`;
    const twUrl = window.location.href;
    // eslint-disable-next-line prettier/prettier
    const url = `http://twitter.com/share?text=${twTitle}&url=${twUrl}`;
    window.open(url);
  };
  const { isLG } = useResponsive();
  const { walletInfo: wallet } = useConnectWallet();

  const { isSyncQuery } = useAelfWebLoginSync();
  const handleExecProposal = async () => {
    try {
      if (!isSyncQuery()) {
        return;
      }
      emitLoading(true, 'The vote is being processed...');

      const createRes = await proposalCreateContractRequest(
        'ExecuteProposal',
        proposalDetailData.proposalId,
      );
      emitLoading(false);
      eventBus.emit(ResultModal, {
        open: true,
        type: CommonOperationResultModalType.Success,
        secondaryContent: `Proposal Executed Successfully`,
        footerConfig: {
          buttonList: [okButtonConfig],
        },
        viewTransactionId: createRes?.TransactionId,
      });
    } catch (err) {
      const error = err as IContractError;
      const message = error?.errorMessage?.message || error?.message;
      eventBus.emit(ResultModal, {
        open: true,
        type: CommonOperationResultModalType.Error,
        primaryContent: 'Proposal Executed Failed',
        secondaryContent: message?.toString?.(),
        footerConfig: {
          buttonList: [okButtonConfig],
        },
      });
      emitLoading(false);
    }
  };
  useAsyncEffect(async () => {
    if (!wallet?.address) {
      return;
    }
    const params: IProposalDetailReq = {
      proposalId,
      chainId: curChain,
    };
    if (wallet.address) {
      params.address = wallet.address;
    }
    const res = await fetchProposalDetail(params);
    setCanExecute(res?.data?.canExecute);
  }, [wallet?.address]);
  const proposalStatus = proposalDetailData.proposalStatus as TagColorKey;
  return (
    <BoxWrapper>
      <div className="flex justify-between items-start">
        <div className="flex gap-2 lg:flex-row flex-col">
          <DetailTag
            customStyle={{
              text: getProposalStatusText(proposalStatus),
              height: 20,
              color: tagColorMap[proposalStatus]?.textColor,
              bgColor: tagColorMap[proposalStatus]?.bgColor,
            }}
            className="max-content"
          />
          <span className="text-lightGrey card-xsm-text">
            <ProposalStatusDesc proposalItem={proposalDetailData as unknown as IProposalsItem} />
          </span>
        </div>
        <div className="flex gap-6">
          <div
            className="cursor-pointer bg-darkGray border border-solid border-fillBg8 rounded-[25px] text-white flex justify-center leading-[15px] items-center py-[3px] px-[12px]"
            onClick={handleShare}
          >
            <Image src={colorfulSocialMediaIconMap.Twitter} alt="x" width={13} height={13} />
            <span className="pl-[8px] text-white text-[12px] font-medium font-Montserrat">
              {isLG ? 'Share' : 'Share on X'}
            </span>
          </div>
        </div>
      </div>
      <div className="title-tag-button-wrap">
        <div className="py-[22px]">
          <span className="card-title-lg break-words">{proposalDetailData.proposalTitle}</span>
        </div>
        <div className="flex gap-2 pb-[22px]">
          <ProposalTag
            proposalType={proposalDetailData.proposalType}
            proposalSource={proposalDetailData.proposalSource}
            governanceMechanism={proposalDetailData.governanceMechanism}
          />
        </div>
        {canExecute && proposalDetailData.proposer === wallet?.address && (
          <ButtonCheckLogin type="primary" className="execute-button" onClick={handleExecProposal}>
            Execute
          </ButtonCheckLogin>
        )}
      </div>
      <div className="proposal-detail-key-value border-0 border-t border-solid border-fillBg8 flex pt-[22px] gap-y-4 gap-x-0 lg:gap-x-16 lg:gap-y-0 lg:flex-row flex-col flex-wrap">
        {proposalDetailData.proposalType === ProposalTypeString.Veto && (
          <div className="flex items-center gap-4">
            <span className="text-lightGrey card-sm-text">Veto Proposal:</span>
            <Link href={`/dao/${aliasName}/proposal/${proposalDetailData.vetoProposalId}`}>
              <HashAddress
                preLen={8}
                endLen={9}
                ignorePrefixSuffix={true}
                iconColor="#989DA0"
                iconSize="14px"
                className="hash-link-color card-sm-text-bold text-[13px]"
                address={proposalDetailData.vetoProposalId ?? '-'}
                primaryIconColor={'#989DA0'}
                addressHoverColor={'white'}
                addressActiveColor={'white'}
              ></HashAddress>
            </Link>
          </div>
        )}
        <div className="flex items-center gap-4">
          <span className="text-lightGrey text-[13px]">Poster:</span>
          <a
            href={`${explorer}/address/${proposalDetailData.proposer}`}
            target="_blank"
            rel="noreferrer"
          >
            <HashAddress
              preLen={8}
              endLen={9}
              address={proposalDetailData.proposer}
              className="text-white !text-[13px]"
              chain={sideChainSuffix}
              iconColor="#989DA0"
              iconSize="14px"
              primaryIconColor={'#989DA0'}
              addressHoverColor={'white'}
              addressActiveColor={'white'}
            ></HashAddress>
          </a>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-lightGrey text-[13px]">Proposal ID:</span>
          <HashAddress
            preLen={8}
            endLen={9}
            ignorePrefixSuffix={true}
            address={proposalDetailData.proposalId ?? '-'}
            className="text-white text-[13px]"
            primaryIconColor={'#989DA0'}
            iconColor="#989DA0"
            iconSize="14px"
            addressHoverColor={'white'}
            addressActiveColor={'white'}
          ></HashAddress>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-lightGrey text-[13px]">Published:</span>
          <span className="text-white text-[13px]">
            {proposalDetailData.deployTime
              ? dayjs(proposalDetailData.deployTime).format('YYYY-MM-DD HH:mm:ss')
              : '-'}
          </span>
        </div>
      </div>
    </BoxWrapper>
  );
};

export default memo(HeaderInfo);
