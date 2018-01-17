import { TypedAction } from "data/common/types";

export const enum ActionTypes {
  Start = "proof-of-work/Start",
  Pause = "proof-of-work/Pause",
  Reset = "proof-of-work/Reset",
  SetTarget = "proof-of-work/SetTarget",
  SetStepSize = "proof-of-work/SetStepSize",
  SetAttackers = "proof-of-work/SetAttackers",
  IncrementAttackerProgress = "proof-of-work/IncrementAttackerProgress",
  SetUsers = "proof-of-work/SetUsers",
  IncrementValidProgress = "proof-of-work/IncrementValidProgress"
}

export interface Start extends TypedAction<ActionTypes.Start> {}
export interface Pause extends TypedAction<ActionTypes.Pause> {}
export interface Reset extends TypedAction<ActionTypes.Reset> {}

export interface SetTarget extends TypedAction<ActionTypes.SetTarget> {
  readonly target: number;
}

export interface SetStepSize extends TypedAction<ActionTypes.SetStepSize> {
  readonly stepSize: number;
}

export interface SetAttackers extends TypedAction<ActionTypes.SetAttackers> {
  readonly attackers: number;
}

export interface IncrementAttackerProgress
  extends TypedAction<ActionTypes.IncrementAttackerProgress> {}

export interface SetUsers extends TypedAction<ActionTypes.SetUsers> {
  readonly users: number;
}

export interface IncrementValidProgress extends TypedAction<ActionTypes.IncrementValidProgress> {}

export const start = (): Action => ({
  type: ActionTypes.Start
});

export const pause = (): Action => ({
  type: ActionTypes.Pause
});

export const reset = (): Action => ({
  type: ActionTypes.Reset
});

export const setTarget = (target: number): Action => ({
  type: ActionTypes.SetTarget,
  target
});

export const setStepSize = (stepSize: number): Action => ({
  type: ActionTypes.SetStepSize,
  stepSize
});

export const setAttackers = (attackers: number): Action => ({
  type: ActionTypes.SetAttackers,
  attackers
});

export const incrementAttackerProgress = (): Action => ({
  type: ActionTypes.IncrementAttackerProgress
});

export const setUsers = (users: number): Action => ({
  type: ActionTypes.SetUsers,
  users
});

export const incrementValidProgress = (): Action => ({
  type: ActionTypes.IncrementValidProgress
});

export type Action =
  | Start
  | Pause
  | Reset
  | SetTarget
  | SetStepSize
  | SetAttackers
  | IncrementAttackerProgress
  | SetUsers
  | IncrementValidProgress;
