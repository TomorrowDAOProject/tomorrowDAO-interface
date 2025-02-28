import React, {
  useState,
  useEffect,
  useCallback,
  useImperativeHandle,
} from "react";
// import { Link } from "react-router-dom";
import Link from "next/link";
import { Row, Col } from "antd";
import { SYMBOL, ELF_DECIMAL } from "@src/constants";
import { thousandsCommaWithDecimal } from "@utils/formater";
import { resourceTokens } from "@config/config";
import Button from 'components/Button'
import {
  WalletOutlined,
  SyncOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import RefreshIcon from 'assets/revamp-icon/refresh.svg';

import "./ResourceAElfWallet.css";
import addressFormat from "@utils/addressFormat";
import { isPhoneCheck } from "@utils/deviceCheck";
import { isActivityBrowser } from "@utils/isWebView";
import LinkNetworkDao from "components/LinkNetworkDao";
import { useConnectWallet } from "@aelf-web-login/wallet-adapter-react";
import Spin from 'components/Spin'

const ResourceWallet = React.forwardRef(
  (
    {
      title,
      currentWallet,
      tokenContract,
      resourceTokens: tokens,
      balance,
      getCurrentBalance,
      getResource,
    },
    ref
  ) => {
    const defaultWallet = {
      name: "-",
      address: "-",
    };
    const isPhone = isPhoneCheck();

    const [loading, setLoading] = useState(true);

    const { isConnected, connectWallet } = useConnectWallet();

    const getCurrentWalletBalance = useCallback(async () => {
      const payload = {
        symbol: SYMBOL,
        owner: currentWallet.address || currentWallet,
      };
      const result = await tokenContract.GetBalance.call(payload);
      const newBalance = parseInt(result.balance || 0, 10) / ELF_DECIMAL;
      getCurrentBalance(newBalance);
    }, [currentWallet, tokenContract]);

    const getCurrentWalletResource = useCallback(async () => {
      const owner = currentWallet.address || currentWallet;
      const results = await Promise.all(
        resourceTokens.map(({ symbol }) =>
          tokenContract.GetBalance.call({
            symbol,
            owner,
          })
        )
      );
      const newResourceTokenInfos = results.map((v, i) => {
        const newBalance = parseInt(v.balance || 0, 10) / ELF_DECIMAL;
        return {
          ...resourceTokens[i],
          balance: newBalance,
        };
      });
      getResource(newResourceTokenInfos);
    }, [currentWallet, tokenContract]);

    const refreshWalletInfo = useCallback(() => {
      if (tokenContract && currentWallet && currentWallet.address) {
        setLoading(true);
        Promise.all([getCurrentWalletBalance(), getCurrentWalletResource()])
          .then(() => {
            setLoading(false);
          })
          .catch(() => {
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    }, [currentWallet, tokenContract]);

    useEffect(() => {
      refreshWalletInfo();
    }, [currentWallet, tokenContract]);

    useImperativeHandle(ref, () => ({
      refreshWalletInfo,
    }));

    // const extensionLogout = useCallback(() => {
    //   setLoading(true);
    //   walletInstance.proxy.elfInstance.chain.getChainStatus().then(
    //     (result) => {
    //       if (result) {
    //         const isPluginLock = result.error === 200005;
    //         if (isPluginLock) {
    //           message.warn(result.message || result.errorMessage.message);
    //         } else {
    //           walletInstance.logout(currentWallet.address).then(
    //             () => {
    //               message.success(
    //                 "Logout successful, refresh after 3s.",
    //                 3,
    //                 () => {
    //                   localStorage.removeItem("currentWallet");
    //                   window.location.reload();
    //                 }
    //               );
    //             },
    //             () => {
    //               setLoading(false);
    //               message.error("logout failed");
    //             }
    //           );
    //         }
    //         setLoading(false);
    //       }
    //     },
    //     (error) => {
    //       setLoading(false);
    //       // eslint-disable-next-line no-console
    //       console.error("walletInstance.chain.getChainStatus:error", error);
    //     }
    //   );
    // }, [currentWallet]);

    const hasLogin = currentWallet && currentWallet.address;
    const propsTile = title || "-";
    const wallet = hasLogin ? currentWallet : defaultWallet;

    return (
      <div className="resource-wallet resource-block">
        <Spin spinning={loading}>
          <div className="resource-wallet-header resource-header">
            <span className="!font-Unbounded !font-[300] text-[15px] text-white">{propsTile}</span>
          </div>
          <div className="resource-sub-container">
            <Row className="resource-wallet-address">
              <div className="flex gap-2 flex-wrap">
                <span className="text-white font-Montserrat text-[13px] leading-[22px]">{wallet.address=='-' ? wallet.address : addressFormat(wallet.address)}</span>
                  {wallet.address !== "-" && (
                    <div className="link-detail-button">
                      <LinkNetworkDao href={`/resource-detail/${wallet.address}`}>
                        Transaction Details
                      </LinkNetworkDao>
                    </div>
                  )}
                </div>
              <Col className="resource-wallet-operation-container">
                {/* {!(currentWallet && currentWallet.address && tokenContract) && (
                <Button
                  type="text"
                  className="resource-wallet-address-update update-btn"
                  onClick={() => loginAndInsertKeyPairs(false)}
                >
                  Login
                </Button>
              )} */}

                <Button
                  className={`border border-solid !border-white text-white bg-mainColor !text-[10px] w-[77px] h-[24px] gap-1 ${isConnected && 'border-none !bg-mainColor text-white'}`}
                  disabled={!isConnected}
                  onClick={refreshWalletInfo}
                >
                  {/* <SyncOutlined className="text-[10px]" type="sync" spin={loading} /> */}
                  <img className="w-[16px] h-[16px]" src={RefreshIcon} alt="" />
                  <span className="text-[10px] text-white">Refresh</span>
                </Button>

                {!isActivityBrowser() && !isConnected && (
                    <Button
                      type="text"
                      className="text-white bg-mainColor !text-[10px] hover:!text-mainColor hover:bg-transparent hover:border hover:border-solid hover:border-mainColor w-[70px] h-[24px] gap-1 ml-[11px]"
                      onClick={() => connectWallet()}
                    >
                      <i className="tmrwdao-icon-profile text-[16px] text-inherit" />
                      <span className="text-[10px]">Log in</span>
                    </Button>
                  )}


                {/* {!isPhone && currentWallet && currentWallet.address && (
                  <Button
                    type="text"
                    className="resource-wallet-address-update update-btn"
                    disabled={
                      !(currentWallet && currentWallet.address && tokenContract)
                    }
                    onClick={logout}
                  >
                    Logout
                    <LogoutOutlined type="logout" />
                  </Button>
                )} */}
              </Col>
            </Row>

            <div className="resource-wallet-info">
              <Row type="flex" align="middle">
                <Col span={24}>
                  <span className="resource-wallet-info-name balance">
                    Balance:
                  </span>
                  <span className="resource-wallet-info-value balance">
                    {thousandsCommaWithDecimal(hasLogin ? balance : "-")} ELF
                  </span>
                </Col>
                {tokens.map((v, index) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <Col lg={12} xs={24} sm={12} key={index}>
                    <span className="resource-wallet-info-name">
                      {v.symbol} Quantity:
                    </span>
                    <span className="resource-wallet-info-value">
                      {thousandsCommaWithDecimal(hasLogin ? v.balance : "-")}
                    </span>
                  </Col>
                ))}
              </Row>
            </div>
          </div>
        </Spin>
      </div>
    );
  }
);

export default ResourceWallet;
