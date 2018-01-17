import React from "react";
import { Button, Collapse, Input, Form, Card } from "antd";

import { Block, Client, hashBlock } from "data/blockchain";

import "./BlockRenderer.scss";
import { Dict } from "data/common/types";
import TransactionRenderer from "components/organisms/BlockchainRenderer/TransactionRenderer";
import { hash } from "core/crypto";

interface Props {
  previousBlock?: Block;
  block: Block;
  clients: Dict<Client>;
  tamper(block: Block): void;
}

interface BlockState {
  index?: number;
  hash?: string;
  previous_hash?: string;
  timestamp?: number;
  proof?: number;
}

const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 14 }
};

export default class BlockRenderer extends React.PureComponent<Props, BlockState> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  makeTampered() {
    const { block } = this.props;

    const { index, previous_hash, timestamp, proof } = this.state;
    return {
      index: index != null ? index : block.index,
      timestamp: timestamp || block.timestamp,
      proof: proof || block.proof,
      previous_hash: previous_hash || block.previous_hash,
      transactions: block.transactions
    };
  }

  isValid() {
    const { block, previousBlock } = this.props;
    if (block && this.state && block.index === 0) {
      return true;
    }

    const newHash = hash(this.makeTampered());
    return (
      block.previous_hash === previousBlock!.hash &&
      (previousBlock!.index === 0 || block.previous_hash === hashBlock(previousBlock!)) &&
      newHash.startsWith("0000") &&
      block.hash === newHash
    );
  }

  render() {
    const { block, clients, previousBlock, tamper } = this.props;
    return (
      <Card className="block" style={{ borderColor: this.isValid() ? "inherit" : "red" }}>
        <Button
          style={{ width: "100%", marginBottom: "6px" }}
          onClick={() => tamper({ ...this.makeTampered(), hash: block.hash })}
        >
          Tamper
        </Button>
        <Form>
          <Form.Item label="Index" {...formItemLayout}>
            <Input
              defaultValue={block.index}
              onChange={e => this.setState({ index: +e.target.value })}
            />
          </Form.Item>
          <Form.Item
            label="Prev. hash"
            {...formItemLayout}
            validateStatus={
              !previousBlock || previousBlock.hash === block.previous_hash ? "success" : "error"
            }
          >
            <Input
              defaultValue={block.previous_hash}
              onChange={e => this.setState({ previous_hash: e.target.value })}
            />
          </Form.Item>
          <Form.Item label="Timestamp" {...formItemLayout}>
            <Input
              defaultValue={block.timestamp}
              onChange={e => this.setState({ timestamp: +e.target.value })}
            />
          </Form.Item>
          <Form.Item label="Proof" {...formItemLayout}>
            <Input
              defaultValue={block.proof}
              onChange={e => this.setState({ proof: +e.target.value })}
            />
          </Form.Item>
          <Form.Item label="Hash" {...formItemLayout}>
            <Input
              defaultValue={block.hash}
              onChange={e => this.setState({ hash: e.target.value })}
            />
          </Form.Item>
        </Form>
        <Collapse className="transaction-panel">
          <Collapse.Panel header={`Transactions (${block.transactions.length})`} key="1">
            {block.transactions.map(tx => (
              <TransactionRenderer key={tx.id} transaction={tx} clients={clients} />
            ))}
          </Collapse.Panel>
        </Collapse>
      </Card>
    );
  }
}
