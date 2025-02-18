import React from 'react';
import clsx from 'clsx';

interface RowProps {
  children: React.ReactNode;
  className?: string;
  gutter?: number | [number, number];
}

interface ChildProps {
  style?: React.CSSProperties;
}

const Row: React.FC<RowProps> = ({ children, className, gutter = 0 }) => {
  const [horizontalGap, verticalGap] = Array.isArray(gutter) ? gutter : [gutter, 0];
  const margin = horizontalGap ? -horizontalGap / 2 : 0;

  return (
    <div
      className={clsx('flex flex-wrap', className)}
      style={{ margin: `${-verticalGap / 2}px ${margin}px` }}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement<ChildProps>(child)) {
          return React.cloneElement(child, {
            style: {
              paddingLeft: horizontalGap ? horizontalGap / 2 : 0,
              paddingRight: horizontalGap ? horizontalGap / 2 : 0,
              paddingTop: verticalGap ? verticalGap / 2 : 0,
              paddingBottom: verticalGap ? verticalGap / 2 : 0,
              ...child.props.style,
            },
          });
        }
        return child;
      })}
    </div>
  );
};

export default Row;
