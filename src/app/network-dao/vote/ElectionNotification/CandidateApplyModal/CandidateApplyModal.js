/*
 * @Author: Alfred Yang
 * @Github: https://github.com/cat-walk
 * @Date: 2019-12-07 19:00:59
 * @LastEditors: Alfred Yang
 * @LastEditTime: 2019-12-09 15:05:34
 * @Description: file content
 */
import React, { PureComponent, forwardRef } from "react";
import AElf from "aelf-sdk";
import { InfoCircleOutlined } from "@ant-design/icons";
import { Button, Divider, Form, Modal, Tooltip, Row, Col } from "antd";
import { RUN_INDIVIDUAL_NODES_TIP, SYMBOL } from "@src/constants";
import {
  ELECTION_MORTGAGE_NUM_STR,
  MINIMUN_HARDWARE_ADVICE,
  HARDWARE_ADVICE,
  MINIMUN_HARDWARE_ADVICE_TEST,
  HARDWARE_ADVICE_TEST,
} from "../../constants";
import { NETWORK_TYPE } from "@config/config";
import { connect } from "react-redux";
import "./CandidateApplyModal.style.css";
import addressFormat from "@utils/addressFormat";
import Input from 'components/Input';

const handleStrToArr = (str) => {
  const arr = str.split(",");
  return arr;
};

function generateCandidateApplyForm(currentWallet) {
  return {
    formItems: [
      {
        label: "Wallet",
        render: (
          <span className="list-item-value">
            {currentWallet?.name || currentWallet?.address}
          </span>
        ),
      },
      {
        label: "Address",
        render: (
          <span className="list-item-value">
            {addressFormat(currentWallet?.address)}
          </span>
        ),
      },
      {
        label: "Required Staking",
        render: (
          <span className="list-item-value">
            {ELECTION_MORTGAGE_NUM_STR} {SYMBOL} &nbsp;
            <Tooltip
              title={`You cannot redeem the staked ${SYMBOL} until you quit the election and your last term ends.`}
            >
              <InfoCircleOutlined className="!text-lightGrey" />
            </Tooltip>
          </span>
        ),
      },
      {
        label: "Minimum Configuration",
        render: (
          <>
            {handleStrToArr(
              NETWORK_TYPE === "MAIN"
                ? MINIMUN_HARDWARE_ADVICE
                : MINIMUN_HARDWARE_ADVICE_TEST
            ).map((ele) => {
              return <div className="list-item-value">- {ele}</div>;
            })}
          </>
        ),
      },
      {
        label: "Recommended Configuration",
        render: (
          <>
            {handleStrToArr(
              NETWORK_TYPE === "MAIN" ? HARDWARE_ADVICE : HARDWARE_ADVICE_TEST
            ).map((ele) => {
              return <div className="list-item-value">- {ele}</div>;
            })}
          </>
        ),
      },
    ],
  };
}

class CandidateApplyModal extends PureComponent {
  formRef = React.createRef();

  constructor(props) {
    super(props);
    this.handleOk = this.handleOk.bind(this);
  }

  handleOk() {
    const { onOk } = this.props;
    this.formRef.current
      .validateFields()
      .then((values) => {
        onOk(values.admin.trim());
      })
      .catch((e) => {
        console.error(e);
      });
  }

  render() {
    const { onCancel, visible, currentWallet } = this.props;
    const candidateApplyForm = generateCandidateApplyForm(currentWallet);
    const rules = [
      {
        required: true,
        type: "string",
        message: "Please input your admin address!",
      },
      () => ({
        validator(_, value) {
          try {
            AElf.utils.decodeAddressRep(value.trim());
            return Promise.resolve();
          } catch (e) {
            if (!value) return Promise.resolve();
            return Promise.reject(new Error(`${value} is not a valid address`));
          }
        },
      }),
    ];
    const TooltipInput = forwardRef((props, ref) => {
      return (
        <>
          <Input
            ref={ref}
            {...props}
            placeholder="Please enter admin address"
            className="w-[90%] inline-block bg-darkBg text-lightGrey border-borderColor placeholder:text-lightGrey hover:bg-darkBg hover:border-borderColor focus:bg-darkBg"
          />
          <Tooltip
            className="candidate-admin-tip"
            title="Admin account has the right to replace candidate node's public key, set/change the reward receiving address, and quit the node election. If you are running a node yourself, you can set your own node address as the admin. If you are operating a node on other's behalf, please decide whether you need to assign this role to some other addresses."
          >
            <InfoCircleOutlined className="!text-lightGrey ml-[6px]" />
          </Tooltip>
        </>
      );
    });
    return (
      <Modal
        className="apply-node-modal candidate-apply-modal"
        destroyOnClose
        getContainer={document.querySelector("#portkey-ui-root")}
        title={`Apply to Become a Candidate Node ${NETWORK_TYPE === "MAIN" ? "" : "on the Testnet"
          } `}
        visible={visible}
        open={visible}
        okText="Apply Now"
        // onOk={this.handleOk}
        onCancel={onCancel}
        footer={null}
        centered
        maskClosable
        keyboard
        width={725}
      >
        <Divider className="mt-[30px] mb-[25px] bg-borderColor" />
        <Form ref={this.formRef}>
          {candidateApplyForm.formItems &&
            candidateApplyForm.formItems.map((item) => {
              return (
                <Form.Item label={item.label} key={item.label}>
                  {item.render ? item.render : <Input />}
                </Form.Item>
              );
            })}
          <Form.Item
            label="Admin account:"
            className="candidate-admin"
            name="admin"
            rules={rules}
          >
            <TooltipInput />
          </Form.Item>
        </Form>
        <Divider className="mt-[30px] mb-[30px] bg-borderColor" />
        <Row gutter={{ sm: 16, md: 24 }} className="tip-color text-white bg-borderColor rounded-[10px] mb-[50px] py-[8px] px-[12px]">
          <Col span={{sm: 24, md: 6}} className="mb-[12px] md:mb-0">
            <div className="w-full h-full flex items-center justify-between">
              <InfoCircleOutlined className="!text-white mr-[12px]" />
              <strong className="text-[11px] font-medium font-Montserrat">Important Notice:</strong>
            </div>
          </Col>
          <Col span={{sm: 24, md: 18}}>
            <span className="notice-text text-[11px] font-Montserrat">
              <div>{RUN_INDIVIDUAL_NODES_TIP}</div>
              <div>
                Please read the{" "}
                <a
                  target="_blank"
                  rel="noreferrer"
                  href={
                    NETWORK_TYPE === "MAIN"
                      ? "https://docs.aelf.io/en/latest/tutorials/mainnet.html"
                      : "https://docs.aelf.io/en/latest/tutorials/testnet.html"
                  }
                >
                  dev docs
                </a>{" "}
                for instructions on node deployment.
              </div>
            </span>
          </Col>
        </Row>
        <div className="mb-[10px]">
          <Button
            className="w-full h-[40px] rounded-[42px] bg-mainColor font-Montserrat text-white border border-solid border-borderColor hover:!bg-darkBg hover:!text-mainColor hover:!border hover:border-solid hover:!border-mainColor"
            onClick={this.handleOk}
          >
            Apply Now
          </Button>
        </div>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => {
  const { currentWallet } = state.common;
  return {
    currentWallet,
  };
};

export default connect(mapStateToProps)(CandidateApplyModal);
