/**
 * @file list
 * @author atom-yang
 */
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Table, Pagination, ConfigProvider } from "antd";
import Total from "@components/Total";
import TableLayer from "@components/TableLayer/TableLayer";
import { ReactComponent as NoDataIcon } from 'assets/imgs/no-data.svg';
import Input from 'components/Input'
import { ReactComponent as Search } from 'assets/revamp-icon/search.svg';


// const { Search } = Input;

const List = (props) => {
  const {
    pageNum,
    pageSize,
    onSearch,
    onPageChange,
    tableColumns,
    loading,
    searchPlaceholder,
    list,
    total,
    rowKey,
  } = props;
  const [search, setSearch] = useState("");
  useEffect(() => {
    setSearch("");
  }, [tableColumns]);
  function searchChange(value) {
    setSearch(value);
  }

  const noData = ()=>{
    return (
    <div className="flex flex-col items-center">
      <NoDataIcon />
      <div className="text-lightGrey text-center font-Montserrat text-[12px]">No data</div>
    </div>)
  }
  return (
    <div className='my-proposal-content'>
      <div className="flex justify-end">
      <div className="lg:w-[287px] xl:w-[287px] md:w-[287px] w-full h-[36px] mb-[30px] flex flex-row justify-end">
        <Input
          className="!text-[12px]"
          prefix={<Search className="mt-1" />}
          placeholder={searchPlaceholder}
          value={search}
          onChange={(value)=>{
            searchChange(value)
            onSearch(value)
          }} />
        {/* <Search
          className='w-[287px] mb-[30px]'
          placeholder={searchPlaceholder}
          allowClear
          value={search}
          onChange={searchChange}
          onSearch={onSearch}
        /> */}
      </div>
      </div>
      <TableLayer className='my-proposal-content-list'>
      <ConfigProvider renderEmpty={() => noData}>
        <Table
          showSorterTooltip={false}
          dataSource={list}
          columns={tableColumns}
          loading={loading}
          pagination={false}
          rowKey={rowKey}
          bordered={false}
          // scroll={{ x: 1300 }}
        />
      </ConfigProvider>
      </TableLayer>
      <Pagination
        className='float-right gap-top'
        showQuickJumper
        total={total}
        current={pageNum}
        pageSize={pageSize}
        hideOnSinglePage
        onChange={onPageChange}
        showTotal={Total}
      />
    </div>
  );
};

List.propTypes = {
  pageSize: PropTypes.number.isRequired,
  pageNum: PropTypes.number.isRequired,
  onSearch: PropTypes.func.isRequired,
  onPageChange: PropTypes.func.isRequired,
  tableColumns: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
    })
  ).isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  list: PropTypes.array.isRequired,
  total: PropTypes.number.isRequired,
  searchPlaceholder: PropTypes.string.isRequired,
  loading: PropTypes.bool.isRequired,
  rowKey: PropTypes.string.isRequired,
};

export default React.memo(List);
