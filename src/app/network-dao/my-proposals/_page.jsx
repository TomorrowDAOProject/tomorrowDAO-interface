/**
 * @file my proposal
 * @author atom-yang
 */
import React, { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import moment from "moment";
import { Tooltip, Menu, message, Tabs, Row, Col, Result } from "antd";
import LinkNetworkDao from 'components/LinkNetworkDao';
import List from "./List";
import constants, {
  ACTIONS_COLOR_MAP,
  API_PATH,
  STATUS_COLOR_MAP,
} from "@redux/common/constants";
import Tag from 'components/Tag'
import {
  omitString,
  removePrefixOrSuffix,
  sendHeight,
} from "@common/utils";
import { isSideChainByQueryParams } from 'utils/chain'
import { explorer, mainExplorer } from "config";
import config from "@common/config";
import OrgAddress from "../_proposal_root/components/OrgAddress";
import { request } from "@common/request";
import { ReactComponent as WaringIcon } from 'assets/revamp-icon/waring.svg';


import "./index.css";
const isSideChain = isSideChainByQueryParams()
const { SubMenu, Item: MenuItem } = Menu;
const { TabPane } = Tabs;
const { proposalTypes } = constants;

const MENU_PATH = {
  APPLIED: "applied",
  ORGANIZATION: "organization",
  ORGANIZATION_PROPOSER: "proposer",
  ORGANIZATION_MEMBERS: "members",
  VOTES: "votes",
};

const defaultSelectedKey = [MENU_PATH.APPLIED];

const LIST_TABS = {
  [MENU_PATH.APPLIED]: {
    placeholder: "Proposal ID",
    api: API_PATH.GET_APPLIED_PROPOSALS,
    columns: [
      {
        title: "Proposal ID",
        dataIndex: "proposalId",
        key: "proposalId",
        ellipsis: true,
        width: 200,
        render(text) {
          return (
            <LinkNetworkDao
              href={{
                pathname: `/proposal/${text}`,
            }}>
              <Tooltip title={<span className="font-Montserrat text-[10px]">{text}</span>} placement="topLeft">
                <span className="font-Montserrat text-white">{omitString(text)}</span>
              </Tooltip>
            </LinkNetworkDao>
          );
        },
      },
      {
        title: "Tx ID",
        dataIndex: "createTxId",
        key: "createTxId",
        ellipsis: true,
        width: 200,
        render(text) {
          return (
            <a
              href={`${isSideChain ? explorer : mainExplorer}/tx/${text}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Tooltip title={<span className="font-Montserrat text-[10px]">{text}</span>} placement="topLeft">
                <span className="font-Montserrat text-white">{omitString(text)}</span>
              </Tooltip>
            </a>
          );
        },
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 100,
        render (text) {
          console.log('STATUS_COLOR_MAP[text]', STATUS_COLOR_MAP[text], text)
          return (
            <div>
              <Tag color={STATUS_COLOR_MAP[text]}>{text}</Tag>
            </div>
          )
        }
      },
      {
        title: "Application Time",
        dataIndex: "createAt",
        key: "createAt",
        width: 200,
        align: 'right',
        render(text) {
          return moment(text).format("YYYY/MM/DD HH:mm:ss");
        },
      },
    ],
    rowKey: "proposalId",
  },
  [MENU_PATH.ORGANIZATION_PROPOSER]: {
    placeholder: "Organisation Address",
    api: API_PATH.GET_AUDIT_ORG_BY_PAGE,
    columns: [
      {
        title: "Organisation Address",
        dataIndex: "orgAddress",
        key: "orgAddress",
        ellipsis: true,
        width: 200,
        render(_, record) {
          return (
            <OrgAddress
              orgAddress={record.orgAddress}
              proposalType={record.proposalType}
            />
          );
        },
      },
      {
        title: "Tx ID",
        dataIndex: "txId",
        key: "txId",
        ellipsis: true,
        width: 200,
        render(text) {
          return (
            <a
              href={`${isSideChain ? explorer : mainExplorer}/tx/${text}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Tooltip title={<span className="font-Montserrat text-white text-[10px]">{text}</span>} placement="topLeft">
               <span className="font-Montserrat text-white">{omitString(text)}</span>
              </Tooltip>
            </a>
          );
        },
      },
      {
        title: "Update Time",
        dataIndex: "updatedAt",
        key: "updatedAt",
        width: 200,
        align: 'right',
        render(text) {
          return moment(text).format("YYYY/MM/DD HH:mm:ss");
        },
      },
    ],
    rowKey: "orgAddress",
  },
  [MENU_PATH.ORGANIZATION_MEMBERS]: {
    placeholder: "Organisation Address",
    api: API_PATH.GET_ORG_OF_OWNER,
    columns: [
      {
        title: "Organisation Address",
        dataIndex: "orgAddress",
        key: "orgAddress",
        ellipsis: true,
        width: 200,
        render(_, record) {
          return (
            <OrgAddress
              orgAddress={record.orgAddress}
              proposalType={record.proposalType}
            />
          );
        },
      },
      {
        title: "Tx ID",
        dataIndex: "txId",
        key: "txId",
        ellipsis: true,
        width: 200,
        render(text) {
          return (
            <a
              href={`${isSideChain ? explorer : mainExplorer}/tx/${text}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Tooltip title={<span className="font-Montserrat text-[10px]">{text}</span>} placement="topLeft">
              <span className="font-Montserrat text-white">{omitString(text)}</span>
              </Tooltip>
            </a>
          );
        },
      },
      {
        title: "Update Time",
        dataIndex: "updatedAt",
        key: "updatedAt",
        width: 200,
        align: 'right',
      },
    ],
    rowKey: "orgAddress",
  },
  [MENU_PATH.VOTES]: {
    placeholder: "Proposal ID",
    api: API_PATH.GET_ALL_PERSONAL_VOTES,
    columns: [
      {
        title: "Proposal ID",
        dataIndex: "proposalId",
        key: "proposalId",
        ellipsis: true,
        width: 200,
        render(text) {
          return (
            <LinkNetworkDao
              href={{
                pathname: `/proposal/${text}`,
              }}
            >
              <Tooltip title={<span className="font-Montserrat text-[10px]">{text}</span>} placement="topLeft">
                <span className="font-Montserrat font-white">{omitString(text)}</span>
              </Tooltip>
            </LinkNetworkDao>
          );
        },
      },
      {
        title: "Type",
        dataIndex: "action",
        key: "action",
        width: 120,
        render(text) {
          return <Tag color={ACTIONS_COLOR_MAP[text]}>{text}</Tag>;
        },
      },
      {
        title: "Tx ID",
        dataIndex: "txId",
        key: "txId",
        ellipsis: true,
        width: 200,
        render(text) {
          return (
            <a
              href={`${isSideChain ? explorer : mainExplorer}/tx/${text}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Tooltip title={<span className="font-Montserrat text-[10px]">{text}</span>} placement="topLeft">
                <span className="font-Montserrat font-white">{omitString(text)}</span>
              </Tooltip>
            </a>
          );
        },
      },
      {
        title: "Time",
        dataIndex: "time",
        key: "time",
        width: 200,
        align: 'right',
        render(time) {
          return moment(time).format("YYYY/MM/DD HH:mm:ss");
        },
      },
    ],
    rowKey: "txId",
  },
};

const REFERENDUM_TOKEN_COLUMN_ITEM = {
  title: "Amount",
  dataIndex: "amount",
  key: "amount",
  width: 150,
  render(text, record) {
    if (text) {
      return (
        <div>
          {text}
          &nbsp;
          {record.symbol}
        </div>
      );
    }
    return "-";
  },
};

function getTableColumns(proposalType, currentMenu) {
  const { columns } = LIST_TABS[currentMenu];
  if (
    proposalType === proposalTypes.REFERENDUM &&
    currentMenu === MENU_PATH.VOTES
  ) {
    return [
      ...columns.slice(0, 2),
      REFERENDUM_TOKEN_COLUMN_ITEM,
      ...columns.slice(2),
    ];
  }
  return columns;
}

const MyProposal = () => {
  const [params, setParams] = useState({
    proposalType: proposalTypes.PARLIAMENT,
    currentMenu: MENU_PATH.APPLIED,
    loading: true,
    pageSize: 10,
    pageNum: 1,
    search: "",
  });
  const [result, setResult] = useState({
    total: 0,
    list: [],
  });
  const common = useSelector((state) => state.common);
  const { currentWallet } = common;

  function fetch(apiParams, menuKey) {
    const apiPath = LIST_TABS[menuKey].api;
    setResult({
      list: [],
      total: 0,
    });
    setParams({
      ...params,
      loading: true,
    });
    request(apiPath, apiParams, {
      method: "GET",
    })
      .then((res) => {
        const { list, total } = res;
        setParams({
          ...params,
          ...apiParams,
          currentMenu: menuKey,
          loading: false,
        });
        setResult({
          list,
          total,
        });
        sendHeight(400);
      })
      .catch((e) => {
        sendHeight(400);
        console.error(e);
        message.error("Network error");
      });
  }
  const tableColumns = useMemo(
    () => getTableColumns(params.proposalType, params.currentMenu),
    [params.proposalType, params.currentMenu]
  );
  useEffect(() => {
    if (!currentWallet.address) return;
    fetch(
      {
        ...params,
        address: currentWallet.address,
      },
      params.currentMenu
    );
  }, [currentWallet.address]);

  const handleProposalTypeChange = async (type) => {
    const { pageSize } = params;
    const { address } = currentWallet;
    await fetch(
      {
        pageSize,
        pageNum: 1,
        search: "",
        address,
        proposalType: type,
      },
      params.currentMenu
    );
  };

  const handleMenuChange = async (e) => {
    const { key } = e;
    const { pageSize, proposalType } = params;
    await fetch(
      {
        pageSize,
        pageNum: 1,
        search: "",
        address: currentWallet.address,
        proposalType,
      },
      key
    );
  };

  async function onSearch(text) {
    const { pageSize, proposalType } = params;
    const { address } = currentWallet;
    await fetch(
      {
        pageSize,
        pageNum: 1,
        search: removePrefixOrSuffix((text || "").trim()),
        address,
        proposalType,
      },
      params.currentMenu
    );
  }

  async function onPageChange(page, pageSize) {
    const { address } = currentWallet;
    const { search, proposalType } = params;
    await fetch(
      {
        pageSize,
        pageNum: page,
        search,
        address,
        proposalType,
      },
      params.currentMenu
    );
  }
  if (!currentWallet.address) {
    return (
    <div className="px-4 lg:px-8 text-center h-[calc(100vh-200px)] flex flex-col items-center justify-center">
      <WaringIcon />
      <div className="text-white text-[18px] font-Montserrat mt-[18px] font-medium">
        <p>Please log in first before</p>
        <p>creating a proposal</p>
      </div>
    </div>);
  }

  return (
    <div className="my-proposal bg-white h-full">
      <Tabs
        className="proposal-list-tab"
        onChange={handleProposalTypeChange}
        animated={false}
      >
        <TabPane
          tab={proposalTypes.PARLIAMENT}
          key={proposalTypes.PARLIAMENT}
        />
        <TabPane
          tab={proposalTypes.ASSOCIATION}
          key={proposalTypes.ASSOCIATION}
        />
        <TabPane
          tab={proposalTypes.REFERENDUM}
          key={proposalTypes.REFERENDUM}
        />
      </Tabs>
      <Row gutter={16} className="my-proposal-list gap-top">
        <Col sm={6} xs={24}>
          <div className="my-proposal-list-menu border-0 border-r border-solid lg:border-fillBg8 xl:border-fillBg8 md:border-fillBg8 border-transparent">
            <Menu
              onClick={handleMenuChange}
              defaultSelectedKeys={defaultSelectedKey}
              mode="inline"
            >
              <MenuItem disabled={params.loading} key={MENU_PATH.APPLIED}>
                Applied Proposals
              </MenuItem>
              <SubMenu
                disabled={params.loading}
                key={MENU_PATH.ORGANIZATION}
                title="My Organisations"
              >
                <MenuItem
                  disabled={params.loading}
                  key={MENU_PATH.ORGANIZATION_MEMBERS}
                >
                  As a Member
                </MenuItem>
                <MenuItem
                  disabled={params.loading}
                  key={MENU_PATH.ORGANIZATION_PROPOSER}
                >
                  As a Proposer
                </MenuItem>
              </SubMenu>
              <MenuItem disabled={params.loading} key={MENU_PATH.VOTES}>
                My Votes
              </MenuItem>
            </Menu>
          </div>
        </Col>
        <Col sm={18} xs={24}>
          <List
            pageNum={params.pageNum}
            pageSize={params.pageSize}
            onSearch={onSearch}
            onPageChange={onPageChange}
            tableColumns={tableColumns}
            list={result.list}
            total={result.total}
            searchPlaceholder={LIST_TABS[params.currentMenu].placeholder}
            loading={params.loading}
            rowKey={LIST_TABS[params.currentMenu].rowKey}
          />
        </Col>
      </Row>
    </div>
  );
};

export default React.memo(MyProposal);
