import clsx from 'clsx';
import Item from './item';
import React, { useState } from 'react';
import { throttle } from 'lodash-es';

type SwiperProps = {
  width?: number | string;
  height?: number | string;
  style?: React.CSSProperties;
  className?: string;
  children: React.ReactNode;
};

const Swiper = (props: SwiperProps) => {
  const { width = '100%', height = 320, style, className, children } = props;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const childrenCount = React.Children.count(children);

  const handleWheel = (event: { deltaY: number }) => {
    if (!isHovering) return;
    console.log(event.deltaY);

    if (event.deltaY < 0) {
      handleScrollUp();
    } else {
      handleScrollDown();
    }
  };

  const handleScrollUp = throttle(() => {
    currentIndex !== 0 && setCurrentIndex(currentIndex - 1);
  }, 500);

  const handleScrollDown = throttle(() => {
    currentIndex !== childrenCount - 1 && setCurrentIndex(currentIndex + 1);
  }, 500);

  const convertToCssValue = (value: number | string) => {
    if (typeof value === 'number') {
      return `${value}px`;
    }
    return value;
  };

  return (
    <div
      className={clsx('web-swiper', className)}
      style={{ ...style, width: convertToCssValue(width), minHeight: convertToCssValue(height) }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onWheel={handleWheel}
    >
      <div className="relative w-full h-full">
        {React.Children.map(children, (child, index) => (
          <div
            className={clsx(
              'absolute w-full h-full transition-[transform,opacity] ease-in-out duration-500',
              `z-[${index === currentIndex ? childrenCount : index}]`,
              index === currentIndex
                ? 'opacity-100 translate-y-0 scale-100'
                : 'opacity-0 translate-y-1/2 scale-90 transition-none',
            )}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
};

Swiper.Item = Item;

export default Swiper;
