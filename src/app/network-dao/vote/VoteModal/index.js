// eslint-disable-next-line no-use-before-define
import React, { Component } from "react";
import {
  Table,
  Tabs,
  Modal,
  Form,
  DatePicker,
} from "antd";
import { SearchOutlined, InfoCircleOutlined } from "@ant-design/icons";
import LinkNetworkDao from 'components/LinkNetworkDao';
import moment from "moment";

import "react-datepicker/dist/react-datepicker.css";

import {
  SYMBOL,
  SHORTEST_LOCK_TIME,
  INPUT_SOMETHING_TIP,
  SELECT_SOMETHING_TIP,
  INTEGER_TIP,
  BETWEEN_ZEOR_AND_BALANCE_TIP,
  FEE_TIP,
} from "@src/constants";
import {
  FROM_WALLET,
  FROM_EXPIRED_VOTES,
  FROM_ACTIVE_VOTES,
  ELF_DECIMAL,
} from "../constants";
import { thousandsCommaWithDecimal } from "@utils/formater";
import "./index.css";
import { isIPhone } from "@utils/deviceCheck";
import Input from "components/Input";
import Button from "components/Button";
import Tooltip from "components/Tooltip";
import SimpleDatePicker from 'components/SimpleDatePicker';

const { TabPane } = Tabs;

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};

const switchVotePagination = {
  showQuickJumper: true,
  total: 0,
  showTotal: (total) => `Total ${total} items`,
  pageSize: 3,
};

// todo: Consider to use constant in Vote instead
// todo: Consider to remove this after refactoring the component
const formItemsNeedToValidateMap = {
  fromWallet: ["lockTime", "voteAmountInput"],
  fromExpiredVotes: [],
  fromActiveVotes: ["lockTime", "switchVoteRowSelection"],
};

function disabledDate(current) {
  // Can not select days before today and today
  return (
    current &&
    (current < moment().add(SHORTEST_LOCK_TIME, "days").endOf("day") ||
      current > moment().add(1080, "d"))
  );
}

function getColumns() {
  const { changeVoteState } = this.props;

  return [
    {
      title: "Node Name",
      dataIndex: "name",
      key: "nodeName",
      ...this.getColumnSearchProps("name"),
      render: (text, record) => (
        // todo: consider to extract the component as a independent component
        <Tooltip title={text} className="max-w-[150px] !w-[150px] !p-[2px] !text-[11px]">
          <LinkNetworkDao
            href={{
              pathname: "/vote/team",
              query: {
                pubkey: record.candidate
              }
            }}
            replaceStart="vote"
            className="node-name-in-table"
            // style={{ wordWrap: 'break-word', wordBreak: 'break-word' }}
            style={{ width: 150 }}
            onClick={() => {
              changeVoteState({
                voteModalVisible: false,
              });
            }}
          >
            {text}
          </LinkNetworkDao>
        </Tooltip>
      ),
    },
    {
      title: "Vote Amount",
      dataIndex: "amount",
      key: "voteAmount",
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

class VoteModal extends Component {
  formRef = React.createRef();

  constructor(props) {
    super(props);

    this.handleAllIn = this.handleAllIn.bind(this);
    this.handleOk = this.handleOk.bind(this);
    this.getFormItems = this.getFormItems.bind(this);

    this.state = {
      // eslint-disable-next-line react/no-unused-state
      currentTab: "fromWallet", // fromActiveVotes
      formattedLockTime: null,
      datePickerTime: null,
    };
  }

  // eslint-disable-next-line class-methods-use-this
  onValuesChange(_, values) {
    console.log("onValuesChange", values);
  }
  // todo: why is validateMessages didn't work when mapPropsToFields?
  // validateMessages

  getFormItems() {
    const {
      balance,
      nodeAddress,
      nodeName,
      handleLockTimeChange,
      switchableVoteRecords,
      switchVoteSelectedRowKeys,
      handleSwitchVoteSelectedRowChange,
    } = this.props;

    const columns = getColumns.call(this);
    const switchVoteRowSelection = {
      selectedRowKeys: [
        switchVoteSelectedRowKeys.length > 0
          ? switchVoteSelectedRowKeys[0]
          : "",
      ],
      onChange: (...params) => {
        handleSwitchVoteSelectedRowChange(...params);
        this.setState({
          formattedLockTime: params[1][0].formatedLockTime,
        });
        // set `Select Vote` value manully, cannot set it automatically
        // as formItem's child is not radio but table
        this.formRef.current.setFieldsValue({
          switchVoteRowSelection: params[0],
        });
      },
      type: "radio",
    };

    return [
      {
        type: FROM_WALLET,
        label: "From Wallet",
        index: 0,
        formItems: [
          {
            label: "Node Name",
            // FIXME: handle the other case
            render: (
              <span className="w-full text-lightGrey font-Montserrat !break-words">
                {/* {centerEllipsis(nodeName)} */}
                {nodeName}
              </span>
            ),
          },
          {
            label: "Node Address",
            render: (
              <span className="w-full text-lightGrey font-Montserrat !break-words">
                {/* {centerEllipsis(nodeAddress)} */}
                {nodeAddress}
              </span>
            ),
          },
          {
            label: "Vote Amount",
            render: (
              <Form.Item
                noStyle
                name="voteAmountInput"
                rules={[
                  {
                    required: true,
                    message: INPUT_SOMETHING_TIP,
                  },
                  // todo: What if I want to validate a number and return ok for the number like 1. ?
                  {
                    type: "integer",
                    transform: Number,
                    message: INTEGER_TIP,
                  },
                  {
                    type: "integer",
                    transform: Number,
                    min: 1,
                    max: Math.floor(balance),
                    message: BETWEEN_ZEOR_AND_BALANCE_TIP,
                  },
                ]}
                validateTrigger={["onChange", "onBlur"]}
                validateFirst // todo: How to set it to default?
              >
                <Input className="vote-input" placeholder="Enter vote amount" />
              </Form.Item>
            ),
            // todo: extra should compatible with ReactElement and string
            tip: isIPhone()
              ? null
              : `Usable Balance: ${thousandsCommaWithDecimal(
                balance,
                false
              )} ${SYMBOL}`,
          },
          {
            label: "Lock Time",
            render: (
              <span
                style={{
                  position: "relative",
                }}
              >
                <Form.Item
                  noStyle
                  rules={[
                    {
                      required: true,
                      message: SELECT_SOMETHING_TIP,
                    },
                  ]}
                  // initialValue={defaultDate}
                  name="lockTime"
                >
                  {
                    (
                      <SimpleDatePicker
                        className="vote-lock-data-picker"
                        disabled={disabledDate}
                        showDefaultFormat={true}
                        onChange={(value) => {
                          console.log("value", value);
                          this.setState({
                            datePickerTime: new Date(value),
                          });
                          // todo: edit
                          handleLockTimeChange(moment(value));
                          this.formRef.current.setFieldsValue({
                            lockTime: moment(value),
                          });
                        }}
                      />
                    )}
                </Form.Item>
              </span>
            ),
            tip: isIPhone()
              ? null
              : "Withdraw and transfer are not supported during the locking period",
          },
        ],
      },
      {
        type: FROM_ACTIVE_VOTES,
        label: "From Not Expired Votes",
        index: 2,
        formItems: [
          {
            label: "Node Name",
            render: <span className="w-full text-lightGrey font-Montserrat !break-words">{nodeName}</span>,
          },
          {
            label: "Node Address",
            render: <span className="w-full text-lightGrey font-Montserrat !break-words">{nodeAddress}</span>,
          },
          {
            label: "Select Vote",
            render: (
              <Form.Item
                name="switchVoteRowSelection"
                initialValue={[
                  switchVoteSelectedRowKeys.length > 0
                    ? switchVoteSelectedRowKeys[0]
                    : "",
                ]}
                rules={[
                  {
                    required: true,
                    message: SELECT_SOMETHING_TIP,
                  },
                ]}
              >
                <Table
                  size="middle"
                  dataSource={switchableVoteRecords}
                  columns={columns}
                  rowSelection={switchVoteRowSelection}
                  pagination={switchVotePagination}
                  scroll={{ x: true }}
                />
              </Form.Item>
            ),
          },
        ],
      },
    ];
  }

  handleAllIn() {
    const { balance, changeVoteState } = this.props;
    changeVoteState({ voteAmountInput: { value: balance } });
  }

  // todo: the method seems useless
  handleOk() {
    const { callback, changeVoteState, setVoteConfirmLoading } = this.props;
    const { voteType } = this.props;
    const formItemsNeedToValidate = formItemsNeedToValidateMap[voteType];

    setVoteConfirmLoading(true);

    setTimeout(() => {
      // For old wallet app. We can not receive close event
      setVoteConfirmLoading(false);
    }, 60 * 1000);

    this.formRef.current.validateFields(formItemsNeedToValidate).then(
      (values) => {
        changeVoteState(values, () => {
          // The switch/case is for the future's product require changing.
          switch (voteType) {
            case FROM_WALLET:
              callback();
              break;
            case FROM_EXPIRED_VOTES:
              callback();
              break;
            case FROM_ACTIVE_VOTES:
              callback();
              break;
            default:
              break;
          }
        });
      },
      (err) => {
        setVoteConfirmLoading(false);
      }
    );
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
        <div className="my-[10px] flex items-center justify-between">
          <Button
            type="primary"
            onClick={() => this.handleSearch(selectedKeys, confirm)}
            icon={<i className="tmrwdao-icon-search text-inherit relative top-[2px]" />}
            size="small"
            className="h-[30px]"
          >
            Search
          </Button>
          <Button
            onClick={() => this.handleReset(clearFilters, confirm)}
            size="small"
            className="h-[30px]"
          >
            Reset
          </Button>
        </div>
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
    // this.setState({ searchText: selectedKeys[0] });
  };

  handleReset = (clearFilters, confirm) => {
    clearFilters();
    confirm();
    // this.setState({ searchText: '' });
  };

  render() {
    const {
      voteModalVisible,
      handleVoteTypeChange,
      voteType,
      voteConfirmLoading,
    } = this.props;
    const formItems = this.getFormItems();

    const { formattedLockTime } = this.state;
    let tipHTML = <p className="tip-color text-[11px] text-white font-Montserrat font-medium text-center mt-[30px] mb-[40px]">{FEE_TIP}</p>;
    if (voteType !== "fromWallet") {
      tipHTML = (
        <>
          <p className="tip-color text-[11px] text-white font-Montserrat font-medium text-center mt-[30px] mb-[40px]">
            <div>
              Once the transfer is confirmed, your lock-up time will be reset.
              Another {formattedLockTime || "days"} will be counted from today.
            </div>
            <div>The transfer will cost 0.4301 ELF as the transaction fee.</div>
          </p>
        </>
      );
    }

    return (
      <Modal
        className="vote-modal node-vote-modal"
        title="Node Vote"
        visible={voteModalVisible}
        open={voteModalVisible}
        footer={null}
        onCancel={this.handleCancel}
        confirmLoading={voteConfirmLoading}
        width={740}
        centered
        maskClosable
        keyboard
        destroyOnClose
        // todo: optimize, can I use ...this.props instead of the code on the top?
        {...this.props}
      >
        <Tabs
          defaultActiveKey={voteType}
          // Warning: Antd's tabs' activeKey can only be string type, number type will cause problem
          onChange={handleVoteTypeChange}
          activeKey={voteType}
        >
          {formItems.map((form, index) => (
            // console.log('index', form.index, index);
            // console.log('form', form);
            <TabPane
              tab={
                <span>
                  <input
                    type="radio"
                    checked={voteType === form.type}
                    value={form.type}
                    style={{ marginRight: 10 }}
                    onChange={() => { }}
                  />
                  <label htmlFor={form.label}>{form.label}</label>
                </span>
              }
              key={form.type}
            >
              <Form
                ref={this.formRef}
                className="vote-modal-form mt-[20px]"
                {...formItemLayout}
                onSubmit={this.handleSubmit}
              >
                {form.formItems.map((item) => (
                  // todo: there are repeat code in form

                  <Form.Item
                    required={
                      item.label === "Vote Amount" ||
                      item.label === "Lock Time" ||
                      item.label === "Select Vote"
                    }
                    label={item.label}
                    key={item.label}
                    className={item.extra ? "form-item-with-extra" : ""}
                  >
                    <div className="flex items-center justify-start">
                      {item.validator ? item.render || <Input className="w-full" /> : item.render}
                      {item.tip ? (
                        <span className="relative ml-[8px]">
                          <Tooltip title={item.tip}>
                            <InfoCircleOutlined className="right-icon !text-lightGrey" />
                          </Tooltip>
                        </span>
                      ) : null}
                    </div>
                  </Form.Item>
                ))}
              </Form>
            </TabPane>
          ))}
        </Tabs>
        {tipHTML}
        <div className="w-full mb-[10px]">
          <Button
            type="primary"
            className="w-full h-[40px] rounded-[42px] bg-mainColor text-white font-Montserrat border border-solid border-borderColor hover:!bg-darkBg hover:!text-mainColor hover:!border hover:border-solid hover:!border-mainColor"
            onClick={this.handleOk}
            loading={voteConfirmLoading}
          >
            OK
          </Button>
        </div>
      </Modal>
    );
  }
}

export default VoteModal;
