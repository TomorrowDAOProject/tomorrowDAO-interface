'use client';
import React, { PureComponent } from "react";
import { Table, ConfigProvider } from "antd";
import NoData from 'components/NoData';
import {
  RESOURCE_RECORDS,
  RESOURCE_DETAILS_COLUMN,
  PAGE_SIZE,
  ELF_DECIMAL,
} from "../../_src/constants";
import "./index.css";
import TableLayer from "@components/TableLayer/TableLayer";
import LoadingComponent from 'components/LoadingComponent';
import { apiServer } from "api/axios";


const page = 0;
class ResourceDetail extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      address: props.address || "",
      data: null,
      pagination: {
        pageSize: PAGE_SIZE,
        showSizeChanger: false,
        showQuickJumper: true,
        total: 0,
        showTotal: (total) => `Total ${total} items`,
      },
    };
  }

  componentDidMount() {
    this.getResourceDetail(PAGE_SIZE, page);
  }

  async getResourceDetail(PAGE_SIZE, page) {
    const { address, pagination } = this.state;
    this.setState({
      loading: true,
    });
    const { data } = await apiServer.get(RESOURCE_RECORDS, {
      limit: PAGE_SIZE,
      page,
      order: "desc",
      address,
    });
    const records = data.records || [];
    records.map((item, index) => {
      item.key = index + page;
      item.resource = (+item.resource / ELF_DECIMAL).toFixed(8);
    });
    pagination.total = data.total;
    this.setState({
      data: records,
      pagination,
      loading: false,
    });
  }

  handleTableChange = (pagination) => {
    const pager = { ...this.state.pagination };
    pager.current = pagination.current;
    this.setState({
      pagination: pager,
    });

    this.getResourceDetail(pagination.pageSize, pagination.current - 1);
  };

  render() {
    const { pagination, data, loading } = this.state;
    const { handleTableChange } = this;
    return (
      <div className='transaction-details basic-container basic-container-white'>
        <div className="bg-darkBg !rounded-[8px] pb-[10px]">
          <div className="font-Unbounded font-[300] text-[15px] text-white xl:py-[17px] xl:px-[32px] lg:py-[17px] lg:px-[32px] md:py-[17px] md:px-[32px] p-[22px] border-0 border-b border-solid border-fillBg8">Transaction Details</div>
          <TableLayer>
            <ConfigProvider renderEmpty={() => <NoData></NoData>}>
            <Table
              showSorterTooltip={false}
              columns={RESOURCE_DETAILS_COLUMN}
              pagination={pagination}
              dataSource={data}
              loading={{
                spinning: loading,
                indicator: (
                  <LoadingComponent
                    className="-my-3 md:my-0 scale-[0.7] md:scale-[1.0]"
                    size={36}
                    strokeWidth={4}
                  />
                ),
              }}
              onChange={handleTableChange}
              scroll={{ x: 1024 }}
            />
            </ConfigProvider>
          </TableLayer>
        </div>
      </div>
    );
  }
}
export default ResourceDetail;
