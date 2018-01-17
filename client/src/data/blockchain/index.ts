import { Observable } from "rxjs/Observable";
import { MiddlewareAPI } from "redux";
import { ActionsObservable } from "redux-observable";

import * as uuid from "uuid";

import { AppState } from "data";

import {
  Action,
  ActionTypes,
  setClient,
  addBlock,
  setBlockchain,
  setOwnBlockchain,
  setError
} from "./actions";
import { State, MinerInformation, Blockchain } from "./model";
import { getPublicKey, sign, byteToHexString, hexStringToByte } from "core/crypto";

const initialState: State = {
  clients: {}
};

export function reducer(state = initialState, action: Action): State {
  switch (action.type) {
    case ActionTypes.SetClient:
      return {
        ...state,
        clients: {
          ...state.clients,
          [action.data.public_key]: {
            name: action.name,
            port: action.port,
            public_key: action.data.public_key,
            blockchain: action.data.blockchain
          }
        },
        ownBlockchain: state.ownBlockchain || action.data.blockchain
      };
    case ActionTypes.AddBlock:
      return {
        ...state,
        clients: {
          ...state.clients,
          [action.public_key]: {
            ...state.clients[action.public_key],
            blockchain: {
              transactions: [],
              blocks: [...state.clients[action.public_key].blockchain.blocks, action.block]
            }
          }
        },
        ownBlockchain: {
          ...state.ownBlockchain!,
          transactions: []
        }
      };
    case ActionTypes.SetOwnBlockchain:
      return {
        ...state,
        ownBlockchain: action.blockchain
      };
    case ActionTypes.SetBlockchain:
      return {
        ...state,
        clients: {
          ...state.clients,
          [action.public_key]: {
            ...state.clients[action.public_key],
            blockchain: action.blockchain
          }
        }
      };
    case ActionTypes.SetError:
      return { ...state, lastError: action.error };
    default:
      return state;
  }
}

const handleError = (event: { response: any }) => {
  if (event.response.error != null) {
    return setError({ ...event.response.error });
  }
  return undefined;
};

export function epic(
  actions$: ActionsObservable<Action>,
  store: MiddlewareAPI<AppState>
): Observable<any> {
  return actions$
    .ofType(
      ActionTypes.RegisterClient,
      ActionTypes.Mine,
      ActionTypes.SendCoins,
      ActionTypes.Tamper,
      ActionTypes.Broadcast,
      ActionTypes.MakeTransaction
    )
    .switchMap<any, any>((action: Action) => {
      const blockchain = store.getState().blockchain;
      const firstClient = Object.values(blockchain.clients)[0];
      switch (action.type) {
        case ActionTypes.RegisterClient:
          return Observable.ajax
            .getJSON(`http://localhost:${action.port}/client/me`)
            .map((response: MinerInformation) => setClient(action.name, action.port, response));
        case ActionTypes.Mine:
          return Observable.ajax.post(`http://localhost:${firstClient.port}/mine`).map(event => {
            return handleError(event) || addBlock(firstClient.public_key, event.response);
          });
        case ActionTypes.SendCoins:
          return Observable.ajax
            .post(
              `http://localhost:${firstClient.port}/transactions/send`,
              {
                public_key: getPublicKey()
              },
              { "Content-Type": "application/json" }
            )
            .map(event => handleError(event) || setOwnBlockchain(event.response));
        case ActionTypes.Broadcast:
          return Observable.concat(
            ...Object.values(blockchain.clients).map(client =>
              Observable.ajax
                .post(`http://localhost:${client.port}/chain/replace`, blockchain.ownBlockchain, {
                  "Content-Type": "application/json"
                })
                .map(
                  event => handleError(event) || setBlockchain(client.public_key, event.response)
                )
            )
          ).merge(
            Observable.ajax
              .getJSON<Blockchain>(`http://localhost:${firstClient.port}/chain`)
              .map(event => setOwnBlockchain(event))
          );
        case ActionTypes.Tamper:
          return Observable.ajax
            .post(`http://localhost:${firstClient.port}/chain/tamper`, action.block, {
              "Content-Type": "application/json"
            })
            .map(event => setBlockchain(firstClient.public_key, event.response));
        case ActionTypes.MakeTransaction:
          const message = {
            id: uuid.v4(),
            sender: action.from || getPublicKey(),
            recipient: action.to,
            amount: action.amount
          };
          return Observable.ajax
            .post(
              `http://localhost:${firstClient.port}/transactions/new`,
              { ...message, signature: sign(message) },
              { "Content-Type": "application/json" }
            )
            .map(event => handleError(event) || setOwnBlockchain(event.response));
        default:
          return [];
      }
    })
    .catch(err => console.error(err) || []);
}

export * from "./actions";
export * from "./model";
