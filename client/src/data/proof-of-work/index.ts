import { MiddlewareAPI } from "redux";
import { ActionsObservable } from "redux-observable";
import { Observable } from "rxjs/Rx";

import { Action, ActionTypes, incrementAttackerProgress, incrementValidProgress } from "./actions";
import { State } from "./model";
import { AppState } from "data";

const initialState: State = {
  isRunning: false,
  target: 130,
  stepSize: 1,
  attackers: 0,
  users: 18,
  attackerProgress: 20,
  validProgress: 20
};

export function reducer(state = initialState, action: Action): State {
  switch (action.type) {
    case ActionTypes.SetTarget:
      return { ...state, target: action.target };
    case ActionTypes.SetAttackers:
      const attackerProgress = state.attackers === 0 ? state.validProgress : state.attackerProgress;
      return { ...state, attackers: action.attackers, attackerProgress };
    case ActionTypes.Reset:
      return initialState;
    case ActionTypes.IncrementValidProgress:
      return { ...state, isRunning: true, validProgress: state.validProgress + 1 };
    case ActionTypes.IncrementAttackerProgress:
      return { ...state, isRunning: true, attackerProgress: state.attackerProgress + 1 };
    default:
      return state;
  }
}

export function epic(
  actions$: ActionsObservable<Action>,
  store: MiddlewareAPI<AppState>
): Observable<any> {
  return actions$
    .ofType(ActionTypes.Start, ActionTypes.SetAttackers, ActionTypes.SetUsers)
    .switchMap((action: Action) => {
      const { proofOfWork } = store.getState();
      if (!proofOfWork.isRunning && action.type !== ActionTypes.Start) {
        return [];
      }

      if (
        proofOfWork.target === proofOfWork.attackerProgress ||
        proofOfWork.target === proofOfWork.validProgress
      ) {
        return [];
      }

      const result = [];
      const { users, attackers } = proofOfWork;
      const valid = users - attackers;

      if (attackers > 0) {
        result.push(
          Observable.timer(0, Math.floor(500 * valid / attackers)).map(() =>
            incrementAttackerProgress()
          )
        );
      }

      if (valid > 0) {
        result.push(Observable.timer(0, 500).map(() => incrementValidProgress()));
      }

      return Observable.merge(...result).takeUntil(
        actions$.ofType(ActionTypes.Pause, ActionTypes.Reset)
      );
    });
}

export * from "./actions";
export * from "./model";
