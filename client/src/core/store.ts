import { connectRouter, routerMiddleware } from "connected-react-router";
import { History } from "history";
import { Reducer, applyMiddleware, createStore } from "redux";
import { composeWithDevTools } from "redux-devtools-extension/developmentOnly";
import { createEpicMiddleware } from "redux-observable";

import { AppState, epic, reducer } from "data";

export default (history: History, initialState?: AppState) => {
  const rootReducer: Reducer<AppState> = connectRouter(history)(reducer);
  const epicMiddleware = createEpicMiddleware(epic);

  const enhancers = composeWithDevTools(applyMiddleware(routerMiddleware(history), epicMiddleware));

  const store = initialState
    ? createStore<AppState>(rootReducer, initialState, enhancers)
    : createStore<AppState>(rootReducer, enhancers);

  if (process.env.NODE_ENV === "development" && module.hot) {
    module.hot.accept(["data"], () => {
      store.replaceReducer(connectRouter(history)(reducer));
      epicMiddleware.replaceEpic(epic);
    });
  }

  return store;
};
