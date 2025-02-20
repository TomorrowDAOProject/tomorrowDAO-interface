import React, { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';

interface ITooltipProps {
  title: React.ReactNode;
  children: React.ReactNode;
}

const Tooltip = ({ title, children }: ITooltipProps) => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState<'left' | 'center' | 'right'>('center');
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visible && tooltipRef.current && containerRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;

      // 检测左边界
      if (containerRect.left < tooltipRect.width / 2) {
        setPosition('left');
      }
      // 检测右边界
      else if (viewportWidth - containerRect.right < tooltipRect.width / 2) {
        setPosition('right');
      }
      // 默认居中
      else {
        setPosition('center');
      }
    }
  }, [visible]);

  return (
    <div className="relative inline-block" ref={containerRef}>
      <div
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        className="cursor-pointer leading-none"
      >
        {children}
      </div>
      {visible && (
        <div
          ref={tooltipRef}
          className={clsx(
            'absolute bottom-full max-w-[280px] min-w-[160px] mb-2 px-4 py-[13px] border border-solid border-fillBg8 bg-darkBg text-desc12 text-lightGrey font-Montserrat rounded-[8px] shadow-lg z-[9999]',
            {
              'left-0': position === 'left',
              'left-1/2 -translate-x-1/2': position === 'center',
              'right-0': position === 'right',
            },
          )}
        >
          {title}
          <span
            className={clsx(
              'absolute bottom-[-11px] border-l-[8px] border-r-[8px] border-transparent border-solid border-t-[8px] border-t-fillBg8',
              {
                'left-4': position === 'left',
                'left-1/2 -translate-x-1/2': position === 'center',
                'right-4': position === 'right',
              },
            )}
          />
          <span
            className={clsx(
              'absolute bottom-[-10px] border-l-[7px] border-r-[7px] border-transparent border-solid border-t-[7px] border-t-darkBg',
              {
                'left-4': position === 'left',
                'left-1/2 -translate-x-1/2': position === 'center',
                'right-4': position === 'right',
              },
            )}
          />
        </div>
      )}
    </div>
  );
};

export default Tooltip;
