export interface IWsPointsItem {
  id: string;
  proposalId: string;
  alias: string;
  points: number;
  pointsPercent: number;
}

export interface IPointsListRes {
  pointsList: IWsPointsItem[];
}
