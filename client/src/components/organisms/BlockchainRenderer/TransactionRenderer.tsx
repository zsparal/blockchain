import React from "react";
import { Icon } from "antd";

import { getPublicKey } from "core/crypto";
import { Transaction, Client, isReward } from "data/blockchain";
import { Dict } from "data/common/types";

import "./TransactionRenderer.scss";

interface Props {
  transaction: Transaction;
  clients: Dict<Client>;
}

export default class TransactionRenderer extends React.PureComponent<Props> {
  render() {
    const { transaction } = this.props;

    return (
      <div>
        {isReward(transaction) ? (
          <>
            <div className="tx-reward">
              <span>Coinbase</span>
              <Icon type="arrow-right" />
              <span className="text-right">{this.mapName(transaction.recipient)}</span>
              <span className="text-right">${transaction.amount}</span>
            </div>
          </>
        ) : (
          <>
            <div className="tx-transfer">
              <span>{this.mapName(transaction.sender)}</span>
              <Icon type="arrow-right" />
              <span className="text-right">{this.mapName(transaction.recipient)}</span>
              <span className="text-right">${transaction.amount}</span>
            </div>
          </>
        )}
      </div>
    );
  }

  mapName(publicKey: string): string {
    if (publicKey === getPublicKey()) {
      return "Self";
    } else {
      return this.props.clients[publicKey].name;
    }
  }
}
