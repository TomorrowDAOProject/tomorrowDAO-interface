'use client';
import React, { useEffect, Suspense } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'redux/store';
import clsx from 'clsx';
import { LOG_OUT_ACTIONS, LOG_IN_ACTIONS } from 'app/network-dao/_src/redux/actions/proposalCommon';
import dynamicReq from 'next/dynamic';
import Footer from 'components/Footer';
import NetworkDaoHeader from 'components/NetworkDaoHeader';
import PageLoading from 'components/Loading';
import ResultModal from 'components/ResultModal';
import './layout.css';
import './_src/common/index.css';
import { usePathname } from 'next/navigation';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import WebLoginInstance from 'contract/webLogin';
import { WebLoginInstance as WebLoginInstanceClass } from './_src/utils/webLogin';
import { WalletTypeEnum } from '@aelf-web-login/wallet-adapter-base';

const Layout = dynamicReq(
  async () => {
    return (props: React.PropsWithChildren<{}>) => {
      const dispatch = useDispatch();
      const webLoginContext = useConnectWallet();
      const { walletInfo: wallet, isConnected, walletType } = webLoginContext;

      useEffect(() => {
        console.log('network-dao webLoginContext:', webLoginContext);
        WebLoginInstance.get().setWebLoginContext(webLoginContext);
        WebLoginInstanceClass.get().setWebLoginContext(webLoginContext);
      }, [webLoginContext]);

      // console.log('layout wallet init', wallet, isConnected, walletType);
      useEffect(() => {
        if(isConnected && wallet){
          const newWallet = {
            name: wallet?.name || wallet.extraInfo?.nickName || '',
            address: wallet.address ?? '',
            publicKey: wallet.extraInfo?.publicKey ?? '',
            discoverInfo: wallet.address,
            portkeyInfo: wallet.extraInfo?.portkeyInfo,
            nightElfInfo: wallet.extraInfo?.nightElfInfo,
            fairyVaultInfo: {
              fairyVault: walletType === WalletTypeEnum.fairyVault,
            },
          }
          dispatch({
            type: LOG_IN_ACTIONS.LOG_IN_SUCCESS,
            payload: newWallet,
          });
        }
        if (!wallet) {
          dispatch({
            type: LOG_OUT_ACTIONS.LOG_OUT_SUCCESS,
            payload: {},
          });
        }
      },[isConnected, wallet])
      const pathName = usePathname()
      const isProposalApply = pathName.includes('/network-dao/apply')
      return (
        <div>
            <div className="flex w-[100vw] h-[100vh] flex-col relative box-border min-h-screen bg-black">
              <Suspense>
                <NetworkDaoHeader />
              </Suspense>
              <div className="flex flex-1 flex-col overflow-y-auto">
                <Suspense>
                  <div>
                    <div
                      className={
                        clsx('flex-1 xl:w-[1122px] lg:w-[904px] md:w-[688px] xl:mt-[51px] lg:mt-[30px] md:mt-[20px] mt-[16px]  xl:m-auto lg:m-auto md:m-auto mx-[20px] mb-6 page-content-wrap network-dao', {
                          'max-w-[898px]': isProposalApply
                        })
                      }
                      >
                      {props.children}
                    </div>
                    </div>
                </Suspense>
                <Suspense>
                  <Footer />
                </Suspense>
              </div>
              <PageLoading />
              <ResultModal />
            </div>
          </div>
      );
    };
  },
  { ssr: false },
);
export default Layout;
