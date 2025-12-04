import { curChain, nftSymbol } from 'config';
import { useEffect, useState } from 'react';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import SignalR from 'utils/socket/signalr';

interface NftBalanceChangeProps {
  openModal: () => void;
  closeModal: () => void;
  onNftBalanceChange?: (nftItem: INftBalanceChange) => void;
}

interface INftBalanceChange {
  symbol: string;
  beforeAmount: number;
  nowAmount: number;
  address: string;
}
export default function useNftBalanceChange(
  socketIns: SignalR | null,
  proposalId: string,
  params: NftBalanceChangeProps,
) {
  const { openModal, closeModal, onNftBalanceChange } = params;
  const [disableOperation, setDisableOperation] = useState(false);
  const { walletInfo: wallet } = useConnectWallet();
  useEffect(() => {
    const initSocket = async () => {
      if (!socketIns) {
        return;
      }
      const requestData = () => {
        console.log('send', 'RequestUserBalanceProduce');
        socketIns.sendEvent('RequestUserBalanceProduce', {
          chainId: curChain,
          proposalId,
          address: wallet?.address,
        });
      };
      requestData();
      socketIns.connection?.onreconnected(requestData);
      socketIns.registerHandler('RequestUserBalanceProduce', (nftItem: INftBalanceChange) => {
        console.log('RequestUserBalanceProduce', nftItem);
        if (nftItem.nowAmount === 0 && nftItem.symbol === nftSymbol) {
          setDisableOperation(true);
          openModal();
        } else {
          setDisableOperation(false);
          closeModal();
        }
      });
      socketIns.registerHandler('ReceiveUserBalanceProduce', (nftItem: INftBalanceChange) => {
        console.log('ReceiveUserBalanceProduce', nftItem);
        onNftBalanceChange?.(nftItem);
        if (nftItem.nowAmount === 0 && nftItem.symbol === nftSymbol) {
          setDisableOperation(true);
          openModal();
        } else {
          setDisableOperation(false);
          closeModal();
        }
      });
    };
    initSocket();

    return () => {
      socketIns?.destroy();
    };
  }, [socketIns]);
  return { disableOperation };
}
