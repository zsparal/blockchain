import React from "react";
import { Blockchain, Client, Block } from "data/blockchain";

import BlockRenderer from "./BlockRenderer";
import "./BlockchainRenderer.scss";
import { Dict } from "data/common/types";

interface Props {
  blockchain: Blockchain;
  clients: Dict<Client>;
  tamper(block: Block): void;
}

export default class BlockchainRenderer extends React.PureComponent<Props> {
  render() {
    const { blockchain, clients, tamper } = this.props;
    return (
      <div className="blockchain-renderer">
        {blockchain.blocks.map((block, index) => (
          <BlockRenderer
            key={block.hash}
            block={block}
            clients={clients}
            tamper={tamper}
            previousBlock={blockchain.blocks[index - 1]}
          />
        ))}
      </div>
    );
  }
}
