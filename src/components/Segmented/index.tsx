import React, { useState, useEffect, useRef } from 'react';

import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';

interface IToggleSlider {
  value?: string;
  options: string[];
  className?: string;
  itemClassName?: string;
  activeItemClassName?: string;
  onChange?: (value: string) => void;
}

const Segmented = ({
  value,
  options = [],
  className,
  itemClassName,
  activeItemClassName,
  onChange,
}: IToggleSlider) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    // Initialize refs array with items count
    itemRefs.current = itemRefs.current.slice(0, options.length);
  }, [options.length]);

  const handleClick = (index: number) => {
    setActiveIndex(index);
    onChange?.(options[index]);
  };

  useEffect(() => {
    const index = options.findIndex((option) => option === value);
    setActiveIndex(index);
  }, [options, value]);

  return (
    <div className="inline-block p-[2px] bg-darkBg rounded-[6px]">
      <div
        ref={(ref) => (containerRef.current = ref)}
        className={clsx('relative h-full flex items-center overflow-hidden', className)}
      >
        <AnimatePresence>
          <motion.div
            data-testid="selector-bg"
            className={clsx(
              'absolute top-0 bg-mainColor px-[3px] rounded-[4px] h-[28px]',
              activeItemClassName,
            )}
            initial={false}
            animate={{
              x: itemRefs.current[activeIndex]?.offsetLeft || 4,
              width: itemRefs.current[activeIndex]?.offsetWidth || `${100 / options.length}%`,
            }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </AnimatePresence>
        <div className="relative flex w-full h-full px-[4px] z-10">
          {options.map((item, index) => (
            <div
              key={index}
              className={clsx(
                'flex w-1/2 items-center justify-center px-3 h-7 cursor-pointer',
                itemClassName,
              )}
              onClick={() => handleClick(index)}
              ref={(el) => (itemRefs.current[index] = el)}
            >
              <span
                className={clsx(
                  'text-descM10 font-Montserrat text-white flex items-center h-full',
                  {
                    'font-bold': activeIndex === index,
                  },
                )}
              >
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Segmented;
