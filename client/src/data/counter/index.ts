import { ActionsObservable } from "redux-observable";
import { Observable } from "rxjs/Observable";
import { delay, mergeMap } from "rxjs/operators";

import { TypedAction } from "data/common/types";

import { Action, ActionTypes, decrease, increase } from "./actions";
import { State } from "./model";

export const initialState: State = {
  counter: 0
};

export function reducer(state = initialState, action: Action): State {
  switch (action.type) {
    case ActionTypes.Increase:
      return { ...state, counter: state.counter + action.payload.amount };
    case ActionTypes.Decrease:
      return { ...state, counter: state.counter - action.payload.amount };
    default:
      return state;
  }
}

export function epic(actions$: ActionsObservable<Action>): Observable<TypedAction<any>> {
  return actions$.pipe(
    mergeMap(action => {
      switch (action.type) {
        case ActionTypes.IncreaseAsync:
          return [increase(action.payload.amount)];
        case ActionTypes.DecreaseAsync:
          return [decrease(action.payload.amount)];
        default:
          return [];
      }
    }),
    delay(1000)
  );
}

export * from "./model";
export { decrease, decreaseAsync, increase, increaseAsync } from "./actions";
