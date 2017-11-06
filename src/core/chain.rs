use std::mem;

use super::block::Block;
use super::transaction::{Transaction, Transfer};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Blockchain {
    pub blocks: Vec<Block>,

    #[serde(skip)]
    pub transactions: Vec<Transaction>,
}

impl Blockchain {
    pub fn new() -> Self {
        Blockchain {
            blocks: vec![Block::genesis()],
            transactions: vec![],
        }
    }

    pub fn len(&self) -> usize {
        self.blocks.len()
    }

    pub fn last_block(&self) -> &Block {
        self.blocks.last().expect("Zero-length chains are invalid")
    }

    pub fn new_transaction(&mut self, transfer: Transfer) -> u64 {
        self.transactions.push(Transaction::Transfer(transfer));
        self.last_block().index + 1
    }

    pub fn create_block(&mut self) -> Block {
        let transactions = mem::replace(&mut self.transactions, Vec::new());
        Block::new(self.last_block(), transactions)
    }

    pub fn add_block(&mut self, block: Block) -> Option<&Block> {
        self.blocks.push(block);
        Some(self.last_block())
    }
}
