import React, { useState } from 'react';
import './index.css'; // 引入样式文件

interface PaginationProps {
  current: number; // 当前页码
  total: number; // 总数据量
  defaultPageSize?: number; // 默认每页显示的数据量
  pageSizeOptions?: number[]; // 每页条数选项
  onChange: (page: number, pageSize: number) => void; // 页码或每页条数改变时的回调
}

const Pagination: React.FC<PaginationProps> = ({
  current,
  total,
  defaultPageSize = 10,
  pageSizeOptions = [10, 20, 50, 100],
  onChange,
}) => {
  const [pageSize, setPageSize] = useState(defaultPageSize); // 每页条数
  const totalPages = Math.ceil(total / pageSize); // 计算总页数

  // 处理页码改变
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === current) return;
    onChange(page, pageSize);
  };

  // 处理每页条数改变
  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = Number(event.target.value);
    setPageSize(newPageSize);
    onChange(1, newPageSize); // 重置到第一页
  };

  // 生成页码按钮
  const renderPageNumbers = () => {
    const pages = [];
    const maxButtons = 5; // 最多显示的页码按钮数

    let startPage = Math.max(1, current - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    // 首页按钮
    if (startPage > 1) {
      pages.push(
        <button key={1} onClick={() => handlePageChange(1)}>
          1
        </button>,
      );
      if (startPage > 2) {
        pages.push(<span key="start-ellipsis">...</span>);
      }
    }

    // 中间页码按钮
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={i === current ? 'active' : ''}
        >
          {i}
        </button>,
      );
    }

    // 末页按钮
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="end-ellipsis">...</span>);
      }
      pages.push(
        <button key={totalPages} onClick={() => handlePageChange(totalPages)}>
          {totalPages}
        </button>,
      );
    }

    return pages;
  };

  return (
    <div className="pagination">
      {/* 每页条数选择 */}
      <select value={pageSize} onChange={handlePageSizeChange}>
        {pageSizeOptions.map((option) => (
          <option key={option} value={option}>
            {option} 条/页
          </option>
        ))}
      </select>

      {/* 分页器 */}
      <button onClick={() => handlePageChange(1)} disabled={current === 1}>
        &laquo; {/* 首页 */}
      </button>
      <button onClick={() => handlePageChange(current - 1)} disabled={current === 1}>
        &lsaquo; {/* 上一页 */}
      </button>

      {renderPageNumbers()}

      <button onClick={() => handlePageChange(current + 1)} disabled={current === totalPages}>
        &rsaquo; {/* 下一页 */}
      </button>
      <button onClick={() => handlePageChange(totalPages)} disabled={current === totalPages}>
        &raquo; {/* 末页 */}
      </button>
    </div>
  );
};

export default Pagination;
