/*
 * @Author: Alfred Yang
 * @Github: https://github.com/cat-walk
 * @Date: 2019-12-07 13:16:37
 * @LastEditors: Alfred Yang
 * @LastEditTime: 2019-12-10 17:07:00
 * @Description: file content
 */
import React, { PureComponent } from "react";
import Link from 'next/link';
import moment from "moment";
import { thousandsCommaWithDecimal } from "@utils/formater";
import { ELF_DECIMAL, SYMBOL } from "@src/constants";
import { connect } from "react-redux";
import CopyButton from "@components/CopyButton/CopyButton";
import { isPhoneCheck } from "@utils/deviceCheck";
import Dividends from "@components/Dividends";
import addressFormat from "@utils/addressFormat";
import "./MyWalletCard.css";
import { WebLoginInstance } from "@utils/webLogin";
import { isActivityBrowser } from "@utils/isWebView";
import IconFont from "@components/IconFont";
import { mainExplorer } from "config";
import Spin from "components/Spin";
import Button from 'components/Button';
import { toast } from 'react-toastify';

class MyWalletCard extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      balance: "-",
      withdrawnVotedVotesAmount: "-",
      activeVotedVotesAmount: "-",
      totalAssets: "-",
      loading: false,
      lastestUnlockTime: null, // todo: rename the variable
    };
    this.isPhone = isPhoneCheck();
    this.handleUpdateWalletClick = this.handleUpdateWalletClick.bind(this);
    this.extensionLogout = this.extensionLogout.bind(this);
    this.loginOrUnlock = this.loginOrUnlock.bind(this);
    this.hasRun = false;
  }

  componentDidMount() {
    const {
      changeVoteState,
      electionContract,
      multiTokenContract,
      profitContractFromExt,
    } = this.props;
    if (
      electionContract &&
      multiTokenContract &&
      profitContractFromExt &&
      !this.hasRun
    ) {
      changeVoteState({
        shouldRefreshMyWallet: true,
      });
    }
  }

  loginOrUnlock() {
    WebLoginInstance.get().loginAsync();
  }

  // todo: maybe we can fetch the data after all contract are ready as it will reduce the difficulty of code and reduce the code by do the same thing in cdm and cdu
  componentDidUpdate(prevProps) {
    this.fetchData(prevProps);
  }

  fetchData(prevProps) {
    const {
      multiTokenContract,
      electionContract,
      shouldRefreshMyWallet,
      changeVoteState,
      currentWallet,
    } = this.props;
    const { balance } = this.state;
    if (!currentWallet?.address) {
      this.setState({
        balance: "-",
        withdrawnVotedVotesAmount: "-",
        activeVotedVotesAmount: "-",
        totalAssets: "-",
        lastestUnlockTime: null,
      });
    }
    if (shouldRefreshMyWallet) {
      changeVoteState(
        {
          shouldRefreshMyWallet: false,
        },
        () => {
          this.setState({
            loading: true,
          });
          this.updateWallet().then(() => {
            this.setState({
              loading: false,
            });
          });
        }
      );
    } else {
      if (
        multiTokenContract &&
        (currentWallet?.address !== prevProps.currentWallet?.address ||
          multiTokenContract !== prevProps?.multiTokenContract)
      ) {
        this.hasRun = true;
        this.fetchWalletBalance();
      }
      if (
        electionContract &&
        (currentWallet?.address !== prevProps.currentWallet?.address ||
          electionContract !== prevProps?.electionContract)
      ) {
        this.hasRun = true;
        this.fetchElectorVoteInfo();
      }

      // todo: maybe we need to use electionContractFromExt instead
      // After get balance and lockAmount, calculate the total assets
      if (electionContract && multiTokenContract && balance !== "-") {
        this.computedTotalAssets();
      }
    }
  }

  fetchWalletBalance() {
    const { multiTokenContract, currentWallet } = this.props;

    if (!currentWallet?.address) {
      return false;
    }
    console.log(currentWallet?.address, "fetchWalletBalance");
    return multiTokenContract.GetBalance.call({
      symbol: SYMBOL,
      owner: currentWallet.address,
    })
      .then((res) => {
        this.setState({
          balance: +res.balance / ELF_DECIMAL,
        });
      })
      .catch((err) => console.error("fetchWalletBalance", err));
  }

  async getElectorVote(currentWallet, electionContract) {
    const { publicKey, address } = currentWallet;
    if (!publicKey && !address) {
      return null;
    }
    let res;
    if (publicKey) {
      res = await electionContract.GetElectorVoteWithRecords.call({
        value: publicKey,
      });
    }
    if (!res) {
      res = await electionContract.GetElectorVoteWithRecords.call({
        value: address,
      });
    }
    return res;
  }

  fetchElectorVoteInfo() {
    const { electionContract, currentWallet } = this.props;
    if (!currentWallet?.address) {
      return false;
    }
    console.log(currentWallet?.address, "fetchElectorVoteInfo");
    return this.getElectorVote(currentWallet, electionContract)
      .then((res) => {
        if (!res) return;
        let { activeVotedVotesAmount } = res;
        const { allVotedVotesAmount, activeVotingRecords } = res;
        if (activeVotedVotesAmount) {
          this.computedLastestUnlockTime(activeVotingRecords);
        }
        activeVotedVotesAmount = +activeVotedVotesAmount;
        const withdrawnVotedVotesAmount =
          allVotedVotesAmount - activeVotedVotesAmount;
        this.setState({
          activeVotedVotesAmount: activeVotedVotesAmount / ELF_DECIMAL,
          withdrawnVotedVotesAmount: withdrawnVotedVotesAmount / ELF_DECIMAL,
        });
      })
      .catch((err) => {
        console.error("fetchElectorVoteInfo", err);
      });
  }

  computedLastestUnlockTime(activeVotingRecords) {
    const lastestUnlockTimestamp = activeVotingRecords.sort(
      (a, b) => a.unlockTimestamp.seconds - b.unlockTimestamp.seconds
    )[0];

    const lastestUnlockTime = moment
      .unix(lastestUnlockTimestamp.unlockTimestamp.seconds)
      .format("YYYY-MM-DD  HH:mm:ss");
    this.setState({
      lastestUnlockTime,
    });
  }

  computedTotalAssets() {
    const { activeVotedVotesAmount, balance } = this.state;
    const totalAssets =
      activeVotedVotesAmount === "-"
        ? balance
        : activeVotedVotesAmount + balance;
    this.setState({
      totalAssets,
    });
  }

  updateWallet() {
    return Promise.all([this.fetchWalletBalance(), this.fetchElectorVoteInfo()])
      .then(() => {
        this.computedTotalAssets();
      })
      .catch((err) => {
        console.error("updateWallet", err);
      });
  }

  handleUpdateWalletClick() {
    const { changeVoteState } = this.props;
    changeVoteState({
      shouldRefreshMyWallet: true,
    });
  }

  extensionLogout() {
    WebLoginInstance.get()
      .logoutAsync()
      .then(
        () => {
          toast.success("Logout successful, refresh after 3s.", 3, () => {
            window.location.reload();
          });
        },
        () => {
          toast.error("logout failed");
        }
      );
  }

  render() {
    const { handleDividendClick, dividends, currentWallet } = this.props;
    const {
      balance,
      withdrawnVotedVotesAmount,
      activeVotedVotesAmount,
      totalAssets,
      loading,
      lastestUnlockTime,
    } = this.state;
    const { isConnected } = WebLoginInstance.get().getWebLoginContext();
    console.log("isConnected", isConnected);
    const formattedAddress = addressFormat(currentWallet.address);
    const walletItems = [
      {
        type: "Total assets",
        value: thousandsCommaWithDecimal(totalAssets) || "-",
        class: "assets",
      },
      {
        type: "Balance",
        value: thousandsCommaWithDecimal(balance) || "-",
        class: "balance",
      },
      {
        type: "Claimable profit",
        value: (
          <Dividends
            className="wallet-dividends"
            dividends={dividends.total || "-"}
            valueClassName="inline-block mr-[6px]"
          />
        ),
        extra: (
          <Button
            type="primary"
            size="small"
            className="my-wallet-card-body-wallet-content-withdraw-btn !inline-block font-Montserrat w-[46px] h-[20px] !leading-[14px] !text-[11px] !px-[2px] !py-[2px] ml-[4px] hover:!bg-darkBg hover:!text-mainColor hover:!border hover:border-solid hover:!border-mainColor"
            disabled={isActivityBrowser()}
            onClick={handleDividendClick}
          >
            Claim
          </Button>
        ),
        class: "profit",
      },
      {
        type: "Active votes",
        value: thousandsCommaWithDecimal(activeVotedVotesAmount) || "-",
        class: "active-votes",
      },
      {
        type: "Redeemed votes",
        value: thousandsCommaWithDecimal(withdrawnVotedVotesAmount) || "-",
        class: "redeemed-votes",
      },
      {
        type: "Earliest vote expired time",
        value: thousandsCommaWithDecimal(lastestUnlockTime) || "-",
        class: "time",
      },
    ];

    return (
      <section className="my-wallet-card">
        <div className="my-wallet-content">
          <Spin spinning={loading}>
            <div className="my-wallet-card-header">
              <h2 className="my-wallet-card-header-title !text-white font-Montserrat text-[12px] font-medium">
                My Wallet
              </h2>
              <div className="flex items-center">
                <Button
                  className="font-Montserrat refresh-btn hover:!bg-darkBg hover:!text-mainColor hover:!border hover:border-solid hover:!border-mainColor"
                  disabled={!currentWallet?.address}
                  onClick={this.handleUpdateWalletClick}
                  size="small"
                >
                  <IconFont type="reload" />
                  Refresh
                </Button>
                {!isActivityBrowser() &&
                  !currentWallet?.address && (
                    <Button
                      type="primary"
                      className="login-btn leading-[20px] !py-[4px] font-Montserrat !rounded-[42px] hover:!bg-darkBg hover:!text-mainColor hover:!border hover:border-solid hover:!border-mainColor"
                      onClick={this.loginOrUnlock}
                    >
                      <i className="tmrwdao-icon-profile text-[16px] text-inherit mr-[6px]"></i>
                      Log in
                    </Button>
                  )}
              </div>
            </div>
            <div className="my-wallet-card-body-wallet-title">
              <>
                <div className="name">
                  <span className="my-wallet-card-body-wallet-title-key text-white text-[11px] font-Montserrat">
                    Name:
                  </span>
                  <span className="my-wallet-card-body-wallet-title-value text-lightGrey">
                    {currentWallet?.name || "-"}
                  </span>
                </div>
                <div className="address">
                  <span className="my-wallet-card-body-wallet-title-key text-white text-[11px] font-Montserrat">
                    Address:
                  </span>
                  <span className="my-wallet-card-body-wallet-title-value">
                    {formattedAddress ? (
                      <>
                        <Link
                          className="info text-white text-[10px] font-Montserrat"
                          href={`${mainExplorer}/address/${formattedAddress}`}
                          title={formattedAddress}
                        >
                          {formattedAddress}
                        </Link>
                        <CopyButton value={formattedAddress} />
                      </>
                    ) : (
                      "-"
                    )}
                  </span>
                </div>
              </>
            </div>
            <div className="my-wallet-card-body">
              <ul className="my-wallet-card-body-wallet-content">
                {walletItems.map((item) => (
                  <li key={item.type} className={item.class}>
                    <span className="item-type !text-white text-[11px] font-medium font-Montserrat">{item.type}:</span>
                    <span>
                      <span className="item-value !text-lightGrey text-[11px]">{item.value}</span>
                      {item.extra && (
                        <span className="item-extra text-lightGrey">{item.extra}</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Spin>
        </div>
      </section>
    );
  }
}

const mapStateToProps = (state) => {
  const { currentWallet } = state.common;
  return {
    currentWallet,
  };
};

export default connect(mapStateToProps)(MyWalletCard);
