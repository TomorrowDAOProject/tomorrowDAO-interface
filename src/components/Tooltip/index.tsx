import React, { useState } from 'react';

interface ITooltipProps {
  title: React.ReactNode;
  children: React.ReactNode;
}

const Tooltip = ({ title, children }: ITooltipProps) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        className="cursor-pointer"
      >
        {children}
      </div>
      {visible && (
        <div className="absolute left-1/2 bottom-full w-[280px] transform -translate-x-1/2 mb-2 px-4 py-[13px] border border-solid border-fillBg8 bg-darkBg text-desc12 text-lightGrey font-Montserrat rounded-[8px] shadow-lg">
          {title}
          <span className="absolute bottom-[-11px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-transparent border-solid border-t-[8px] border-t-fillBg8"></span>
          <span className="absolute bottom-[-10px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[7px] border-r-[7px] border-transparent border-solid border-t-[7px] border-t-darkBg"></span>
        </div>
      )}
    </div>
  );
};

export default Tooltip;
