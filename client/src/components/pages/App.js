// @flow

import React, { Component } from "react";
import { Container, Divider, Menu } from "semantic-ui-react";
import { BrowserRouter, Link, Route, Redirect, Switch } from "react-router-dom";

import Chain from "./Chain";
import Dashboard from "./Dashboard";
import History from "./History";

import "./App.css";

class App extends Component<{}> {
  render() {
    return (
      <BrowserRouter>
        <Container>
          <Menu secondary>
            <Menu.Item as={Link} to="/dashboard">
              Dashboard
            </Menu.Item>
            <Menu.Item as={Link} to="/chain">
              Chain
            </Menu.Item>
            <Menu.Item as={Link} to="/history">
              Transaction History
            </Menu.Item>
          </Menu>
          <Divider />
          <Switch>
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/chain" component={Chain} />
            <Route path="/history" component={History} />
            <Redirect to="/dashboard" />
          </Switch>
        </Container>
      </BrowserRouter>
    );
  }
}

export default App;
