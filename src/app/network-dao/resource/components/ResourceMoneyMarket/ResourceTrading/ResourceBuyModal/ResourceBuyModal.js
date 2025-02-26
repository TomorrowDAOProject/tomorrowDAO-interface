/**
 * @file ResourceBuyModal
 * @author zhouminghui
 */

import React, { PureComponent } from "react";
import { Row, Col, Spin, message, Button } from "antd";
import {
  SYMBOL,
  ELF_DECIMAL,
  BUY_MORE_THAN_HALT_OF_INVENTORY_TIP,
  FAILED_MESSAGE_DISPLAY_TIME,
} from "@src/constants";
import getChainIdQuery from 'utils/url';
import { thousandsCommaWithDecimal } from "@utils/formater";
import { regBuyTooManyResource } from "@utils/regExps";
import getStateJudgment from "@utils/getStateJudgment";
import { aelf } from "@utils";
import "./ResourceBuyModal.css";
import { WebLoginInstance } from "@utils/webLogin";

export default class ResourceBuyModal extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      tokenConverterContract: this.props.tokenConverterContract,
      tokenContract: this.props.tokenContract,
      loading: false,
      nightElf: this.props.nightElf,
      contracts: this.props.contracts,
    };
  }

  async getBuyRes() {
    const { currentWallet } = this.props;
    const { contracts } = this.state;
    this.props.maskClosable();
    const wallet = {
      address: currentWallet.address,
    };
    this.setState({
      loading: true,
    });

    const { buyNum, handleModifyTradingState, currentResourceType } =
      this.props;
    const payload = {
      symbol: currentResourceType,
      amount: buyNum * ELF_DECIMAL,
    };

    try {
      const chainIdQuery = getChainIdQuery();
      const result = await WebLoginInstance.get().callContract({
        contractAddress: contracts.tokenConverter,
        methodName: "Buy",
        args: payload,
        chainId: chainIdQuery.chainId,
        // options: {
        //   chainId: chainIdQuery.chainId
        // }
      });

      console.log("Buy", result);
      if (result.error && result.error !== 0) {
        message.error(result.errorMessage.message, 3);
        this.props.handleCancel();
        return;
      }
      this.setState({
        loading: true,
      });
      console.log(result);
      let transactionId = result.result
        ? result.result.TransactionId
        : result.TransactionId;

      if (!transactionId) {
        transactionId = result.transactionId;
      }

      setTimeout(() => {
        aelf.chain
          .getTxResult(transactionId)
          .then((txRes) => {
            // todo:
            getStateJudgment(txRes.Status, transactionId);
            this.props.onRefresh();
            this.setState({
              loading: false,
            });
            handleModifyTradingState({
              buyNum: null,
              buyFee: 0,
              buyElfValue: 0,
              buySliderValue: 0,
            });
            this.props.handleCancel();
            this.props.unMaskClosable();
          })
          .catch((err) => {
            this.setState(
              {
                loading: false,
              },
              () => {
                if (regBuyTooManyResource.test(err.Error)) {
                  message.error(
                    BUY_MORE_THAN_HALT_OF_INVENTORY_TIP,
                    FAILED_MESSAGE_DISPLAY_TIME
                  );
                  message.error(
                    `Transaction id: ${transactionId}`,
                    FAILED_MESSAGE_DISPLAY_TIME
                  );
                  return;
                }
                message.error(
                  "Your transaction seems to has some problem, please query the transaction later:",
                  FAILED_MESSAGE_DISPLAY_TIME
                );
                message.error(
                  `Transaction id: ${transactionId}`,
                  FAILED_MESSAGE_DISPLAY_TIME
                );
              }
            );
          });
      }, 4000);
    } catch (error) {
      message.error(error.message, 3);
      this.setState({
        loading: false,
      });
    }

    // const instance = walletInstance.proxy.elfInstance;
    // instance.chain
    //   .contractAt(contracts.tokenConverter, wallet)
    //   .then((result) => {
    //     // console.log('contracts.tokenConverter: ', result);
    //     if (result) {
    //       this.requestBuy(result);
    //     }
    //   });
  }

  // requestBuy(bugRes) {
  //   const { buyNum, handleModifyTradingState, currentResourceType } =
  //     this.props;
  //   const payload = {
  //     symbol: currentResourceType,
  //     amount: buyNum * ELF_DECIMAL,
  //   };
  //   bugRes
  //     .Buy(payload)
  //     .then((result) => {
  //       if (result.error && result.error !== 0) {
  //         message.error(result.errorMessage.message, 3);
  //         this.props.handleCancel();
  //         return;
  //       }
  //       this.setState({
  //         loading: true,
  //       });
  //       const transactionId = result.result
  //         ? result.result.TransactionId
  //         : result.TransactionId;
  //       setTimeout(() => {
  //         aelf.chain
  //           .getTxResult(transactionId)
  //           .then((txRes) => {
  //             getStateJudgment(txRes.Status, transactionId);
  //             this.props.onRefresh();
  //             this.setState({
  //               loading: false,
  //             });
  //             handleModifyTradingState({
  //               buyNum: null,
  //               buyFee: 0,
  //               buyElfValue: 0,
  //               buySliderValue: 0,
  //             });
  //             this.props.handleCancel();
  //             this.props.unMaskClosable();
  //           })
  //           .catch((err) => {
  //             this.setState(
  //               {
  //                 loading: false,
  //               },
  //               () => {
  //                 if (regBuyTooManyResource.test(err.Error)) {
  //                   message.error(
  //                     BUY_MORE_THAN_HALT_OF_INVENTORY_TIP,
  //                     FAILED_MESSAGE_DISPLAY_TIME
  //                   );
  //                   message.error(
  //                     `Transaction id: ${transactionId}`,
  //                     FAILED_MESSAGE_DISPLAY_TIME
  //                   );
  //                   return;
  //                 }
  //                 message.error(
  //                   "Your transaction seems to has some problem, please query the transaction later:",
  //                   FAILED_MESSAGE_DISPLAY_TIME
  //                 );
  //                 message.error(
  //                   `Transaction id: ${transactionId}`,
  //                   FAILED_MESSAGE_DISPLAY_TIME
  //                 );
  //               }
  //             );
  //           });
  //       }, 4000);
  //     })
  //     .catch((error) => {
  //       this.setState({
  //         loading: false,
  //       });
  //       console.error("result.Buy error", error);
  //     });
  // }

  render() {
    const {
      buyElfValue,
      buyNum,
      buyFee,
      buyInputLoading,
      buyEstimateValueLoading,
      currentResourceType,
      currentWallet,
    } = this.props;
    const { loading } = this.state;

    const CHAIN_ID = 'AELF'
    return (
      <div className="modal resource-modal text-white font-Montserrat">
        <Row className="modal-form-item mt-[30px] pt-[24px] border-0 border-t border-solid border-fillBg8">
          <Col span={6} className="font-Montserrat text-lightGrey text-[13px] font-medium">Address</Col>
          <Col
            className="text-ellipse font-Montserrat text-[13px]"
            span={18}
            title={`ELF_${currentWallet.address}_${CHAIN_ID}`}
          >
            {`ELF_${currentWallet.address}_${CHAIN_ID}`}
          </Col>
        </Row>
        <Row className="modal-form-item pt-[24px]">
          <Col span={6} className="font-Montserrat text-lightGrey text-[13px] font-medium">Buy {currentResourceType} Quantity</Col>
          <Col span={18} className="font-Montserrat text-[13px]">
            <Spin spinning={buyInputLoading}>
              <span className="!text-white text-[13px]">{thousandsCommaWithDecimal(buyNum)}</span>
            </Spin>
          </Col>
        </Row>
        <Row className="modal-form-item pt-[24px]">
          <Col span={6} className="font-Montserrat text-lightGrey text-[13px] font-medium">{SYMBOL}</Col>
          <Col span={18} className="font-Montserrat">
            <Spin spinning={buyEstimateValueLoading} className="font-Montserrat">
              <span className="!text-white text-[13px]">{thousandsCommaWithDecimal(buyElfValue)}</span>
            </Spin>
          </Col>
        </Row>
        <div className="service-charge font-Montserrat !text-white mt-[7px] text-[12px]">
          *Service Charge: {thousandsCommaWithDecimal(buyFee)} {SYMBOL}
        </div>

        <div className="font-Montserrat text-[11px] text-white bg-[#404040] border border-solid border-fillBg8 px-3 py-2 rounded-[5px] mt-[24px]">
          * To avoid price fluctuations leading to transaction failure, please
          complete the transaction within 30 seconds.
        </div>
        <Button
          className="w-full mt-[50px] my-[14px] h-[40px] border-none rounded-[42px] !bg-mainColor text-white font-Montserrat text-[15px] font-medium border hover:border-solid hover:!border-mainColor hover:!text-mainColor hover:!bg-transparent"
          onClick={this.getBuyRes.bind(this)}
          loading={loading}
        >
          Buy
        </Button>
      </div>
    );
  }
}
