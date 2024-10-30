import { Button, Progress } from 'antd';
import Scene from './index';
import { ImageLoveNode } from './ImageLoveNode';
import { useEffect, useRef, useState } from 'react';
import { eventBus, GetTokenLogin } from 'utils/myEvent';
import { TransferStatus } from 'types/telegram';
import CommonDrawer, { ICommonDrawerRef } from '../../components/CommonDrawer';
import { nftTokenTransfer, nftTokenTransferStatus, reportUserSource } from 'api/request';
import { curChain, nftSymbol } from 'config';
import { retryWrap } from 'utils/request';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import { useConfig } from 'components/CmsGlobalConfig/type';
import Footer from '../../components/Footer';
import TimeoutTip from '../../components/TimeoutTip';
import { TelegramPlatform } from '@portkey/did-ui-react';
import { parseStartAppParams } from '../../util/start-params';

interface ISceneLoadingProps {
  onFinish?: (isAlreadyClaimed?: boolean) => void;
}
const LoadingFailedIcon = () => {
  return (
    <div className="drawer-retry-icon-wrap">
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M16 14C15.1595 14.0003 14.3472 14.303 13.7115 14.8529C13.0758 15.4027 12.6592 16.163 12.5378 16.9947C12.4165 17.8264 12.5985 18.674 13.0506 19.3825C13.5027 20.0911 14.1946 20.6133 15 20.8538V23C15 23.2652 15.1054 23.5196 15.2929 23.7071C15.4804 23.8946 15.7348 24 16 24C16.2652 24 16.5196 23.8946 16.7071 23.7071C16.8946 23.5196 17 23.2652 17 23V20.8538C17.8054 20.6133 18.4973 20.0911 18.9494 19.3825C19.4015 18.674 19.5835 17.8264 19.4622 16.9947C19.3408 16.163 18.9242 15.4027 18.2885 14.8529C17.6528 14.303 16.8405 14.0003 16 14ZM16 19C15.7033 19 15.4133 18.912 15.1666 18.7472C14.92 18.5824 14.7277 18.3481 14.6142 18.074C14.5006 17.7999 14.4709 17.4983 14.5288 17.2074C14.5867 16.9164 14.7296 16.6491 14.9393 16.4393C15.1491 16.2296 15.4164 16.0867 15.7074 16.0288C15.9983 15.9709 16.2999 16.0007 16.574 16.1142C16.8481 16.2277 17.0824 16.42 17.2472 16.6666C17.412 16.9133 17.5 17.2033 17.5 17.5C17.5 17.8978 17.342 18.2794 17.0607 18.5607C16.7794 18.842 16.3978 19 16 19ZM26 10H22V7C22 5.4087 21.3679 3.88258 20.2426 2.75736C19.1174 1.63214 17.5913 1 16 1C14.4087 1 12.8826 1.63214 11.7574 2.75736C10.6321 3.88258 10 5.4087 10 7V10H6C5.46957 10 4.96086 10.2107 4.58579 10.5858C4.21071 10.9609 4 11.4696 4 12V26C4 26.5304 4.21071 27.0391 4.58579 27.4142C4.96086 27.7893 5.46957 28 6 28H26C26.5304 28 27.0391 27.7893 27.4142 27.4142C27.7893 27.0391 28 26.5304 28 26V12C28 11.4696 27.7893 10.9609 27.4142 10.5858C27.0391 10.2107 26.5304 10 26 10ZM12 7C12 5.93913 12.4214 4.92172 13.1716 4.17157C13.9217 3.42143 14.9391 3 16 3C17.0609 3 18.0783 3.42143 18.8284 4.17157C19.5786 4.92172 20 5.93913 20 7V10H12V7ZM26 26H6V12H26V26Z"
          fill="#B1B3BC"
        />
      </svg>
    </div>
  );
};
const loadingCompletePercent = 60;
function SceneLoading(props: ISceneLoadingProps) {
  const { onFinish } = props;
  const { loginScreen } = useConfig() ?? {};
  const [processText, setProcessText] = useState(loginScreen?.progressTips?.[0] ?? '');
  const [percent, setPercent] = useState(10);
  const [isTimeout, setIsTimeout] = useState(false);
  const retryFn = useRef<() => Promise<void>>();
  const retryDrawerRef = useRef<ICommonDrawerRef>(null);
  const requestNftTransferRef = useRef<() => Promise<void>>();
  const reportSourceRef = useRef<() => void>();
  const fakeProgressTimer = useRef<NodeJS.Timeout>();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const percentRef = useRef(0);
  percentRef.current = percent;
  const { walletInfo: wallet } = useConnectWallet();
  const enterNextScene = async (isAlreadyClaimed?: boolean) => {
    setPercent(100);
    try {
      onFinish?.(isAlreadyClaimed);
    } catch (error) {
      onFinish?.(isAlreadyClaimed);
    }
  };
  const checkMintStatus = async () => {
    const transferStatusError = () => {
      retryFn.current = checkMintStatus;
      retryDrawerRef.current?.open();
    };
    retryDrawerRef.current?.close();
    try {
      const res = await retryWrap<INftTokenTransferStatusRes>(
        async () =>
          nftTokenTransferStatus({
            chainId: curChain,
            address: wallet!.address,
            symbol: nftSymbol,
          }),
        (loopRes) => loopRes?.data?.status === TransferStatus.AlreadyClaimed,
      );
      if (res) {
        enterNextScene();
      } else {
        transferStatusError();
      }
    } catch (error) {
      transferStatusError();
    }
  };
  const requestNftTransfer = async () => {
    const transferError = () => {
      retryFn.current = requestNftTransfer;
      retryDrawerRef.current?.open();
    };
    retryDrawerRef.current?.close();
    try {
      const res = await nftTokenTransfer({
        chainId: curChain,
        symbol: nftSymbol,
      });
      if (res.data.status === TransferStatus.AlreadyClaimed) {
        enterNextScene(true);
        return;
      }
      if (res.data.status === TransferStatus.TransferFailed) {
        transferError();
        return;
      }
      if (res.data.status === TransferStatus.TransferInProgress) {
        checkMintStatus();
      }
    } catch (error) {
      transferError();
    }
  };
  requestNftTransferRef.current = requestNftTransfer;

  const reportSource = () => {
    const startParam = TelegramPlatform.getInitData()?.start_param ?? '';
    const params = parseStartAppParams(startParam);
    const source = params.source ?? '';
    if (source) {
      reportUserSource({
        chainId: curChain,
        source: source,
      });
    }
  };
  reportSourceRef.current = reportSource;
  useEffect(() => {
    const callBack = () => {
      clearInterval(fakeProgressTimer.current);
      setPercent(loadingCompletePercent);
      setProcessText(loginScreen?.progressTips?.[1] ?? '');
      requestNftTransferRef.current?.();
      reportSourceRef.current?.();
    };
    eventBus.on(GetTokenLogin, callBack);
    return () => {
      eventBus.off(GetTokenLogin, callBack);
    };
  }, []);
  useEffect(() => {
    fakeProgressTimer.current = setInterval(() => {
      const curPercent = percentRef.current + 1;
      if (curPercent >= loadingCompletePercent) {
        clearInterval(fakeProgressTimer.current);
        return;
      }
      setPercent(curPercent);
    }, 1000);
    return () => {
      clearInterval(fakeProgressTimer.current);
    };
  }, []);
  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setIsTimeout(true);
    }, 2000 * 60);
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, []);
  return (
    <>
      <CommonDrawer
        title="Minting Failed"
        ref={retryDrawerRef}
        body={
          <div className="flex flex-col items-center">
            <LoadingFailedIcon />
            <p className="font-14-18 mt-[24px] text-center">
              Something went wrong while minting your TomorrowPass NFT. Please try again.
            </p>
            <Button
              type="primary"
              onClick={() => {
                if (retryFn.current) {
                  retryFn.current();
                }
              }}
            >
              Retry
            </Button>
          </div>
        }
      />
      <Scene
        style={{
          display: isTimeout ? 'none' : 'block',
        }}
        title={
          <span
            dangerouslySetInnerHTML={{
              __html: `${loginScreen?.title}`,
            }}
          ></span>
        }
        description={
          <span
            dangerouslySetInnerHTML={{
              __html: loginScreen?.subtitle ?? '',
            }}
          ></span>
        }
        imageNode={<ImageLoveNode />}
        foot={
          <div className="scene-loading-foot">
            <p className="sub-title-text text-[#B1B3BC] text-center">{processText}</p>
            <div className="progress-wrap">
              <Progress
                percent={percent}
                strokeColor="#4600C5"
                trailColor="#212125"
                showInfo={false}
              />
            </div>
          </div>
        }
      />
      <TimeoutTip style={{ display: isTimeout ? 'flex' : 'none' }} />
    </>
  );
}
export default SceneLoading;
