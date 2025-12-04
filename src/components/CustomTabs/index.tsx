import React from 'react';
import clsx from 'clsx';
import './index.css';

export type TabItem = {
  key: string;
  label: string | React.ReactNode;
  icon?: React.ReactNode;
  children?: React.ReactNode;
};

interface CustomTabsProps {
  activeKey?: string;
  items?: TabItem[];
  onChange?: (key: string) => void;
  className?: string;
}

const CustomTabs: React.FC<CustomTabsProps> = ({ activeKey, items = [], onChange, className }) => {
  return (
    <div className={clsx('custom-tabs-container', className)}>
      <div className="custom-tabs-header overflow-x-auto">
        {items.map((item) => (
          <div
            key={item.key}
            className={clsx('custom-tab-item', {
              'custom-tab-active': activeKey === item.key,
            })}
            onClick={() => onChange?.(item.key)}
          >
            {item.icon}
            {item.label}
          </div>
        ))}
      </div>
      {items.find((item) => item.key === activeKey)?.children}
    </div>
  );
};

export default CustomTabs;
