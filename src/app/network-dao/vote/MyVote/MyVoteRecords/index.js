import React, { Component } from "react";
import LinkNetworkDao from 'components/LinkNetworkDao';
import { connect } from "react-redux";
import { Table, ConfigProvider } from 'antd';
import NoData from 'components/NoData';
import Button from 'components/Button';
import Input from 'components/Input';
import Tooltip from 'components/Tooltip';

import { SearchOutlined } from "@ant-design/icons";
import publicKeyToAddress from "@utils/publicKeyToAddress";

import "./MyVoteRecords.css";
import { ELF_DECIMAL } from "../../constants";

function genMyVoteRecordsCols() {
  const { isSmallScreen } = this.props;

  const myVoteRecordsCols = [
    {
      title: "Rank",
      dataIndex: "displayedRank",
      key: "rank",
      width: 70,
      sorter: (a, b) => a.rank - b.rank,
    },
    {
      title: "Node Name",
      dataIndex: "name",
      key: "nodeName",
      width: 250,
      ellipsis: true,
      ...this.getColumnSearchProps("name"),
      render: (text, record) => (
        <Tooltip title={text}>
          <LinkNetworkDao
            href={{
              pathname: '/vote/team',
              query: {
                pubkey: record.candidate
              }
            }}
            replaceStart="vote"
          >
            {text}
          </LinkNetworkDao>
        </Tooltip>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: 90,
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
      dataIndex: "formattedLockTime",
      key: "formattedLockTime",
    },
    {
      title: "Unlock Time",
      ellipsis: true,
      dataIndex: "formattedUnlockTime",
      key: "formattedUnlockTime",
    },
    {
      title: "Status",
      key: "status",
      dataIndex: "status",
      width: 110,
    },
    {
      title: "Operation Time",
      dataIndex: "operationTime",
      defaultSortOrder: "descend",
      key: "operationTime",
      width: 180,
      sorter: (a, b) => {
        let prev = null;
        let next = null;
        prev = a.withdrawTimestamp
          ? a.withdrawTimestamp.seconds
          : a.voteTimestamp.seconds;
        next = b.withdrawTimestamp
          ? b.withdrawTimestamp.seconds
          : b.voteTimestamp.seconds;

        return prev - next;
      },
    },
    {
      title: "Operations",
      key: "operations",
      render: (text, record) => (
        <div className="node-list-btn-group">
          <Button
            type="primary"
            className="table-btn redeem-btn"
            data-role="redeemOne"
            data-nodeaddress={publicKeyToAddress(record.candidate)}
            data-nodename={record.nane || publicKeyToAddress(record.candidate)}
            data-amount={record.amount}
            disabled={!record.isRedeemable || record.type === "Redeem"}
            data-shoulddetectlock
            data-voteId={JSON.stringify(record.voteId)}
          >
            Redeem
          </Button>
        </div>
      ),
    },
  ];

  // todo: Use css way
  if (isSmallScreen) {
    myVoteRecordsCols.pop();
  }

  myVoteRecordsCols.forEach((item) => {
    // eslint-disable-next-line no-param-reassign
    item.align = "center";
  });
  return myVoteRecordsCols;
}

const pagination = {
  showQuickJumper: true,
  total: 0,
  showTotal: (total) => `Total ${total} items`,
  showSizeChanger: false,
};

class MyVoteRecords extends Component {
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
          icon={<SearchOutlined />}
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

  render() {
    const { data } = this.props;
    const myVoteRecordsCols = genMyVoteRecordsCols.call(this);

    return (
      <section className="pt-5 border-0 border-t border-solid border-t-fillBg8">
        <h2 className="mb-1 text-white text-descM12 font-Montserrat">My Votes</h2>

        <ConfigProvider renderEmpty={() => <NoData></NoData>}>
          <Table
            showSorterTooltip={false}
            columns={myVoteRecordsCols}
            dataSource={data}
            pagination={pagination}
            rowKey={(record) => record.voteId}
            scroll={{ x: 'max-content' }}
          />
        </ConfigProvider>
      </section>
    );
  }
}

const mapStateToProps = (state) => ({
  ...state.common,
});

export default connect(mapStateToProps)(MyVoteRecords);
