export enum TransferStatus {
  UnsupportedToken = 0,
  AlreadyClaimed = 1,
  TransferInProgress = 2,
  TransferFailed = 9,
}

export enum VoteStatus {
  NotVoted = 0,
  Voting = 1,
  Voted = 2,
  Failed = 9,
}
