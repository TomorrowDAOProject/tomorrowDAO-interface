import React from 'react';
import clsx from 'clsx';
import { useMemo } from 'react';
import Select, { SelectOption } from 'components/Select';

interface PaginationProps {
  total: number;
  current: number;
  pageSize: number;
  pageSizeOptions?: SelectOption[];
  showQuickJumper?: boolean;
  hideOnSinglePage?: boolean;
  showTotal?: (total: number, range: [number, number]) => React.ReactNode;
  onChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  total,
  current,
  pageSize = 10,
  pageSizeOptions,
  showQuickJumper = false,
  hideOnSinglePage = false,
  showTotal,
  onChange,
  onPageSizeChange,
  className,
}) => {
  const [inputValue, setInputValue] = React.useState('');
  const totalPages = Math.ceil(total / pageSize);
  const range: [number, number] = [
    (current - 1) * pageSize + 1,
    Math.min(current * pageSize, total),
  ];

  const pages = useMemo(() => {
    const items: (number | string)[] = [];
    const addPage = (page: number) => items.push(page);
    const addEllipsis = () => items.push('...');

    // 始终显示第一页
    addPage(1);

    if (current > 3) {
      addEllipsis();
    }

    // 显示当前页附近的页码
    for (let i = Math.max(2, current - 1); i <= Math.min(current + 1, totalPages - 1); i++) {
      addPage(i);
    }

    if (current < totalPages - 2) {
      addEllipsis();
    }

    // 始终显示最后一页
    if (totalPages > 1) {
      addPage(totalPages);
    }

    return items;
  }, [current, totalPages]);

  if (hideOnSinglePage && totalPages <= 1) {
    return null;
  }

  const handlePageClick = (page: number) => {
    if (page !== current && page >= 1 && page <= totalPages) {
      onChange?.(page);
    }
  };

  const handleJump = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const page = parseInt(inputValue);
      if (!isNaN(page) && page >= 1 && page <= totalPages) {
        onChange?.(page);
        setInputValue('');
      }
    }
  };

  const handlePageSizeChange = ({ value }: SelectOption) => {
    onPageSizeChange?.(Number(value));
  };

  return (
    <div
      className={clsx(
        'flex justify-between gap-[10px] items-start md:items-center flex-col md:flex-row',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-desc10 text-lightGrey font-Montserrat">Show:</span>
        <Select
          className="w-[51px] !px-2 !py-[1px]"
          labelClassName="!text-desc10 !text-lightGrey"
          iconClassName="!text-[12px]"
          options={
            pageSizeOptions ?? [
              { label: '10', value: 10 },
              { label: '20', value: 20 },
              { label: '50', value: 50 },
              { label: '100', value: 100 },
            ]
          }
          value={pageSize}
          onChange={(value) => handlePageSizeChange(value)}
        />
        <span className="text-desc10 text-lightGrey font-Montserrat">Records</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          className={clsx(
            'pagination-btn',
            'px-2 flex items-center justify-center h-6 rounded-[4px] text-desc10 bg-fillBg8 border border-fillBg16',
            {
              'text-lightGrey cursor-not-allowed': current === 1,
              'text-white cursor-pointer hover:text-primary': current !== 1,
            },
          )}
          onClick={() => handlePageClick(1)}
          disabled={current === 1}
        >
          First
        </button>
        <button
          className={clsx(
            'pagination-btn',
            'flex items-center justify-center w-6 h-6 rounded-[4px] text-desc10 bg-fillBg8 border border-fillBg16',
            {
              'text-lightGrey cursor-not-allowed': current === 1,
              'text-white cursor-pointer hover:text-primary': current !== 1,
            },
          )}
          onClick={() => handlePageClick(current - 1)}
          disabled={current === 1}
        >
          <i className="tmrwdao-icon-arrow text-[12px] text-inherit rotate-180" />
        </button>

        {pages.map((page, index) => (
          <div
            key={index}
            className={clsx(
              'flex items-center justify-center w-6 h-6 rounded-[4px] cursor-pointer text-desc10 font-Montserrat',
              {
                'bg-mainColor text-white': page === current,
                'text-lightGrey hover:text-white': page !== current && page !== '...',
                'text-lightGrey': page === '...',
              },
            )}
            onClick={() => (page !== '...' ? handlePageClick(page as number) : null)}
          >
            {page}
          </div>
        ))}

        <button
          className={clsx(
            'pagination-btn',
            'flex items-center justify-center w-6 h-6 rounded-[4px] text-desc10 bg-fillBg8 border border-fillBg16',
            {
              'text-lightGrey cursor-not-allowed': current === totalPages,
              'text-white cursor-pointer hover:text-primary': current !== totalPages,
            },
          )}
          onClick={() => handlePageClick(current + 1)}
          disabled={current === totalPages}
        >
          <i className="tmrwdao-icon-arrow text-[12px] text-inherit" />
        </button>

        <button
          className={clsx(
            'pagination-btn',
            'px-2 flex items-center justify-center h-6 rounded-[4px] text-desc10 bg-fillBg8 border border-fillBg16',
            {
              'text-lightGrey cursor-not-allowed': current === totalPages,
              'text-white cursor-pointer hover:text-primary': current !== totalPages,
            },
          )}
          onClick={() => handlePageClick(totalPages)}
          disabled={current === totalPages}
        >
          Last
        </button>

        {showQuickJumper && (
          <div className="flex items-center gap-2 ml-2">
            <span className="text-lightGrey text-desc10">Go to</span>
            <input
              className="w-12 h-8 px-2 text-desc10 font-Montserrat bg-fillBg8 border border-fillBg16 rounded-[4px] text-white text-descM14 outline-none appearance-none"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleJump}
            />
          </div>
        )}
        {showTotal && (
          <div className="text-lightGrey text-desc10 font-Montserrat">
            {showTotal(total, range)}
          </div>
        )}
      </div>
    </div>
  );
};

export default Pagination;
