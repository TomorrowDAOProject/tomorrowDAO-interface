import { curChain } from 'config';
import { useEffect, useRef } from 'react';
import { IPointsListRes } from '../pageComponents/VoteList/type';
import SignalR from 'utils/socket/signalr';

interface IProps {
  onReceivePointsProduce?: (nftItem: IPointsListRes) => void;
}

export default function useVotePoints(
  socketIns: SignalR | null,
  proposalId: string,
  params: IProps,
) {
  const { onReceivePointsProduce } = params || {};
  const onReceivePointsProduceRef = useRef(onReceivePointsProduce);
  onReceivePointsProduceRef.current = onReceivePointsProduce;
  useEffect(() => {
    const initSocket = async () => {
      if (!socketIns) {
        return;
      }
      const requestData = () => {
        console.log('send', 'RequestPointsProduce');
        socketIns.sendEvent('RequestPointsProduce', { chainId: curChain, proposalId: proposalId });
      };
      requestData();
      socketIns.connection?.onreconnected(requestData);
      socketIns.registerHandler('ReceivePointsProduce', (data: IPointsListRes) => {
        console.log('ReceivePointsProduce', data);
        onReceivePointsProduceRef.current?.(data);
      });
    };
    initSocket();

    return () => {
      socketIns?.destroy();
    };
  }, [socketIns]);
}
