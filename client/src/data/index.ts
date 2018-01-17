import { combineReducers } from "redux";
import { combineEpics } from "redux-observable";

import * as blockchain from "./blockchain";
import * as counter from "./counter";
import * as proofOfWork from "./proof-of-work";

export interface AppState {
  counter: counter.State;
  proofOfWork: proofOfWork.State;
  blockchain: blockchain.State;
}

export const reducer = combineReducers<AppState>({
  counter: counter.reducer,
  proofOfWork: proofOfWork.reducer,
  blockchain: blockchain.reducer
});

export const epic = combineEpics(counter.epic, proofOfWork.epic, blockchain.epic);
