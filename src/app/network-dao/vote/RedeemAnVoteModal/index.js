import React, { PureComponent } from "react";
import Modal from "components/Modal";
import Button from "components/Button";
import { NEED_PLUGIN_AUTHORIZE_TIP } from "@src/constants";

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 18 },
  },
};

class RedeemAnVoteModal extends PureComponent {
  generateVoteAnRedeemForm() {
    const { voteToRedeem } = this.props;

    return {
      formItems: [
        {
          label: "Node Name",
          render: (
            <span className="w-full text-ellipsis overflow-hidden">{voteToRedeem.nodeName}</span>
          ),
        },
        {
          label: "Node Add",
          render: (
            <span className="w-full text-ellipsis overflow-hidden">{voteToRedeem.nodeAddress}</span>
          ),
        },
        {
          label: "Redeem Amount",
          render: (
            <span className="w-full ext-ellipsis overflow-hidden">{voteToRedeem.amount}</span>
          ),
        },
      ],
    };
  }

  render() {
    const {
      redeemOneVoteModalVisible,
      changeVoteState,
      handleRedeemOneVoteConfirm,
    } = this.props;
    const voteAnRedeemForm = this.generateVoteAnRedeemForm();
    return (
      <Modal
        title="Redeem The Vote"
        rootClassName="!max-w-[740px] !max-h-[calc(100vh-44px)] p-[22px] md:!py-[30px] md:!px-[38px]"
        isVisible={redeemOneVoteModalVisible}
        onClose={() => {
          changeVoteState({
            redeemOneVoteModalVisible: false,
          });
        }}
        maskClosable
      >
        <div className="py-[30px] mb-5">
          <div className="flex flex-col gap-[30px] py-[30px]">
            {voteAnRedeemForm.formItems &&
              voteAnRedeemForm.formItems.map((item) => (
                <div className="flex flex-col md:flex-row gap-2">
                  <span className="text-desc12 text-lightGrey font-Montserrat w-full md:w-[174px]">{item.label}</span>
                  <span className="text-desc12 text-white font-Montserrat w-full md:w-[calc(100%-174px)] text-ellipsis overflow-hidden">{item.render}</span>
                </div>
              ))}
          </div>
          
          <p className="font-Montserrat text-desc11 text-lightGrey text-center">
            {NEED_PLUGIN_AUTHORIZE_TIP}
          </p>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Button type="primary" className="!py-[11px] !w-full" onClick={handleRedeemOneVoteConfirm}>
            OK
          </Button>
        </div>
      </Modal>
    );
  }
}

export default RedeemAnVoteModal;
