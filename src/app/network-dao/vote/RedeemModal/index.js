import React, { PureComponent } from "react";
import { Divider, Modal, Form, Input, Button, Table } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { connect } from "react-redux";
import {
  SYMBOL,
  SELECT_SOMETHING_TIP,
  NEED_PLUGIN_AUTHORIZE_TIP,
  FEE_TIP,
} from "@src/constants";
import BigNumber from "bignumber.js";
import { ELF_DECIMAL } from "../constants";
import TableLayer from "@components/TableLayer/TableLayer";
import "./index.css";

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

const pagination = {
  showQuickJumper: true,
  total: 0,
  showTotal: (total) => `Total ${total} items`,
  pageSize: 3,
  showSizeChanger: false,
};

function getColumns() {
  return [
    {
      title: "Vote Amount",
      dataIndex: "amount",
      key: "voteAmount",
      defaultSortOrder: "descend",
      sorter: (a, b) => a.amount - b.amount,
      render: (value) => value / ELF_DECIMAL,
    },
    {
      title: "Lock Time",
      dataIndex: "formatedLockTime",
      key: "lockTime",
      sorter: (a, b) => a.lockTime - b.lockTime,
    },
    {
      title: "Vote Time",
      dataIndex: "formatedVoteTime",
      key: "voteTime",
      sorter: (a, b) => a.voteTimestamp.seconds - b.voteTimestamp.seconds,
    },
  ];
}

class RedeemModal extends PureComponent {
  formRef = React.createRef();

  constructor(props) {
    super(props);
    this.handleOk = this.handleOk.bind(this);
  }

  getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={(node) => {
            this.searchInput = node;
          }}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => this.handleSearch(selectedKeys, confirm)}
          style={{ width: 188, marginBottom: 8, display: "block" }}
        />
        <Button
          type="primary"
          onClick={() => this.handleSearch(selectedKeys, confirm)}
          icon="search"
          size="small"
          style={{ width: 90, marginRight: 8 }}
        >
          Search
        </Button>
        <Button
          onClick={() => this.handleReset(clearFilters, confirm)}
          size="small"
          style={{ width: 90 }}
        >
          Reset
        </Button>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => this.searchInput.select());
      }
    },
  });

  handleSearch = (selectedKeys, confirm) => {
    confirm();
  };

  handleReset = (clearFilters, confirm) => {
    clearFilters();
    confirm();
  };

  generateVoteRedeemForm() {
    const {
      nodeAddress,
      nodeName,
      redeemableVoteRecordsForOneCandidate,
      activeVoteRecordsForOneCandidate,
      currentWallet,
    } = this.props;

    const activeVoteAmountForOneCandidate = +BigNumber(
      activeVoteRecordsForOneCandidate.reduce(
        (total, current) => total + +current.amount,
        0
      )
    ).div(ELF_DECIMAL);
    const redeemableVoteAmountForOneCandidate = +BigNumber(
      redeemableVoteRecordsForOneCandidate.reduce(
        (total, current) => total + +current.amount,
        0
      )
    ).div(ELF_DECIMAL);
    const redeemVoteSelectedRowKeys = this.formRef.current?.getFieldValue(
      "redeemVoteSelectedRowKeys"
    );

    const columns = getColumns.call(this);
    const rowSelection = {
      selectedRowKeys: redeemVoteSelectedRowKeys,
      onChange: (value) => {
        // eslint-disable-next-line no-unused-expressions
        this.formRef.current?.setFieldsValue({
          redeemVoteSelectedRowKeys: value,
        });
      },
      hideDefaultSelections: true,
      type: "radio",
    };

    return {
      formItems: [
        {
          label: "Node Name",
          render: (
            <span className="form-item-value text-ellipsis">{nodeName}</span>
          ),
        },
        {
          label: "Node Add",
          render: (
            <span className="form-item-value text-ellipsis">{nodeAddress}</span>
          ),
        },
        {
          label: "Active Vote",
          render: (
            <span className="form-item-value">
              {activeVoteAmountForOneCandidate} {SYMBOL}
            </span>
          ),
        },
        {
          label: "Expired Vote",
          render: (
            <span className="form-item-value">
              {redeemableVoteAmountForOneCandidate} {SYMBOL}
            </span>
          ),
        },
        {
          label: "Select Vote",
          render: (
            <TableLayer>
              <Table
                showSorterTooltip={false}
                dataSource={redeemableVoteRecordsForOneCandidate}
                columns={columns}
                pagination={pagination}
                rowKey={(record) => record.voteId}
                rowSelection={rowSelection}
              />
            </TableLayer>
          ),
          validator: {
            rules: [
              {
                required: true,
                message: SELECT_SOMETHING_TIP,
              },
            ],
            fieldDecoratorid: "redeemVoteSelectedRowKeys",
          },
        },
        {
          label: "Redeem To",
          render: (
            <span className="form-item-value">
              {currentWallet?.name || currentWallet?.address}
            </span>
          ),
        },
      ],
    };
  }

  handleOk() {
    const { handleRedeemConfirm, changeVoteState, setRedeemConfirmLoading } =
      this.props;

    setRedeemConfirmLoading(true);

    setTimeout(() => {
      // For old wallet app. We can not receive close event
      setRedeemConfirmLoading(false);
    }, 60 * 1000);
    const redeemVoteSelectedRowKeys = this.formRef.current?.getFieldValue(
      "redeemVoteSelectedRowKeys"
    );
    if (redeemVoteSelectedRowKeys) {
      changeVoteState({ redeemVoteSelectedRowKeys }, () => {
        handleRedeemConfirm();
      });
    } else {
      setRedeemConfirmLoading(false);
    }
  }

  render() {
    const { voteRedeemModalVisible, handleCancel, redeemConfirmLoading } =
      this.props;

    const voteRedeemForm = this.generateVoteRedeemForm();

    return (
      <Modal
        className="vote-redeem-modal vote-redeem-modal-new"
        title="Node Redeem"
        visible={voteRedeemModalVisible}
        confirmLoading={redeemConfirmLoading}
        // onOk={this.handleOk}
        onCancel={handleCancel.bind(this, "voteRedeemModalVisible")}
        footer={null}
        width={740}
        centered
        maskClosable
        keyboard
        destroyOnClose
      >
        <Divider className="my-[30px]" />
        <Form
          ref={this.formRef}
          {...formItemLayout}
          onSubmit={this.handleSubmit}
        >
          {voteRedeemForm.formItems &&
            voteRedeemForm.formItems.map((item) => (
              <Form.Item
                label={item.label}
                key={item.label}
                name={item.validator?.fieldDecoratorId}
                ruels={item.validator?.rules}
                initialValue={item.validator?.initialValue}
                validateTrigger={item.validator?.validateTrigger}
              >
                {item.validator ? (
                  <span>{item.render}</span> || <Input />
                ) : (
                  <span>{item.render}</span>
                )}
              </Form.Item>
            ))}
        </Form>
        <p className="fee-tip-class">{FEE_TIP}</p>
        <p className="auth-tip-class">{NEED_PLUGIN_AUTHORIZE_TIP}</p>
        <div className="w-full flex items-center justify-between">
          <Button
            type="primary"
            onClick={this.handleOk}
            className="flex-1 h-[40px] leading-[30px] text-[15px] text-white font-medium font-Montserrat bg-mainColor rounded-[42px] border border-solid border-mainColor hover:!bg-darkBg hover:!text-mainColor hover:border hover:border-solid hover:border-mainColor"
          >
            OK
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
export default connect(mapStateToProps)(RedeemModal);