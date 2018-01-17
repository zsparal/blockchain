import { Dict } from "core/dict";
import { hash } from "core/crypto";

export interface Reward {
  readonly type: "Reward";
  readonly id: string;
  readonly amount: number;
  readonly recipient: string;
}

export interface Transfer {
  readonly type: "Transfer";
  readonly id: string;
  readonly amount: number;
  readonly recipient: string;
  readonly sender: string;
  readonly signature: string;
}

export type Transaction = Reward | Transfer;

export interface Block {
  readonly index: number;
  readonly timestamp: number;
  readonly proof: number;
  readonly hash: string;
  readonly previous_hash: string;
  readonly transactions: Transaction[];
}

export interface Blockchain {
  readonly blocks: Block[];
  readonly transactions: Transaction[];
}

export interface Client {
  readonly name: string;
  readonly port: number;
  readonly public_key: string;
  readonly blockchain: Blockchain;
}

export interface MinerInformation {
  readonly public_key: string;
  readonly blockchain: Blockchain;
}

export interface BlockError {
  type: string;
  kind: string;
}

export interface State {
  clients: Dict<Client>;
  ownBlockchain?: Blockchain;
  lastError?: BlockError;
}

export function isReward(tx: Transaction): tx is Reward {
  return tx.type === "Reward";
}

export function hashBlock({ index, timestamp, proof, previous_hash, transactions }: Block): string {
  return hash({ index, timestamp, proof, previous_hash, transactions });
}
