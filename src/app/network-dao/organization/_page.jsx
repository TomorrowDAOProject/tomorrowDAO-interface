'use client';
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import LinkNetworkDao from "components/LinkNetworkDao";
import {
  Tabs,
  Spin,
  Row,
  Col,
  Modal,
  Empty,
  Result,
} from "antd";
import { Switch, Case, If, Then } from "react-if";
import constants, { LOADING_STATUS, LOG_STATUS } from "@redux/common/constants";
import { setCurrentOrg } from "@actions/proposalDetail";
import getChainIdQuery from 'utils/url';
import Organization from "./Organization";
import { getOrganizations } from "@redux/actions/organizationList";
import "./index.css";
import { removePrefixOrSuffix, sendHeight } from "@common/utils";
import removeHash from "@utils/removeHash";
import useNetworkDaoRouter from "hooks/useNetworkDaoRouter";
import useResponsive from "hooks/useResponsive";
import Input from 'components/Input';
import Pagination from "components/Pagination";

const { TabPane } = Tabs;
const { proposalTypes } = constants;
const keyFromHash = {
  "#association": proposalTypes.ASSOCIATION,
  "#referendum": proposalTypes.REFERENDUM,
};

const OrganizationList = () => {
  // const navigate = useNavigate();
  const { isLG } = useResponsive()
  const router = useNetworkDaoRouter()
  const location = window.location.hash;
  const [activeKey, setActiveKey] = useState(proposalTypes.PARLIAMENT);
  const common = useSelector((state) => state.common, shallowEqual);
  const organizationList = useSelector(
    (state) => state.organizations,
    shallowEqual
  );
  const { params, total, list, bpList, parliamentProposerList, loadingStatus } =
    organizationList;
  const { logStatus, isALLSettle, currentWallet } = common;
  const dispatch = useDispatch();
  const [searchValue, setSearchValue] = useState(params.search);

  const fetchList = (param) => {
    dispatch(getOrganizations(param));
  };

  useEffect(() => {
    // get activeKey according to hash
    const { hash } = location;
    setActiveKey(keyFromHash[hash] || proposalTypes.PARLIAMENT);
    fetchList({
      ...params,
      proposalType: activeKey,
    });
    if (isALLSettle === true) {
      // change redux state
    }
  }, [isALLSettle, logStatus]);

  useEffect(() => {
    setSearchValue(params.search);
  }, [params.search]);

  useEffect(() => {
    sendHeight(500);
  }, [list]);

  const onPageNumChange = (pageNum) =>
    fetchList({
      ...params,
      pageNum,
    });

  const onPageSizeChange = (pageSize) =>
    fetchList({
      ...params,
      pageSize,
      pageNum: 1,
    });

  const onSearch = (value) => {
    fetchList({
      ...params,
      pageNum: 1,
      search: removePrefixOrSuffix(value.trim()),
    });
  };

  const handleTabChange = (key) => {
    if (key === proposalTypes.PARLIAMENT) {
      removeHash();
      setActiveKey(proposalTypes.PARLIAMENT);
    } else {
      const index = Object.values(keyFromHash).findIndex((ele) => ele === key);
      window.location.hash = Object.keys(keyFromHash)[index];
    }
    fetchList({
      ...params,
      pageNum: 1,
      proposalType: key,
      search: "",
    });
  };
  window.addEventListener("hashchange", () => {
    const { hash } = window.location;
    const key = keyFromHash[hash];
    setActiveKey(key || proposalTypes.PARLIAMENT);
  });

  const editOrganization = (orgAddress) => {
    const org = list.filter((item) => item.orgAddress === orgAddress)[0];
    Modal.confirm({
      className: "modify-organisation-modal",
      title: "Modify Organisation?",
      content:
        "Modifying the organisation requires initiating a proposal to modify. Are you sure you want to modify?",
      onOk() {
        dispatch(setCurrentOrg(org));
        const chainIdQuery = getChainIdQuery();
        router.push(`/apply?orgAddress=${orgAddress}&${chainIdQuery.chainIdQueryString}`)
        // navigate(`/proposal/apply/${org.orgAddress}`);
      },
      cancelButtonProps: { type: "primary" },
      icon: null,
    });
  };

  return (
    <div className="organization-list bg-darkBg text-white font-Montserrat rounded-lg border border-solid border-fillBg8 overflow-visible">
      <Tabs
        size={isLG ? 'small' : 'middle'}
        animated={false}
        tabBarExtraContent={
          logStatus === LOG_STATUS.LOGGED ? (
            <div
              className="rounded-[42px] bg-mainColor flex items-center gap-[6px] cursor-pointer hover:!bg-darkBg mr-[18px] md:mr-[38px]"
            >
              <LinkNetworkDao href="/create-organization" className="text-white font-Montserrat !rounded-[42px] px-[10px] py-[6px] hover:!bg-darkBg hover:!text-mainColor hover:border hover:border-solid hover:border-mainColor">
                <span className="hidden md:block">Create Organisation</span>
                <span className="block md:hidden">Create</span>
              </LinkNetworkDao>
            </div>
          ) : null
        }
        className="organization-list-tab relative"
        activeKey={activeKey}
        onChange={handleTabChange}
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
      <div className="page-content-padding">
        <div className="organization-list-filter gap-top-large gap-bottom-large">
          <Row gutter={16}>
            <Col sm={6} xs={24} className="organization-list-filter-input">
              <Input
                className="w-[306px] md:!w-[406px] h-[36px]"
                placeholder="Organisation Address"
                prefix={<i className="tmrwdao-icon-search text-lightGrey" />}
                defaultValue={params.search}
                allowClear
                value={searchValue}
                onChange={(value) => setSearchValue(value)}
                onPressEnter={(value) => onSearch(value)}
                enterKeyHint="search"
              />
            </Col>
          </Row>
        </div>
        <div className="organization-list-list">
          <Switch>
            <Case
              condition={
                loadingStatus === LOADING_STATUS.LOADING ||
                loadingStatus === LOADING_STATUS.SUCCESS
              }
            >
              <Spin spinning={loadingStatus === LOADING_STATUS.LOADING}>
                <Row gutter={16}>
                  {list.map((item) => (
                    <Col sm={12} xs={24} key={item.orgAddress} className="mt-[12px]">
                      <Organization
                        {...item}
                        bpList={bpList}
                        logStatus={logStatus}
                        editOrganization={editOrganization}
                        parliamentProposerList={parliamentProposerList}
                        currentWallet={currentWallet}
                      />
                    </Col>
                  ))}
                </Row>
              </Spin>
            </Case>
            <Case condition={loadingStatus === LOADING_STATUS.FAILED}>
              <Result
                status="error"
                title="Error Happened"
                subTitle="Please check your network"
              />
            </Case>
          </Switch>
          <If
            condition={
              loadingStatus === LOADING_STATUS.SUCCESS && list.length === 0
            }
          >
            <Then>
              <Empty description="No Results found"/>
            </Then>
          </If>
        </div>
        <div className="w-full">
          <Pagination
            className="mt-[12px] mb-[60px]"
            total={total}
            current={params.pageNum ?? 1}
            pageSize={params.pageSize ?? 10}
            hideOnSinglePage
            onChange={onPageNumChange}
            onPageSizeChange={onPageSizeChange}
          />
        </div>
      </div>
    </div>
  );
};

export default React.memo(OrganizationList);