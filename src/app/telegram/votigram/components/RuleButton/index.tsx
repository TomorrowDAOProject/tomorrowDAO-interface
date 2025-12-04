import { InfoCircleOutlined } from '@aelf-design/icons';
import './index.css';

export interface IRuleButtonProps {
  onClick?: () => void;
  className?: string;
}
export default function RuleButton(props: IRuleButtonProps) {
  return (
    <div className={`votigram-rules-wrap flex-center ${props.className}`} onClick={props.onClick}>
      <InfoCircleOutlined />
      <span className="rule-text">Rules</span>
    </div>
  );
}
