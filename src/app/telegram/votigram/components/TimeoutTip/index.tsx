import { CSSProperties } from 'react';
import './index.css';

interface ITimeoutTipProps {
  style: CSSProperties;
}
export default function TimeoutTip(props: ITimeoutTipProps) {
  const { style } = props;
  return (
    <div className="timeout-tip-wrap" style={style}>
      <img src="/images/tg/rocket.png" alt="" width={240} />
      <p className="timeout-tip-text">Blockchain network congestion, please try again later.</p>
    </div>
  );
}
