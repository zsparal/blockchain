import React from "react";
import { render } from "react-dom";

import createBrowserHistory from "history/createBrowserHistory";

import configureStore from "core/store";

import App from "components";
import { ReactHotLoader } from "components/atoms";

import "antd/dist/antd.css";
import "./index.scss";

const history = createBrowserHistory();
const store = configureStore(history);
const root = document.querySelector("#root");

function renderRoot() {
  render(
    <ReactHotLoader>
      <App history={history} store={store} />
    </ReactHotLoader>,
    root
  );
}

renderRoot();
