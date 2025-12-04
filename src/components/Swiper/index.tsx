import clsx from 'clsx';
import Item from './item';
import React from 'react';

type SwiperProps = {
  currentIndex: number;
  width?: number | string;
  height?: number | string;
  className?: string;
  children: React.ReactNode;
};

const Swiper = (props: SwiperProps) => {
  const { currentIndex = 0, width = '100%', height = 320, className, children } = props;

  const childrenCount = React.Children.count(children);

  const convertToCssValue = (value: number | string) => {
    if (typeof value === 'number') {
      return `${value}px`;
    }
    return value;
  };

  return (
    <div
      className={clsx(
        'web-swiper',
        className,
        `w-[${convertToCssValue(width)}] h-[${convertToCssValue(height)}]`,
      )}
    >
      <div className="relative w-full h-full">
        {React.Children.map(children, (child, index) => (
          <div
            className={clsx(
              'mb-[20px] md:mb-0 md:absolute w-full h-full transition-[transform,opacity] ease-in-out duration-500',
              { '!mb-0': index === childrenCount - 1 },
              `z-[${index === currentIndex ? childrenCount : index}]`,
              index === currentIndex
                ? 'opacity-100 translate-y-0 scale-100'
                : 'md:opacity-0 md:translate-y-1/2 md:scale-90 transition-none',
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
