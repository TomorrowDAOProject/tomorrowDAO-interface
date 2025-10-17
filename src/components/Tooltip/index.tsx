// import React, { useState, useRef, useEffect } from 'react';
import React from 'react';
import { Tooltip as TooltipAntd } from 'antd';
// import clsx from 'clsx';

interface ITooltipProps {
  title: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

// const Tooltip = ({ title, children, className }: ITooltipProps) => {
const Tooltip = ({ title, children }: ITooltipProps) => {
  // const [visible, setVisible] = useState(false);
  // const [position, setPosition] = useState<'left' | 'center' | 'right'>('center');
  // const tooltipRef = useRef<HTMLDivElement>(null);
  // const containerRef = useRef<HTMLDivElement>(null);

  // useEffect(() => {
  //   if (visible && tooltipRef.current && containerRef.current) {
  //     const tooltipRect = tooltipRef.current.getBoundingClientRect();
  //     const containerRect = containerRef.current.getBoundingClientRect();
  //     const viewportWidth = window.innerWidth;
  //
  //     if (containerRect.left < tooltipRect.width / 2) {
  //       setPosition('left');
  //     } else if (viewportWidth - containerRect.right < tooltipRect.width / 2) {
  //       setPosition('right');
  //     } else {
  //       setPosition('center');
  //     }
  //   }
  // }, [visible]);

  return (
    // <div className="relative inline-block" ref={containerRef}>
    <div className="relative inline-block">
      <TooltipAntd title={title}>
        <div
          // onMouseEnter={() => setVisible(true)}
          // onMouseLeave={() => setVisible(false)}
          className="cursor-pointer leading-none"
        >
          {children}
        </div>
      </TooltipAntd>
      {/*{visible && (*/}
      {/*  <div*/}
      {/*    ref={tooltipRef}*/}
      {/*    className={clsx(*/}
      {/*      'absolute bottom-full max-w-[280px] w-[280px] mb-2 px-4 py-[13px] break-words border border-solid border-fillBg8 bg-darkBg text-desc12 text-lightGrey font-Montserrat rounded-[8px] shadow-lg z-[9999]',*/}
      {/*      {*/}
      {/*        'left-0': position === 'left',*/}
      {/*        'left-1/2 -translate-x-1/2': position === 'center',*/}
      {/*        'right-0': position === 'right',*/}
      {/*      },*/}
      {/*      className,*/}
      {/*    )}*/}
      {/*  >*/}
      {/*    {title}*/}
      {/*    <span*/}
      {/*      className={clsx(*/}
      {/*        'absolute bottom-[-11px] border-l-[8px] border-r-[8px] border-transparent border-solid border-t-[8px] border-t-fillBg8',*/}
      {/*        {*/}
      {/*          'left-4': position === 'left',*/}
      {/*          'left-1/2 -translate-x-1/2': position === 'center',*/}
      {/*          'right-4': position === 'right',*/}
      {/*        },*/}
      {/*      )}*/}
      {/*    />*/}
      {/*    <span*/}
      {/*      className={clsx(*/}
      {/*        'absolute bottom-[-10px] border-l-[7px] border-r-[7px] border-transparent border-solid border-t-[7px] border-t-darkBg',*/}
      {/*        {*/}
      {/*          'left-4': position === 'left',*/}
      {/*          'left-1/2 -translate-x-1/2': position === 'center',*/}
      {/*          'right-4': position === 'right',*/}
      {/*        },*/}
      {/*      )}*/}
      {/*    />*/}
      {/*  </div>*/}
      {/*)}*/}
    </div>
  );
};

export default Tooltip;
