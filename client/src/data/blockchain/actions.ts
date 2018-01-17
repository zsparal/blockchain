import { TypedAction } from "data/common/types";
import { Blockchain, MinerInformation, Block, BlockError } from "data/blockchain";

export const enum ActionTypes {
  RegisterClient = "blockchain/RegisterClient",
  SetClient = "blockchain/SetClient",
  Mine = "blockchain/Mine",
  Broadcast = "blockchain/Broadcast",
  SendCoins = "blockchain/SendCoins",
  Tamper = "blockchain/Tamper",
  SetBlockchain = "blockchain/Set",
  SetOwnBlockchain = "blockchain/SetOwn",
  AddBlock = "blockchain/AddBlock",
  SetError = "blockchain/SetError",
  MakeTransaction = "blockchain/MakeTransaction"
}

export interface RegisterClient extends TypedAction<ActionTypes.RegisterClient> {
  readonly name: string;
  readonly port: number;
}

export interface SetClient extends TypedAction<ActionTypes.SetClient> {
  readonly name: string;
  readonly port: number;
  readonly data: {
    public_key: string;
    blockchain: Blockchain;
  };
}

export interface Mine extends TypedAction<ActionTypes.Mine> {}

export interface Broadcast extends TypedAction<ActionTypes.Broadcast> {}

export interface SendCoins extends TypedAction<ActionTypes.SendCoins> {}

export interface Tamper extends TypedAction<ActionTypes.Tamper> {
  readonly block: Block;
}

export interface SetBlockchain extends TypedAction<ActionTypes.SetBlockchain> {
  readonly public_key: string;
  readonly blockchain: Blockchain;
}

export interface SetOwnBlockchain extends TypedAction<ActionTypes.SetOwnBlockchain> {
  readonly blockchain: Blockchain;
}

export interface AddBlock extends TypedAction<ActionTypes.AddBlock> {
  readonly block: Block;
  readonly public_key: string;
}

export interface SetError extends TypedAction<ActionTypes.SetError> {
  readonly error: BlockError;
}

export interface MakeTransaction extends TypedAction<ActionTypes.MakeTransaction> {
  readonly from?: string;
  readonly to: string;
  readonly amount: number;
}

export type Action =
  | RegisterClient
  | SetClient
  | Mine
  | Broadcast
  | SendCoins
  | Tamper
  | SetBlockchain
  | SetOwnBlockchain
  | AddBlock
  | SetError
  | MakeTransaction;

export const registerClient = (name: string, port: number): Action => ({
  type: ActionTypes.RegisterClient,
  name,
  port
});

export const setClient = (name: string, port: number, data: MinerInformation): Action => ({
  type: ActionTypes.SetClient,
  name,
  port,
  data
});

export const mine = (): Action => ({
  type: ActionTypes.Mine
});

export const broadcast = (): Action => ({
  type: ActionTypes.Broadcast
});

export const sendCoins = (): Action => ({
  type: ActionTypes.SendCoins
});

export const tamper = (block: Block): Action => ({
  type: ActionTypes.Tamper,
  block
});

export const setBlockchain = (public_key: string, blockchain: Blockchain): Action => ({
  type: ActionTypes.SetBlockchain,
  public_key,
  blockchain
});

export const setOwnBlockchain = (blockchain: Blockchain): Action => ({
  type: ActionTypes.SetOwnBlockchain,
  blockchain
});

export const addBlock = (public_key: string, block: Block): Action => ({
  type: ActionTypes.AddBlock,
  public_key,
  block
});

export const setError = (error: BlockError): Action => ({
  type: ActionTypes.SetError,
  error
});

export const makeTransaction = (to: string, amount: number, from?: string): Action => ({
  type: ActionTypes.MakeTransaction,
  to,
  from,
  amount
});
