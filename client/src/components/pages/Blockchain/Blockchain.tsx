import React from "react";

import { AutoComplete, Divider, Input, InputNumber, List, Button, Layout } from "antd";

const { Content, Sider } = Layout;

import "./Blockchain.scss";
import {
  Blockchain as BlockchainData,
  Client,
  registerClient,
  tamper,
  sendCoins,
  mine,
  broadcast,
  Block,
  BlockError,
  makeTransaction
} from "data/blockchain";
import { connect } from "react-redux";
import { AppState } from "data";
import { bindActionCreators, Dispatch } from "redux";
import { BlockchainRenderer, TransactionRenderer } from "components/organisms";
import { Dict } from "data/common/types";

interface StoreProps {
  ownBlockchain?: BlockchainData;
  clients: Dict<Client>;
  lastError?: BlockError;
}

interface DispatchProps {
  mine(): void;
  broadcast(): void;
  sendCoins(): void;
  tamper(block: Block): void;
  makeTransaction(to: string, amount: number, from?: string): void;
  registerClient(name: string, port: number): void;
}

interface State {
  clientPort?: number;
  clientName?: string;

  transactionSender?: string;
  transactionRecipient?: string;
  transactionAmount?: number;
}

export class Blockchain extends React.PureComponent<StoreProps & DispatchProps, State> {
  clientOptions: Array<{ text: string; value: string }>;

  constructor(props: StoreProps & DispatchProps) {
    super(props);
    this.state = {};
  }

  componentWillReceiveProps(nextProps: StoreProps & DispatchProps) {
    this.clientOptions = Object.values(nextProps.clients).map(client => ({
      text: client.name,
      value: client.public_key
    }));
  }

  render() {
    const {
      broadcast,
      clients,
      registerClient,
      ownBlockchain,
      mine,
      sendCoins,
      tamper,
      lastError,
      makeTransaction
    } = this.props;
    const {
      clientPort,
      clientName,
      transactionAmount,
      transactionRecipient,
      transactionSender
    } = this.state;
    return (
      <Layout>
        <Sider className="blockchain-padding" width={300} style={{ backgroundColor: "#fff" }}>
          <h3>Clients</h3>
          <div className="control-row">
            <Input
              placeholder="Name"
              onChange={event => this.setState({ clientName: event.target.value })}
            />
            <Input
              className="client-port"
              placeholder="Port"
              onChange={event => this.setState({ clientPort: +event.target.value })}
            />
          </div>
          <Button
            className="accept-controlled"
            type="primary"
            onClick={() => registerClient(clientName!, clientPort!)}
          >
            Add
          </Button>
          <Divider />
          <h3>Transaction editor</h3>
          <AutoComplete
            className="spoof-sender"
            dataSource={this.clientOptions}
            placeholder="Spoof sender"
            onSelect={e => this.setState({ transactionSender: e.toString() })}
          />
          <AutoComplete
            className="select-recipient"
            placeholder="Recipient"
            dataSource={this.clientOptions}
            onSelect={e => this.setState({ transactionRecipient: e.toString() })}
          />
          <InputNumber
            className="input-amount"
            placeholder="Amount"
            onChange={e => this.setState({ transactionAmount: +e! })}
          />
          <Button
            className="send-transaction"
            type="primary"
            onClick={() =>
              makeTransaction(transactionRecipient!, transactionAmount!, transactionSender)
            }
          >
            Send
          </Button>
          <Divider />
          <h3>Pending transactions</h3>
          <List
            dataSource={(ownBlockchain || { transactions: [] }).transactions}
            renderItem={(tx: any) => <TransactionRenderer clients={clients} transaction={tx} />}
          />

          <Divider />
          <h3>Miner commands</h3>
          <div className="miner-commands">
            <Button className="miner-command" onClick={mine}>
              Mine
            </Button>
            <Button className="miner-command" onClick={broadcast}>
              Broadcast
            </Button>
            <Button className="miner-command" onClick={sendCoins}>
              Send coins
            </Button>
          </div>

          {lastError && (
            <>
              <Divider />
              <h3>Last error</h3>
              <pre>
                <b>Type:</b> {lastError.type}
              </pre>
              <pre>
                <b>Kind:</b> {lastError.kind}
              </pre>
            </>
          )}
        </Sider>
        <Content className="blockchain-padding blockchain-content">
          {ownBlockchain && (
            <div>
              <Divider>Own copy</Divider>
              <BlockchainRenderer blockchain={ownBlockchain} clients={clients} tamper={tamper} />
            </div>
          )}
          {Object.values(clients).map(client => (
            <div key={client.public_key} className="client-chain">
              <Divider>{client.name}</Divider>
              <BlockchainRenderer
                blockchain={client.blockchain}
                clients={clients}
                tamper={tamper}
              />
            </div>
          ))}
        </Content>
      </Layout>
    );
  }
}

export default connect<StoreProps, DispatchProps>(
  ({ blockchain }: AppState) => ({
    ownBlockchain: blockchain.ownBlockchain,
    clients: blockchain.clients,
    lastError: blockchain.lastError
  }),
  (dispatch: Dispatch<any>) =>
    bindActionCreators(
      { registerClient, mine, broadcast, sendCoins, tamper, makeTransaction },
      dispatch
    )
)(Blockchain);
