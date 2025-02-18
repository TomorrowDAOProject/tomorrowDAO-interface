import React from 'react';
import clsx from 'clsx';
import { useMemo } from 'react';

interface PaginationProps {
  total: number;
  current: number;
  pageSize: number;
  showQuickJumper?: boolean;
  hideOnSinglePage?: boolean;
  showTotal?: (total: number, range: [number, number]) => React.ReactNode;
  onChange?: (page: number) => void;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  total,
  current,
  pageSize,
  showQuickJumper = false,
  hideOnSinglePage = false,
  showTotal,
  onChange,
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

  return (
    <div className={clsx('flex items-center gap-2', className)}>
      {showTotal && <div className="text-lightGrey text-descM14">{showTotal(total, range)}</div>}

      <div className="flex items-center gap-2">
        <button
          className={clsx(
            'pagination-btn',
            'flex items-center justify-center w-8 h-8 rounded-[4px] text-descM14',
            {
              'text-lightGrey cursor-not-allowed': current === 1,
              'text-white cursor-pointer hover:text-primary': current !== 1,
            },
          )}
          onClick={() => handlePageClick(current - 1)}
          disabled={current === 1}
        >
          <i className="tmrwdao-icon-arrow-left text-[16px]" />
        </button>

        {pages.map((page, index) => (
          <div
            key={index}
            className={clsx(
              'flex items-center justify-center w-8 h-8 rounded-[4px] cursor-pointer text-descM14 font-Montserrat',
              {
                'bg-mainColor text-white': page === current,
                'text-lightGrey hover:text-white': page !== current && page !== '...',
                'cursor-default': page === '...',
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
            'flex items-center justify-center w-8 h-8 rounded-[4px] text-descM14',
            {
              'text-lightGrey cursor-not-allowed': current === totalPages,
              'text-white cursor-pointer hover:text-primary': current !== totalPages,
            },
          )}
          onClick={() => handlePageClick(current + 1)}
          disabled={current === totalPages}
        >
          <i className="tmrwdao-icon-arrow-right text-[16px]" />
        </button>

        {showQuickJumper && (
          <div className="flex items-center gap-2 ml-2">
            <span className="text-lightGrey text-descM14">Go to</span>
            <input
              className="w-12 h-8 px-2 bg-transparent border border-fillBg8 rounded-[4px] text-white text-descM14"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleJump}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Pagination;
