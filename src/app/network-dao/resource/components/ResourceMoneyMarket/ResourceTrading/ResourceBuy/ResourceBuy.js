/**
 * @file ResourceSell.js
 * @author zhouminghui
 * trading - sell
 */

import React, { Component } from "react";
import debounce from "lodash.debounce";
import { connect } from "react-redux";
import {
  Input,
  Slider,
  Spin,
  Tooltip,
  Form,
} from "antd";
import { thousandsCommaWithDecimal } from "@utils/formater";
import {
  SYMBOL,
  GENERAL_PRECISION,
  RESOURCE_OPERATE_LIMIT,
  BALANCE_LESS_THAN_OPERATE_LIMIT_TIP,
  OPERATE_NUM_TOO_SMALL_TO_CALCULATE_REAL_PRICE_TIP,
  BUY_OR_SELL_MORE_THAN_ASSETS_TIP,
  BUY_OR_SELL_MORE_THAN_THE_INVENTORY_TIP,
  TRANSACT_LARGE_THAN_ZERO_TIP,
  ONLY_POSITIVE_FLOAT_OR_INTEGER_TIP,
  CHECK_BALANCE_TIP,
  BETWEEN_ZEOR_AND_BALANCE_TIP,
  FEE_RATE,
} from "@src/constants";
import { getMagneticValue } from "@utils/styleUtils";
import { regPos } from "@utils/regExps";
import ButtonWithLoginCheck from '@components/ButtonWithLoginCheck';
import getEstimatedValueRes from "@utils/getEstimatedValueRes";
import getEstimatedValueELF from "@utils/getEstimatedValueELF";
import getFees from "@utils/getFees";
import "./ResourceBuy.css";
import { isActivityBrowser } from "@utils/isWebView";
import { toast } from 'react-toastify';

const A_PARAM_TO_AVOID_THE_MAX_BUY_AMOUNT_LARGE_THAN_ELF_BALANCE = 0.01;
const status = { ERROR: "error" };

function getMax(inputMax) {
  const rawBuyNumMax = +(
    inputMax - A_PARAM_TO_AVOID_THE_MAX_BUY_AMOUNT_LARGE_THAN_ELF_BALANCE
  ).toFixed(GENERAL_PRECISION);
  // const processedBuyNumMax = rawBuyNumMax > 0 ? rawBuyNumMax : null;
  const processedBuyNumMax =
    rawBuyNumMax > 0 ? Number.parseInt(rawBuyNumMax, 10) : null;

  return {
    rawBuyNumMax,
    processedBuyNumMax,
  };
}

const mapStateToProps = (state) => ({
  common: {
    ...state.common
  }
});

class ResourceBuy extends Component {

  constructor(props) {
    super(props);
    this.state = {
      appName: this.props.appName,
      contracts: null,
      region: 0,
      getSlideMarks: null,
      noCanInput: true,
      toBuy: true,
      inputMax: 0,
      operateNumToSmall: false,
      validate: {
        validateStatus: null,
        help: "",
      },
      inputValue: 0,
      buyBtnLoading: false,
    };

    this.onChangeSlideZeroCheck = false;
    this.getEstimatedElf = debounce(this.getEstimatedElf, 500);
    this.getEstimatedInput = debounce(this.getEstimatedInput, 500);
    this.onChangeResourceValue = this.onChangeResourceValue.bind(this);
    this.getBuyModalShow = this.getBuyModalShow.bind(this);
    this.checkAndShowBuyModal = this.checkAndShowBuyModal.bind(this);
    this.onChangeSlide = this.onChangeSlide.bind(this);
  }

  static getDerivedStateFromProps(props, state) {
    if (props.currentWallet !== state.currentWallet) {
      return {
        currentWallet: props.currentWallet,
      };
    }

    if (props.contracts !== state.contracts) {
      return {
        contracts: props.contracts,
      };
    }

    if (props.tokenConverterContract !== state.tokenConverterContract) {
      return {
        tokenConverterContract: props.tokenConverterContract,
      };
    }

    if (props.tokenContract !== state.tokenContract) {
      return {
        tokenContract: props.tokenContract,
      };
    }

    return null;
  }

  componentDidUpdate(prevProps) {
    const { handleModifyTradingState, account } = this.props;

    if (prevProps.currentResourceType !== this.props.currentResourceType) {
      handleModifyTradingState({ buyNum: null, buyElfValue: 0 });
    }

    if (prevProps.account !== this.props.account) {
      this.getRegion();
    }

    if (prevProps.account.balance !== account.balance) {
      this.getInputMaxValue();
    }

    if (
      prevProps.tokenConverterContract !== this.props.tokenConverterContract
    ) {
      this.setState({
        noCanInput: false,
      });
    }
  }

  getRegion() {
    const { account } = this.props;
    this.setState({
      region: account.balance / 4,
    });
  }

  getSlideMarks() {
    const { account } = this.props;
    const { region } = this.state;
    if (region < RESOURCE_OPERATE_LIMIT) return { 0: "" };

    this.regionLine = [
      0,
      region,
      region * 2,
      region * 3,
      account.balance.toFixed(GENERAL_PRECISION),
    ];
    const marks = {};
    this.regionLine.forEach((item) => {
      marks[item] = "";
    });
    return marks;
  }

  // todo: to be more friendly, verify the input after click buy/sell?
  onChangeResourceValue(input) {
    const { handleModifyTradingState, buyNum } = this.props;
    const { inputMax } = this.state;
    const { rawBuyNumMax } = getMax(inputMax);

    this.setState({
      validate: {
        validateStatus: null,
        help: "",
      },
    });

    input =
      input.target && (input.target.value || +input.target.value === 0)
        ? input.target.value
        : input;
    input = +input;
    input = input > rawBuyNumMax ? rawBuyNumMax : input;
    // todo: give a friendly notify when verify the max and min
    // todo: used to handle the case such as 0.5, when you input 0.5 then blur it will verify again, it should be insteaded by reducing th useless verify later
    // todo: why is the input like -- still setState successfully?
    // the symbol '+' used to handle the case of 0.===0 && 1.===1
    if (+buyNum === input) {
      handleModifyTradingState({
        buyNum: input,
      });
      return;
    }
    if (!regPos.test(input) || input === 0) {
      handleModifyTradingState({
        buyElfValue: 0,
        buyNum: null,
        buyEstimateValueLoading: false,
      });
      if (input !== "" && input !== 0) {
        toast.error("Only support positive float or integer.");
      }
      return;
    }
    // todo: use async instead
    // todo: Is it neccessary to make the loading code write in the same place? And if the answer is yes, how to make it?
    handleModifyTradingState(
      {
        buyEstimateValueLoading: true,
        buyNum: input,
      },
      () => {
        this.getEstimatedElf(input);
      }
    );
  }

  getEstimatedElf(value) {
    const { handleModifyTradingState, account, currentResourceType } =
      this.props;
    const { tokenConverterContract, tokenContract } = this.state;
    value = +value;
    getEstimatedValueELF(
      currentResourceType,
      value,
      tokenConverterContract,
      tokenContract
    )
      .then((result) => {
        const regNeg =
          /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/; //
        if (regPos.test(result) || regNeg.test(result)) {
          // todo: the code of rounding off maybe wrong so I comment it.
          const amountToPay = result;
          const buyFee = getFees(amountToPay);

          // todo: figure out the case need to add the fees.
          const amountToPayPlusFee = amountToPay + buyFee;
          // ---- Start: Handle the case input's cost larger than the elf's balance ----
          // buySliderValue = buyElfValue >= balance ? balance : buyElfValue;
          // ---- End: Handle the case input's cost larger than the elf's balance ----

          if (amountToPayPlusFee > account.balance) {
            this.setState({
              validate: {
                validateStatus: status.ERROR,
                help: BETWEEN_ZEOR_AND_BALANCE_TIP,
              },
            });
          }
          if (amountToPayPlusFee > 0) {
            this.setState({
              toBuy: true,
              operateNumToSmall: false,
              inputValue: amountToPayPlusFee,
            });
            handleModifyTradingState({
              buyElfValue: amountToPayPlusFee,
              buyFee,
              buyEstimateValueLoading: false,
            });
          } else {
            toast.warning(OPERATE_NUM_TOO_SMALL_TO_CALCULATE_REAL_PRICE_TIP);
            this.setState({
              operateNumToSmall: true,
            });
            handleModifyTradingState({
              // buyNum: null,
              buyElfValue: 0,
              buyFee: 0,
              buyEstimateValueLoading: false,
            });
          }
        } else {
          this.setState({
            toBuy: false,
          });

          handleModifyTradingState({
            buyEstimateValueLoading: false,
          });
        }
      })
      .catch((e) => {
        console.log("Error happened: ", e);
        toast.error(e.message || e.msg || "Error happened");
      });
  }

  onChangeSlide(e) {
    const { handleModifyTradingState } = this.props;

    e = getMagneticValue(e, this.regionLine);
    this.setState({
      inputValue: e,
    });
    if (e === 0) {
      // todo: seems useless
      handleModifyTradingState({
        buyNum: null,
        buyElfValue: 0,
        buyInputLoading: false,
      });
      this.onChangeSlideZeroCheck = true;
      return;
    }
    this.onChangeSlideZeroCheck = false;
    handleModifyTradingState(
      {
        buyInputLoading: true,
      },
      () => this.getEstimatedInput(e)
    );
  }

  getEstimatedInput(e) {
    const { handleModifyTradingState } = this.props;

    const buyFee = getFees(e);
    handleModifyTradingState({
      buyInputLoading: true,
      buyElfValue: e,
      buyFee,
    });
    this.prepareParamsForEstimatedResource(e / (1 + FEE_RATE))
      .then((result) => {
        handleModifyTradingState({
          buyInputLoading: false,
        });
        if (this.onChangeSlideZeroCheck) {
          handleModifyTradingState({
            buyFee: 0,
          });
          return;
        }

        let value = 0;
        if (Math.ceil(result) > 0) {
          value = Math.abs(result).toFixed(GENERAL_PRECISION);
          handleModifyTradingState({ buyNum: value });
        }
      })
      .catch(() => {
        handleModifyTradingState({
          buyInputLoading: false,
        });
      });
  }

  prepareParamsForEstimatedResource(elfAmount) {
    const { currentResourceType } = this.props;
    const { tokenConverterContract, tokenContract } = this.state;

    if (!tokenConverterContract || !tokenContract) return Promise.resolve(0);
    return getEstimatedValueRes(
      currentResourceType,
      elfAmount,
      tokenConverterContract,
      tokenContract,
      true
    );
  }

  checkAndShowBuyModal() {
    this.getBuyModalShow();
    // walletInstance.isExist.then(
    //   async () => {
    //     const instance = walletInstance.proxy.elfInstance;
    //     if (typeof instance.getExtensionInfo === "function") {
    //       const info = await walletInstance.getExtensionInfo();
    //       this.setState({
    //         isPluginLock: info.locked,
    //       });
    //     }
    //     try {
    //       await this.props.loginAndInsertKeypairs(false);
    //       this.getBuyModalShow();
    //     } catch (error) {
    //       localStorage.removeItem("currentWallet");
    //       const msg =
    //         error === 200010
    //           ? "Please Login."
    //           : error?.message ||
    //             "Please check your NightELF browser extension.";
    //       message.warn(msg);
    //     }
    //   },
    //   () => {
    //     message.warn("Please download and install NightELF browser extension.");
    //   }
    // );
  }

  getBuyModalShow() {
    const { buyElfValue, buyNum, account } = this.props;
    const { currentWallet, contracts, toBuy, operateNumToSmall } = this.state;

    this.setState({
      buyBtnLoading: true,
    });

    if (!regPos.test(buyNum) || buyNum === 0) {
      toast.error(
        `${ONLY_POSITIVE_FLOAT_OR_INTEGER_TIP}${CHECK_BALANCE_TIP}`
      );
      this.setState({
        buyBtnLoading: false,
      });
      return;
    }
    if (+buyNum === 0) {
      toast.warning(TRANSACT_LARGE_THAN_ZERO_TIP);
      this.setState({
        buyBtnLoading: false,
      });
      return;
    }
    if (operateNumToSmall) {
      toast.warning(OPERATE_NUM_TOO_SMALL_TO_CALCULATE_REAL_PRICE_TIP);
      this.setState({
        buyBtnLoading: false,
      });
      return;
    }
    if (buyElfValue > account.balance) {
      toast.warning(BUY_OR_SELL_MORE_THAN_ASSETS_TIP);
      this.setState({
        buyBtnLoading: false,
      });
      return;
    }
    if (!toBuy) {
      toast.warning(BUY_OR_SELL_MORE_THAN_THE_INVENTORY_TIP);
      this.setState({
        buyBtnLoading: false,
      });
      return;
    }

    const { handleModifyTradingState } = this.props;
    handleModifyTradingState(
      {
        buyVisible: true,
      },
      () => {
        this.setState({
          buyBtnLoading: false,
        });
      }
    );

    // const wallet = {
    //   address: currentWallet.address,
    // };

    // WebLoginInstance.get().callContract({
    //   contractAddress: contracts.multiToken,
    //   methodName: "Approve",
    // })

    // const instance = walletInstance.proxy.elfInstance;
    // instance.chain.contractAt(contracts.multiToken, wallet).then((contract) => {
    //   if (contract) {
    //     this.getApprove(contract);
    //   }
    // });
  }

  getApprove(result) {
    const { handleModifyTradingState } = this.props;
    const contract = result || null;
    // todo: handle the error case's loading
    if (contract) {
      if (result) {
        handleModifyTradingState(
          {
            buyVisible: true,
          },
          () => {
            this.setState({
              buyBtnLoading: false,
            });
          }
        );
      }
    }
  }

  getSlideMarksHTML() {
    const {
      buyInputLoading,
      buyEstimateValueLoading,
      account,
      buyNum,
      buyElfValue,
    } = this.props;
    const { buyBtnLoading, region, inputValue } = this.state;
    let disabled = false;
    const balance = account.balance.toFixed(GENERAL_PRECISION);
    // balance less than RESOURCE_OPERATE_LIMIT is temp not allowed to use slider
    if (balance < RESOURCE_OPERATE_LIMIT) {
      disabled = true;
    }
    if (region < RESOURCE_OPERATE_LIMIT) {
      disabled = true;
    }
    return (
      <Tooltip title={<span className="font-Montserrat">{BALANCE_LESS_THAN_OPERATE_LIMIT_TIP}</span>}>
        <Slider
          marks={this.getSlideMarks()}
          dots={false}
          step={0.01}
          disabled={
            disabled ||
            buyBtnLoading ||
            buyEstimateValueLoading ||
            buyInputLoading
          }
          min={0}
          value={buyNum || buyElfValue ? inputValue : 0}
          // value={inputValue}
          onChange={this.onChangeSlide}
          // todo: the max is set in this way for avoid the elf paid larger than elf's balance
          max={
            +(
              +balance -
              A_PARAM_TO_AVOID_THE_MAX_BUY_AMOUNT_LARGE_THAN_ELF_BALANCE
            ).toFixed(GENERAL_PRECISION)
          }
          tipFormatter={
            disabled ? () => <span className="font-Montserrat">{BALANCE_LESS_THAN_OPERATE_LIMIT_TIP}</span> : null
          }
        />
      </Tooltip>
    );
  }

  getInputMaxValue() {
    const { account } = this.props;

    // Add the ELF_TO_RESOURCE_PARAM to avoid the case elf is insufficient to pay
    // todo: the input max may be has problem in some case
    this.prepareParamsForEstimatedResource(account.balance / (1 + FEE_RATE))
      .then((res) => {
        const inputMax = +res;
        this.setState({
          inputMax,
        });
      })
      .catch((err) => {
        console.error("err", err);
      });
  }

  render() {
    const {
      buyNum,
      buyElfValue,
      buyInputLoading,
      buyEstimateValueLoading,
      account,
      currentResourceType,
    } = this.props;
    const { inputMax, buyBtnLoading, validate, inputValue } = this.state;
    const sliderHTML = this.getSlideMarksHTML();
    const { rawBuyNumMax, processedBuyNumMax } = getMax(inputMax);
    return (
      <div className="trading-box trading-buy">
        <div className="trading">
          <div className="trading-input">
            <div className="resource-action-block">
              <span className="w-[120px] font-Montserrat text-white text-[14px] font-medium">Buying quantity:</span>
              <Spin
                spinning={buyInputLoading}
                wrapperClassName="resource-action-input"
              >
                <Form.Item
                  validateStatus={validate.validateStatus}
                  help={validate.help}
                >
                  {/* {!isPhoneCheck() ? (
                    <InputNumber
                      value={buyNum}
                      onChange={this.onChangeResourceValue}
                      placeholder={`Enter ${currentResourceType} amount`}
                      // todo: use parser to set the max decimal to 8, e.g. using parseFloat
                      // parser={value => value.replace(/[^.\d]+/g, '')}
                      parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      disabled={rawBuyNumMax <= 0}
                      min={0}
                      max={processedBuyNumMax}
                    />
                  ) : (
                    <input
                      className="mobile-trading-input"
                      placeholder={`Enter ${currentResourceType} amount`}
                      type="number"
                      value={buyNum || ""}
                      onChange={this.onChangeResourceValue}
                      disabled={rawBuyNumMax <= 0}
                      min={0}
                      max={processedBuyNumMax}
                    />
                  )} */}
                    <Input
                      className="placeholder:text-lightGrey !text-white disabled:!bg-fillBg8"
                      value={buyNum}
                      onChange={this.onChangeResourceValue}
                      placeholder={`Enter ${currentResourceType} amount`}
                      // todo: use parser to set the max decimal to 8, e.g. using parseFloat
                      // parser={value => value.replace(/[^.\d]+/g, '')}
                      parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      disabled={rawBuyNumMax <= 0}
                      min={0}
                      max={processedBuyNumMax}
                    />
                </Form.Item>
              </Spin>
            </div>
            <div className="ELF-value">
              <Spin spinning={buyEstimateValueLoading}>
                ≈{" "}
                {inputValue && buyNum
                  ? thousandsCommaWithDecimal(buyElfValue)
                  : "0.00"}{" "}
                {SYMBOL}
              </Spin>
            </div>
            <div className="resource-action-block">
              <span className="w-[120px] font-Montserrat text-white text-[14px] font-medium">Available:</span>
              {/* {isPhoneCheck() ? (
                <div className="resource-action-input">
                  {account.balance
                    ? thousandsCommaWithDecimal(account.balance)
                    : "-"}{" "}
                  {SYMBOL}
                </div>
              ) : (
                <Input
                  className="resource-action-input"
                  value={thousandsCommaWithDecimal(account.balance)}
                  placeholder={thousandsCommaWithDecimal(account.balance)}
                  addonAfter={SYMBOL}
                  disabled
                />
              )} */}
               <Input
                className="resource-action-input"
                value={thousandsCommaWithDecimal(account.balance)}
                placeholder={thousandsCommaWithDecimal(account.balance)}
                addonAfter={SYMBOL}
                disabled
              />
            </div>
          </div>
          <div className="trading-slide">
            {sliderHTML}
            <div className="ElF-value">
              {buyElfValue && inputValue && buyNum
                ? thousandsCommaWithDecimal(inputValue)
                : "0.00"}{" "}
              {SYMBOL}
            </div>
          </div>
          <ButtonWithLoginCheck
            className="w-full my-[14px] h-[40px] border-none rounded-[42px] !bg-mainColor text-white font-Montserrat text-[15px] font-medium border hover:border-solid hover:!border-mainColor hover:!text-mainColor hover:!bg-transparent"
            onClick={this.checkAndShowBuyModal}
            checkAccountInfoSync
            loading={
              buyEstimateValueLoading || buyBtnLoading || buyInputLoading
            }
            disabled={validate.validateStatus === status.ERROR || isActivityBrowser()}
          >
            Buy
          </ButtonWithLoginCheck>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(ResourceBuy);
