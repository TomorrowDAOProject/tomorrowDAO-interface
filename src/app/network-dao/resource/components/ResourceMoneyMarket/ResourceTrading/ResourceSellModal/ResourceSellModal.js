/**
 * @file ResourceBuyModal
 * @author zhouminghui
 */

import React, { PureComponent } from "react";
import { Row, Col, Spin, message, Button } from "antd";
import { thousandsCommaWithDecimal } from "@utils/formater";
import { SYMBOL, ELF_DECIMAL } from "@src/constants";
import getChainIdQuery from 'utils/url';
import getStateJudgment from "@utils/getStateJudgment";
import { aelf } from "../../../../../_src/utils";
import walletInstance from "@redux/common/wallet";
import { WebLoginInstance } from "@utils/webLogin";

export default class ResourceSellModal extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      sellNum: this.props.sellNum,
      tokenConverterContract: this.props.tokenConverterContract,
      tokenContract: this.props.tokenContract,
      loading: false,
      ELFValue: null,
      contracts: this.props.contracts,
    };

    this.getSellRes = this.getSellRes.bind(this);
  }

  async getSellRes() {
    const { account, sellFee } = this.props;
    const { contracts } = this.state;

    this.props.maskClosable();
    // todo: maybe we can move the judge to component ResourceSell
    // todo: handle the edge case that account.balance is just equal to the sellFee or nearly equal
    if (account.balance <= sellFee) {
      message.warning(
        `Your ${SYMBOL} balance is insufficient to pay the service charge.`
      );
      return;
    }
    this.setState({
      loading: true,
    });

    const { currentResourceType, handleModifyTradingState } = this.props;
    const { sellNum } = this.state;
    const payload = {
      symbol: currentResourceType,
      amount: +(sellNum * ELF_DECIMAL),
    };


    try {
      const chainIdQuery = getChainIdQuery();
      const result = await WebLoginInstance.get().callContract({
        contractAddress: contracts.tokenConverter,
        methodName: "Sell",
        args: payload,
        chainId: chainIdQuery.chainId,
        // options: {
        //   chainId: chainIdQuery.chainId
        // }
      })
      if (result.error) {
        this.setState({
          loading: false,
        });
        message.error(result.errorMessage.message, 3);
        this.props.handleCancel();
        return;
      }

      this.setState({
        loading: true,
      });
      let transactionId = result.result
        ? result.result.TransactionId
        : result.TransactionId;

      if (!transactionId) {
        transactionId = result.transactionId;
      }

      setTimeout(() => {
        aelf.chain.getTxResult(transactionId, (error, txRes) => {
          if (!txRes) {
            return;
          }
          getStateJudgment(txRes.Status, transactionId);
          this.props.onRefresh();
          this.setState({
            loading: false,
          });
          handleModifyTradingState({
            sellNum: null,
          });
          this.props.handleCancel();
          this.props.unMaskClosable();
        });
      }, 4000);
    } catch (error) {
      this.setState({
        loading: false,
      });
      message.fail("Sell failed, please try again");
      console.error("result.Sell error", error);
    }
  }

  // requestSell(tokenConverterRes) {

  // }

  render() {
    const {
      sellFee,
      SellELFValue,
      sellEstimateValueLoading,
      sellNum,
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
            span={18}
            className="text-ellipse font-Montserrat text-[13px]"
            title={`ELF_${currentWallet.address}_${CHAIN_ID}`}
          >
            {`ELF_${currentWallet.address}_${CHAIN_ID}`}
          </Col>
        </Row>
        <Row className="modal-form-item pt-[24px]">
          <Col span={6} className="font-Montserrat text-lightGrey text-[13px] font-medium">Sell {currentResourceType} Quantity</Col>
          <Col span={18} className="font-Montserrat text-[13px] text-white">{thousandsCommaWithDecimal(sellNum)}</Col>
        </Row>
        <Row className="modal-form-item pt-[24px]">
          <Col span={6} className="font-Montserrat text-lightGrey text-[13px] font-medium">Sell {SYMBOL}</Col>
          <Col span={18}>
            <Spin spinning={sellEstimateValueLoading}>
              <span className="font-Montserrat text-[13px] text-white">{thousandsCommaWithDecimal(SellELFValue)}</span>
            </Spin>
          </Col>
        </Row>
        <div className="service-charge font-Montserrat !text-white mt-[7px] text-[12px]">
          *Service Charge: {thousandsCommaWithDecimal(sellFee)} {SYMBOL}
        </div>
        <div className="font-Montserrat text-[11px] text-white bg-[#404040] border border-solid border-fillBg8 px-3 py-2 rounded-[5px] mt-[24px]">
          * To avoid price fluctuations leading to transaction failure, please
          complete the transaction within 30 seconds.
        </div>
        <Button
          className="w-full mt-[50px] my-[14px] h-[40px] border-none rounded-[42px] !bg-[#FF485D] text-white font-Montserrat text-[15px] font-medium border hover:border-solid hover:!border-[#FF485D] hover:!text-[#FF485D] hover:!bg-transparent"
          loading={sellEstimateValueLoading || loading}
          onClick={this.getSellRes}
        >
          Sell
        </Button>
       
      </div>
    );
  }
}
