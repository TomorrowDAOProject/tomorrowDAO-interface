export enum EVoteOption {
  APPROVED = 0,
  REJECTED = 1,
  ABSTAINED = 2,
}
export const EVoteOptionLabel: Record<EVoteOption, string> = {
  [EVoteOption.APPROVED]: 'Approved',
  [EVoteOption.REJECTED]: 'Reject',
  [EVoteOption.ABSTAINED]: 'Abstain',
};
