/**
 * @file Resource Trading
 * @author zhouminghui
 * Purchase and Sell of Resources
 */

import React, { PureComponent } from "react";
// import { Row, Col, Modal, Divider } from "antd";
import { connect } from "react-redux";
import Modal from 'components/Modal'

import ResourceBuy from "./ResourceBuy/ResourceBuy";
import ResourceSell from "./ResourceSell/ResourceSell";
import ResourceBuyModal from "./ResourceBuyModal/ResourceBuyModal";
import ResourceSellModal from "./ResourceSellModal/ResourceSellModal";
import { isPhoneCheck } from "@utils/deviceCheck";
import "./ResourceTrading.css";
import walletInstance from "@redux/common/wallet";

class ResourceTrading extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      currentWallet: this.props.currentWallet || null,
      contracts: this.props.contracts,
      buyVisible: false,
      sellVisible: false,
      tokenConverterContract: null,
      tokenContract: null,
      ELFValue: 0,
      SellELFValue: 0,
      maskClosable: true,
      buyNum: null,
      buyFee: 0,
      buyElfValue: 0,
      buyInputLoading: false,
      buyEstimateValueLoading: false,
      sellNum: null,
      sellFee: 0,
      sellEstimateValueLoading: false,
    };

    this.isPhone = isPhoneCheck();

    this.handleModifyTradingState = this.handleModifyTradingState.bind(this);
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

  handleSellModalShow() {
    this.setState({
      sellVisible: true,
    });
  }

  handleCancel = (e) => {
    this.setState({
      buyVisible: false,
      sellVisible: false,
    });
  };

  modalMaskClosable() {
    this.setState({
      maskClosable: false,
    });
  }

  modalUnMaskClosable() {
    this.setState({
      maskClosable: true,
    });
  }

  handleModifyTradingState(obj, callback) {
    this.setState(obj, callback);
  }

  render() {
    const {
      account,
      currentResourceType,
      currentResourceIndex,
      loginAndInsertKeypairs,
    } = this.props;
    const {
      sellVisible,
      buyVisible,
      currentWallet,
      contracts,
      tokenContract,
      tokenConverterContract,
      SellELFValue,
      buyElfValue,
      buyNum,
      buyFee,
      buyInputLoading,
      buyEstimateValueLoading,
      sellNum,
      sellFee,
      sellEstimateValueLoading,
    } = this.state;

    return (
      <div className="resource-trading">
        {!walletInstance ? (
          <div className="mobile-mask">
            <p className="mobile-mask-text">Can not find wallet extension</p>
          </div>
        ) : null}
        <div className="resource-trading-body">
          <div className="flex gap-[30px] flex-col lg:flex-row xl:flex-row md:flex-row">
            <div className="w-full">
              {/* {isPhoneCheck() && <div className="trading-title-buy">Buy</div>} */}
              <ResourceBuy
                loginAndInsertKeypairs={loginAndInsertKeypairs}
                currentResourceType={currentResourceType}
                currentResourceIndex={currentResourceIndex}
                currentWallet={currentWallet}
                contracts={contracts}
                tokenConverterContract={tokenConverterContract}
                tokenContract={tokenContract}
                account={account}
                buyNum={buyNum}
                buyElfValue={buyElfValue}
                buyInputLoading={buyInputLoading}
                buyEstimateValueLoading={buyEstimateValueLoading}
                handleModifyTradingState={this.handleModifyTradingState}
              />
            </div>
            <div className="w-full">
              {/* {isPhoneCheck() && <div className="trading-title-sell">Sell</div>} */}
              <ResourceSell
                loginAndInsertKeypairs={loginAndInsertKeypairs}
                currentResourceType={currentResourceType}
                currentResourceIndex={currentResourceIndex}
                currentWallet={currentWallet}
                handleSellModalShow={this.handleSellModalShow.bind(this)}
                contracts={contracts}
                tokenConverterContract={tokenConverterContract}
                tokenContract={tokenContract}
                account={account}
                sellNum={sellNum}
                sellEstimateValueLoading={sellEstimateValueLoading}
                handleModifyTradingState={this.handleModifyTradingState}
              />
            </div>
          </div>
        </div>
        {/* <Modal
          className="modal-display-box"
          title="Resource buying"
          destroyOnClose
          closable={false}
          footer={null}
          visible={buyVisible}
          centered
          maskClosable
          onCancel={this.handleCancel}
          width={700}
        > */}
          <Modal
            title={<span className="font-Unbounded text-[20px] font-[300]">Resource buying</span>}
            // footerConfig={{
            //   buttonList: [{ children: 'Confirm', onClick: onConfirm, disabled: disabled }],
            // }}
            // rootClassName="modal-display-box"
            isVisible={buyVisible}
            onClose={this.handleCancel}
            rootClassName="xl:w-[740px] md:w-[740px] lg:w-[740px] w-full xl:px-[38px] xl:py-[30px] lg:px-[38px] lg:py-[30px] md:px-[38px] md:py-[30px] p-[22px]"
          >
          <ResourceBuyModal
            currentResourceType={currentResourceType}
            currentWallet={currentWallet}
            currentResourceIndex={currentResourceIndex}
            tokenConverterContract={tokenConverterContract}
            tokenContract={tokenContract}
            handleCancel={this.handleCancel}
            onRefresh={this.props.onRefresh}
            maskClosable={this.modalMaskClosable.bind(this)}
            unMaskClosable={this.modalUnMaskClosable.bind(this)}
            contracts={contracts}
            buyNum={buyNum}
            buyElfValue={buyElfValue}
            buyFee={buyFee}
            buyInputLoading={buyInputLoading}
            buyEstimateValueLoading={buyEstimateValueLoading}
            handleModifyTradingState={this.handleModifyTradingState}
          />
        </Modal>
        <Modal
          // className="modal-display-box"
          // title="Resource selling"
          // destroyOnClose
          // closable={false}
          // footer={null}
          // visible={sellVisible}
          // centered
          // maskClosable
          // onCancel={this.handleCancel}
          // width={700}
          title={<span className="font-Unbounded text-[20px] font-[300]">Resource selling</span>}
          isVisible={sellVisible}
          onClose={this.handleCancel}
          rootClassName="xl:w-[740px] md:w-[740px] lg:w-[740px] w-full xl:px-[38px] xl:py-[30px] lg:px-[38px] lg:py-[30px] md:px-[38px] md:py-[30px] p-[22px]"
        >
          <ResourceSellModal
            currentResourceType={currentResourceType}
            currentWallet={currentWallet}
            currentResourceIndex={currentResourceIndex}
            tokenConverterContract={tokenConverterContract}
            tokenContract={tokenContract}
            sellNum={sellNum}
            handleCancel={this.handleCancel}
            onRefresh={this.props.onRefresh}
            maskClosable={this.modalMaskClosable.bind(this)}
            unMaskClosable={this.modalUnMaskClosable.bind(this)}
            contracts={contracts}
            account={account}
            SellELFValue={SellELFValue}
            sellFee={sellFee}
            sellEstimateValueLoading={sellEstimateValueLoading}
            handleModifyTradingState={this.handleModifyTradingState}
          />
        </Modal>
      </div>
    );
  }
}

export default ResourceTrading;
