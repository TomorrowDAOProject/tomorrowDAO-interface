import { IPaginationProps } from 'aelf-design';

export enum TVotingOption {
  Approved = 'Approved',
  Rejected = 'Rejected',
  Abstained = 'Abstained',
}

export interface ITableProps {
  pagination: IPaginationProps;
}
