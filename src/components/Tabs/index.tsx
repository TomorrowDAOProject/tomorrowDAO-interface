import React from 'react';
import './index.css';

interface TabItem {
  key: string;
  label: string | React.ReactNode;
  children: React.ReactNode;
}

interface TabsProps {
  activeKey: string;
  items: TabItem[];
  onChange: (key: string) => void;
}

const Tabs: React.FC<TabsProps> = ({ activeKey, items, onChange }) => {
  return (
    <div className="tabs-container">
      <div className="tabs-header-box">
        <div className="tabs-header">
          {items.map((item) => (
            <div
              key={item.key}
              className={`tab-item ${activeKey === item.key ? 'active' : ''}`}
              onClick={() => onChange(item.key)}
            >
              {item.label}
            </div>
          ))}
        </div>
      </div>
      <div className="tabs-content">{items.find((item) => item.key === activeKey)?.children}</div>
    </div>
  );
};

export default Tabs;
