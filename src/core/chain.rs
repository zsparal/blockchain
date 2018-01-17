use std::collections::{HashMap, HashSet};
use std::mem;

use super::block::Block;
use super::error::{BlockErrorKind, BlockchainError, ChainErrorKind, TransactionErrorKind};
use super::transaction::{Transaction, Transfer};

const PENDING_TRANSACTION_LIMIT: usize = 4;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Blockchain {
    pub blocks: Vec<Block>,

    #[serde(default)]
    pub transactions: Vec<Transaction>,
}

// Gets all transactions in the blockchain as one flat iterator
macro_rules! transactions {
    ($chain: ident) => { $chain.blocks.iter().flat_map(|x| x.transactions.iter()) };
    (with_pending $chain: ident) => { transactions!($chain).chain($chain.transactions.iter()) };
}

impl Blockchain {
    pub fn new() -> Self {
        Blockchain::default()
    }

    pub fn len(&self) -> usize {
        self.blocks.len()
    }

    pub fn is_empty(&self) -> bool {
        self.blocks.len() != 0
    }

    pub fn last_block(&self) -> &Block {
        self.blocks.last().expect("Zero-length chains are invalid")
    }

    pub fn validate(&self) -> Result<(), BlockchainError> {
        // TODO(gustorn): We should probably only iterate the transaction list once during the
        // validation process.
        self.validate_genesis_block()
            .and_then(|_| self.validate_blocks())
            .and_then(|_| self.validate_all_duplicate_transactions())
            .and_then(|_| self.validate_all_balances())
    }

    pub fn replace(&mut self, other: Blockchain) -> Result<&Blockchain, BlockchainError> {
        // We shouldn't replace our chain if the other one is longer. If they're equal
        // we hope that our version will win out in the end
        if other.len() <= self.len() {
            return Ok(self);
        }

        other.validate().and_then(move |_| {
            mem::replace(&mut self.blocks, other.blocks);

            // TODO(gustorn): This is horribly inefficient but it's the easiest way to keep
            // the relevant part of the pending transaction list
            let pending_transactions = mem::replace(&mut self.transactions, vec![]);
            for tx in pending_transactions {
                if let Transaction::Transfer(transfer) = tx {
                    let _ = self.new_transaction(transfer);
                }
            }
            Ok(&*self)
        })
    }

    pub fn new_transaction(&mut self, transfer: Transfer) -> Result<u64, BlockchainError> {
        transfer
            .validate()
            .and_then(|_| self.validate_duplicate_transaction(&transfer))
            .and_then(|_| self.validate_sender_balance(&transfer))
            .and_then(|_| self.validate_pending_transactions())
            .and_then(|_| {
                self.transactions.push(Transaction::from(transfer));
                Ok(self.last_block().index + 1)
            })
    }

    pub fn mine<M: AsRef<str>>(&mut self, miner: M) -> &Block {
        let mut transactions = mem::replace(&mut self.transactions, vec![]);
        transactions.insert(0, Transaction::reward(miner));

        let block = Block::next(self.last_block(), transactions);
        self.blocks.push(block);
        self.last_block()
    }

    pub fn tamper(&mut self, block: Block) {
        let block_index = block.index as usize;
        if block_index < self.len() {
            self.blocks[block_index] = block;
        }
    }

    // Checks if the genesis block is the same as the canonical one
    fn validate_genesis_block(&self) -> Result<(), BlockchainError> {
        if self.blocks[0] != Block::genesis() {
            Err(BlockchainError::block(
                0,
                BlockErrorKind::GenesisBlockMismatch,
            ))
        } else {
            Ok(())
        }
    }

    // Validates the whole blockchain with the exception of the genesis block
    fn validate_blocks(&self) -> Result<(), BlockchainError> {
        for i in 1..self.blocks.len() {
            self.blocks[i].validate(&self.blocks[i - 1])?;
        }
        Ok(())
    }

    // Checks if all user balances are positive or zero
    fn validate_all_balances(&self) -> Result<(), BlockchainError> {
        let mut balances = HashMap::new();
        for tx in transactions!(self) {
            if let Some(sender) = tx.sender() {
                let balance = balances.entry(sender).or_insert(0);
                *balance -= tx.amount();
            }
            let balance = balances.entry(tx.recipient()).or_insert(0);
            *balance += tx.amount();
        }

        if balances.values().any(|&balance| balance < 0) {
            Err(BlockchainError::chain(ChainErrorKind::InvalidBalance))
        } else {
            Ok(())
        }
    }

    // Checks whether there are *any* duplicate transactions in the blockchain
    fn validate_all_duplicate_transactions(&self) -> Result<(), BlockchainError> {
        let mut transactions = HashSet::new();
        for tx in transactions!(self) {
            if transactions.contains(&tx.id()) {
                return Err(BlockchainError::transaction(
                    *tx.id(),
                    TransactionErrorKind::DuplicateId,
                ));
            }
            transactions.insert(tx.id());
        }
        Ok(())
    }

    // Checks whether there is *at least one* duplicate transaction in the blockchain (which
    // matches the id of `transfer`).
    fn validate_duplicate_transaction(&self, transfer: &Transfer) -> Result<(), BlockchainError> {
        if transactions!(with_pending self).any(|tx| tx.id() == &transfer.id) {
            Err(BlockchainError::transaction(
                transfer.id,
                TransactionErrorKind::DuplicateId,
            ))
        } else {
            Ok(())
        }
    }

    // Checks if the sender can actually afford the transaction
    fn validate_sender_balance(&self, transfer: &Transfer) -> Result<(), BlockchainError> {
        let balance: i64 = transactions!(with_pending self)
            .map(|tx| tx.balance_change(&transfer.sender))
            .sum();

        if balance < transfer.amount {
            Err(BlockchainError::transaction(
                transfer.id,
                TransactionErrorKind::InsufficientBalance,
            ))
        } else {
            Ok(())
        }
    }

    // A single block only accepts a limited number of transactions before it needs to be mined
    fn validate_pending_transactions(&self) -> Result<(), BlockchainError> {
        if self.transactions.len() >= PENDING_TRANSACTION_LIMIT {
            Err(BlockchainError::chain(
                ChainErrorKind::PendingTransactionLimitReached,
            ))
        } else {
            Ok(())
        }
    }
}

impl Default for Blockchain {
    fn default() -> Self {
        Self {
            blocks: vec![Block::genesis()],
            transactions: vec![],
        }
    }
}
