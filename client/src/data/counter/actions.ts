import { TypedAction } from "data/common/types";

export const enum ActionTypes {
  Increase = "counter/Increase",
  Decrease = "counter/Decrease",
  IncreaseAsync = "counter/IncreaseAsync",
  DecreaseAsync = "counter/DecreaseAsync"
}

export interface IncreaseAction extends TypedAction<ActionTypes.Increase> {
  payload: { amount: number };
}

export interface DecreaseAction extends TypedAction<ActionTypes.Decrease> {
  payload: { amount: number };
}

export interface IncreaseAsyncAction extends TypedAction<ActionTypes.IncreaseAsync> {
  payload: { amount: number };
}

export interface DecreaseActionAsync extends TypedAction<ActionTypes.DecreaseAsync> {
  payload: { amount: number };
}

export type Action = IncreaseAction | DecreaseAction | IncreaseAsyncAction | DecreaseActionAsync;

export function increase(amount: number): Action {
  return { type: ActionTypes.Increase, payload: { amount } };
}

export function decrease(amount: number): Action {
  return { type: ActionTypes.Decrease, payload: { amount } };
}

export function increaseAsync(amount: number): Action {
  return { type: ActionTypes.IncreaseAsync, payload: { amount } };
}

export function decreaseAsync(amount: number): Action {
  return { type: ActionTypes.DecreaseAsync, payload: { amount } };
}
