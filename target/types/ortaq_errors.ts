
export const OrtaqErrorCode = {
  InvalidGoal: 6000,
  InvalidDuration: 6001,
  InvalidAmount: 6002,
  PoolNotActive: 6003,
  DeadlinePassed: 6004,
  DeadlineNotPassed: 6005,
  GoalNotReached: 6006,
  GoalWasReached: 6007,
  AlreadyRefunded: 6008,
  NothingToRefund: 6009,
  WrongOwner: 6010,
  WrongMint: 6011,
  Overflow: 6012
};

export type OrtaqErrorName = keyof typeof OrtaqErrorCode;
