import React from 'react';
import clsx from 'clsx';

type ColSpanType = number | null;

interface ColSize {
  xs?: ColSpanType;
  sm?: ColSpanType;
  md?: ColSpanType;
  lg?: ColSpanType;
  xl?: ColSpanType;
}

interface ColProps extends ColSize {
  children: React.ReactNode;
  className?: string;
  span?: number;
  style?: React.CSSProperties;
}

const Col: React.FC<ColProps> = ({ children, className, span = 24, xs, sm, md, lg, xl, style }) => {
  const getResponsiveClass = () => ({
    // 默认
    'w-full': span === 24,
    'w-1/2': span === 12,
    'w-1/3': span === 8,
    'w-1/4': span === 6,

    // xs: <640px
    'xs:w-full': xs === 24,
    'xs:w-1/2': xs === 12,
    'xs:w-1/3': xs === 8,
    'xs:w-1/4': xs === 6,

    // sm: ≥640px
    'sm:w-full': sm === 24,
    'sm:w-1/2': sm === 12,
    'sm:w-1/3': sm === 8,
    'sm:w-1/4': sm === 6,

    // md: ≥768px
    'md:w-full': md === 24,
    'md:w-1/2': md === 12,
    'md:w-1/3': md === 8,
    'md:w-1/4': md === 6,

    // lg: ≥1024px
    'lg:w-full': lg === 24,
    'lg:w-1/2': lg === 12,
    'lg:w-1/3': lg === 8,
    'lg:w-1/4': lg === 6,

    // xl: ≥1280px
    'xl:w-full': xl === 24,
    'xl:w-1/2': xl === 12,
    'xl:w-1/3': xl === 8,
    'xl:w-1/4': xl === 6,
  });

  return (
    <div className={clsx('box-border', getResponsiveClass(), className)} style={style}>
      {children}
    </div>
  );
};

export default Col;
