'use client';
import React, { useEffect, Suspense } from 'react';
import { Provider } from "react-redux";
import { useDispatch } from 'react-redux';
import { useSelector } from 'redux/store';
import clsx from 'clsx';
import { WebLoginInstance } from "@utils/webLogin";
import { LOG_OUT_ACTIONS, LOG_IN_ACTIONS } from 'app/network-dao/_src/redux/actions/proposalCommon';
import store from "./_src/redux/store";
import dynamicReq from 'next/dynamic';
import Footer from 'components/Footer';
import NetworkDaoHeader from 'components/NetworkDaoHeader';
import PageLoading from 'components/Loading';
import ResultModal from 'components/ResultModal';
import './layout.css';
import './_src/common/index.css';
import { usePathname } from 'next/navigation';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';

const Layout = dynamicReq(
  async () => {
    return (props: React.PropsWithChildren<{}>) => {
      const dispatch = useDispatch();
      const webLoginContext = useConnectWallet();
      const { walletInfo: wallet, isConnected } = webLoginContext;
      const currentWallet = useSelector((state) => {
        return state.common.currentWallet;
      });
      WebLoginInstance.get().setWebLoginContext(webLoginContext);
      // dispatch wallet to network-dao redux
      // useEffect(() => {
      //   if (loginState === WebLoginState.initial && currentWallet.address) {
      //     dispatch({
      //       type: LOG_OUT_ACTIONS.LOG_OUT_SUCCESS,
      //     });
      //   } else if (loginState === WebLoginState.initial && loginError) {
      //     dispatch({
      //       type: LOG_IN_ACTIONS.LOG_IN_FAILED,
      //     });
      //   } else if (loginState === WebLoginState.logining) {
      //     dispatch({
      //       type: LOG_IN_ACTIONS.LOG_IN_START,
      //     });
      //   } else if (loginState === WebLoginState.logined) {
      //     dispatch({
      //       type: LOG_IN_ACTIONS.LOG_IN_SUCCESS,
      //       payload: wallet,
      //     });
      //   }
      // }, [loginState])

      useEffect(() => {
        if(isConnected && wallet){
          dispatch({
            type: LOG_IN_ACTIONS.LOG_IN_SUCCESS,
            payload: wallet,
          });
        }
      },[isConnected, wallet])
      const pathName = usePathname()
      const isProposalApply = pathName.includes('/network-dao/apply')
      return (
        <div>
            <div className="flex w-[100vw] h-[100vh] flex-col relative box-border min-h-screen bg-global-grey">
              <Suspense>
                <NetworkDaoHeader />
              </Suspense>
              <div className="flex flex-1 flex-col overflow-y-auto">
                <Suspense>
                  <div>
                    <div
                      className={
                        clsx('flex-1 max-w-[1440px] mx-auto pt-4 lg:pt-6 mb-6 lg:px-10 px-4 page-content-wrap', {
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
