import { SortOrder } from 'antd/es/table/interface';
import './index.css';

interface IProps {
  fill: string;
}
const defaultColor = '#919191';
const activeColor = '#1A1A1A';

const UpIcon = (props: IProps) => (
  <svg width="6" height="4" viewBox="0 0 6 4" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M2.52197 0.414414C2.78295 0.143193 3.21705 0.143193 3.47803 0.414415L5.90665 2.93831C6.10943 3.14904 5.96009 3.50001 5.66764 3.50001L0.332363 3.50001C0.0399145 3.50001 -0.10943 3.14904 0.0933465 2.93831L2.52197 0.414414Z"
      fill={props.fill}
    />
  </svg>
);
const DownIcon = (props: IProps) => (
  <svg width="6" height="4" viewBox="0 0 6 4" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M2.52197 3.58559C2.78295 3.85681 3.21705 3.85681 3.47803 3.58559L5.90665 1.06169C6.10943 0.850957 5.96009 0.499993 5.66764 0.499993L0.332363 0.499993C0.0399145 0.499993 -0.10943 0.850957 0.0933465 1.06169L2.52197 3.58559Z"
      fill={props.fill}
    />
  </svg>
);
export const sortIcon = ({ sortOrder }: { sortOrder: SortOrder }) => {
  if (sortOrder === 'ascend') {
    return (
      <div className="custom-table-icon-wrap">
        <UpIcon fill={activeColor} />
        <DownIcon fill={defaultColor} />
      </div>
    );
  }
  if (sortOrder === 'descend') {
    return (
      <div className="custom-table-icon-wrap">
        <UpIcon fill={defaultColor} />
        <DownIcon fill={activeColor} />
      </div>
    );
  }
  return (
    <div className="custom-table-icon-wrap">
      <UpIcon fill={defaultColor} />
      <DownIcon fill={defaultColor} />
    </div>
  );
};
