// @flow

import React, { Component } from "react";

import axios from "axios";
import { Button, Grid, Image, Input, List } from "semantic-ui-react";
import v4 from "uuid/v4";

import { getIcon } from "../../../common/icon-cache";
import {
  toHexString,
  generateSignature,
  getKeyPair
} from "../../../common/crypto";

type Client = {
  name: string,
  public_key: string
};

type State = {
  serverUrl: string,
  clients: Client[],
  recipient: string,
  amount: number
};

export default class Dashbboard extends Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = { clients: [], serverUrl: "", recipient: "", amount: -1 };
  }

  render() {
    const { clients, recipient } = this.state;
    return (
      <Grid>
        <Grid.Column width={5}>
          <Input action placeholder="Server URL" onChange={this.changeServer}>
            <input />
            <Button onClick={this.onClick}>Register</Button>
          </Input>
          <List relaxed="very" divided>
            {clients.map(client => (
              <List.Item key={client.public_key}>
                <Image avatar src={getIcon(client.public_key)} />
                <List.Content>
                  <List.Header as="a" onClick={() => this.clickClient(client)}>
                    {client.name || "Anonymous"}
                  </List.Header>
                  <List.Description>
                    {client.public_key.slice(0, client.public_key.length / 2)}
                  </List.Description>
                  <List.Description>
                    {client.public_key.slice(client.public_key.length / 2)}
                  </List.Description>
                </List.Content>
              </List.Item>
            ))}
          </List>
        </Grid.Column>
        <Grid.Column width={10}>
          <Input fluid readOnly value={recipient} placeholder="Recipient" />
          <br />
          <Input fluid placeholder="Amount" onChange={this.changeAmount} />
          <br />
          <Button floated="right" onClick={this.sendTransaction}>
            Send
          </Button>
        </Grid.Column>
      </Grid>
    );
  }

  clickClient = (client: Client) => {
    this.setState({ recipient: client.public_key });
  };

  onClick = () => {
    const url = this.state.serverUrl;
    const public_key = toHexString(getKeyPair().publicKey);
    axios
      .post(`${url}/clients/register`, { public_key })
      .then(() => axios.get(`${url}/clients`))
      .then(clients => this.setState({ ...clients.data }));
  };

  sendTransaction = () => {
    const id = v4();
    const { amount, recipient, serverUrl } = this.state;
    const { publicKey, secretKey } = getKeyPair();
    const sender = toHexString(publicKey);
    const signature = generateSignature(secretKey, {
      id,
      sender,
      recipient,
      amount
    });
    axios.post(`${serverUrl}/transactions/new`, {
      id,
      sender,
      recipient,
      amount,
      signature
    });
  };

  changeAmount = (event: SyntheticInputEvent<*>) => {
    this.setState({ amount: +event.target.value });
  };

  changeServer = (event: SyntheticInputEvent<*>) => {
    this.setState({ serverUrl: event.target.value });
  };
}
