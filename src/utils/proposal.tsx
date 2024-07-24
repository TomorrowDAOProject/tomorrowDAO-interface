import { ResultModal, eventBus } from './myEvent';
import { GetBalanceByContract, GetTokenInfo } from 'contract/callContract';
import { curChain } from 'config';
import { divDecimals } from './calculate';
import { CommonOperationResultModalType } from 'components/CommonOperationResultModal';
import { okButtonConfig } from 'components/ResultModal';
import { AllProposalStatusString, ProposalStatusReplaceMap } from 'types';
import { EDaoGovernanceMechanism } from 'app/(createADao)/create/type';

export const checkMultisigProposal = async (daoData: IDaoInfoRes, address: string) => {
  console.log(daoData, address);
  // return true;
  const res = false;
  if (!res) {
    eventBus.emit(ResultModal, {
      open: true,
      type: CommonOperationResultModalType.Warning,
      primaryContent: "You can't create a proposal",
      secondaryContent: (
        <div>
          You are not a member. Creating proposals in {daoData.data.metadata.name} can only be done
          by addresses that have been added to its member list.
        </div>
      ),
      footerConfig: {
        buttonList: [okButtonConfig],
      },
    });
    return false;
  }
  return res;
};
export const checkTokenProposal = async (daoData: IDaoInfoRes, address: string) => {
  const [balanceInfo, tokenInfo] = await Promise.all([
    GetBalanceByContract(
      {
        symbol: daoData?.data.governanceToken || 'ELF',
        owner: address,
      },
      { chain: curChain },
    ),
    GetTokenInfo(
      {
        symbol: daoData?.data.governanceToken || 'ELF',
      },
      { chain: curChain },
    ),
  ]);
  const proposalThreshold = daoData?.data?.governanceSchemeThreshold?.proposalThreshold;
  const decimals = tokenInfo?.decimals;
  if (
    proposalThreshold &&
    balanceInfo.balance < proposalThreshold &&
    daoData?.data?.governanceToken
  ) {
    const requiredToken = divDecimals(proposalThreshold, decimals).toString();
    eventBus.emit(ResultModal, {
      open: true,
      type: CommonOperationResultModalType.Warning,
      primaryContent: 'Insufficient Governance Tokens',
      secondaryContent: (
        <div>
          {/* <div>Minimum Token Proposal Requirement: {requiredToken}</div> */}
          <div>
            Your Governance Token:{' '}
            {divDecimals(balanceInfo.balance, tokenInfo?.decimals || '8').toNumber()}
          </div>
          <div>
            Can&apos;t create a proposal, you need hold at least {requiredToken}{' '}
            {daoData?.data.governanceToken}. Transfer tokens to your wallet.
          </div>
        </div>
      ),
      footerConfig: {
        buttonList: [okButtonConfig],
      },
    });
    return false;
  }
  return true;
};
export const checkCreateProposal = async (daoData: IDaoInfoRes, address: string) => {
  let res = true;
  if (daoData.data.governanceMechanism === EDaoGovernanceMechanism.Token) {
    res = await checkTokenProposal(daoData, address);
  }
  if (daoData.data.governanceMechanism === EDaoGovernanceMechanism.Multisig) {
    res = await checkMultisigProposal(daoData, address);
  }
  return res;
};

export const getProposalStatusText = (status: string) => {
  const proposalStatus = status as AllProposalStatusString;
  return ProposalStatusReplaceMap[proposalStatus] ?? proposalStatus;
};
