import { useEffect, useRef } from 'react';

interface IPercentProps {
  percent: number;
}
export default function Percent(props: IPercentProps) {
  const { percent } = props;
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.style.transitionDuration = `${percent * 0.6}s`;
      setTimeout(() => {
        if (ref.current) {
          ref.current.style.width = `${percent * 100}%`;
        }
      }, 16);
    }
  }, [percent]);
  return <div className="vote-item-percent" ref={ref}></div>;
}
