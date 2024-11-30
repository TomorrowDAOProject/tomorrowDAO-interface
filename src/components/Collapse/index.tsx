import { Collapse, CollapseProps } from 'antd';
import './index.css';

const WebCollapse = (props: CollapseProps) => {
  const { items } = props;
  return <Collapse items={items} {...props} className="web-collapse" />;
};

export default WebCollapse;
