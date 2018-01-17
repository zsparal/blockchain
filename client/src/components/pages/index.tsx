import React from "react";
import { Provider } from "react-redux";
import { Link, Redirect, Route, Switch } from "react-router-dom";
import { Store } from "redux";

import { Layout, Menu } from "antd";
import { ConnectedRouter } from "connected-react-router";
import { History } from "history";

import { AppState } from "data";

import { Blockchain } from "./Blockchain";
import { Visualizations } from "./Visualizations";
import "./index.scss";

const { Header, Content } = Layout;

interface Props {
  history: History;
  store: Store<AppState>;
}

const menuStyle = { lineHeight: "64px" };

export default class App extends React.Component<Props> {
  render() {
    const { history, store } = this.props;
    return (
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <Layout className="layout">
            <Header>
              <Menu
                className="menu"
                theme="dark"
                mode="horizontal"
                defaultSelectedKeys={["1"]}
                style={menuStyle}
              >
                <Menu.Item key={1}>
                  <Link className="nav-text" to="/blockchain">
                    Blockchain
                  </Link>
                </Menu.Item>
                <Menu.Item key={2}>
                  <Link className="nav-text" to="/visualizations">
                    Visualizations
                  </Link>
                </Menu.Item>
              </Menu>
            </Header>
            <Content className="main-content">
              <Switch>
                <Route path="/blockchain" component={Blockchain} />
                <Route path="/visualizations" component={Visualizations} />
                <Redirect exact from="/" to="/blockchain" />
              </Switch>
            </Content>
          </Layout>
        </ConnectedRouter>
      </Provider>
    );
  }
}
