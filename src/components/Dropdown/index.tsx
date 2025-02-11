import React, { useState, useRef, useEffect } from 'react';
import './index.css';

interface DropdownItem {
  key: string;
  label: React.ReactNode | string;
}

type Placement = 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight';

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  placement?: Placement;
  onSelect?: (key: string) => void;
}

const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  placement = 'bottomLeft',
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMouseEnter = () => {
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    setIsOpen(false);
  };

  const handleItemClick = (key: string) => {
    onSelect?.(key);
    setIsOpen(false);
  };

  useEffect(() => {
    if (isOpen && dropdownRef.current && menuRef.current) {
      const triggerRect = dropdownRef.current.getBoundingClientRect();
      const menuRect = menuRef.current.getBoundingClientRect();

      switch (placement) {
        case 'bottomLeft':
          menuRef.current.style.top = `${triggerRect.bottom}px`;
          menuRef.current.style.left = `${triggerRect.left}px`;
          break;
        case 'bottomRight':
          menuRef.current.style.top = `${triggerRect.bottom}px`;
          menuRef.current.style.right = `${window.innerWidth - triggerRect.right}px`;
          break;
        case 'topLeft':
          menuRef.current.style.bottom = `${window.innerHeight - triggerRect.top}px`;
          menuRef.current.style.left = `${triggerRect.left}px`;
          break;
        case 'topRight':
          menuRef.current.style.bottom = `${window.innerHeight - triggerRect.top}px`;
          menuRef.current.style.right = `${window.innerWidth - triggerRect.right}px`;
          break;
        default:
          break;
      }
    }
  }, [isOpen, placement]);

  return (
    <div
      className="dropdown"
      ref={dropdownRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="dropdown-trigger">{trigger}</div>

      {isOpen && items.length > 0 && (
        <div className="dropdown-menu" ref={menuRef}>
          {items.map((item) => (
            <div key={item.key} className="dropdown-item" onClick={() => handleItemClick(item.key)}>
              <span className="text-mainColor font-Montserrat">{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
