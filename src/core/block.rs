use chrono;
use rand::{self, Rng};

use super::Verify;
use super::{BlockErrorKind, BlockchainError};
use super::transaction::Transaction;

#[derive(Debug, PartialEq, Eq, Clone, Serialize, Deserialize)]
pub struct Block {
    pub index: u64,
    pub timestamp: i64,
    pub proof: u32,
    pub hash: String,
    pub previous_hash: Option<String>,
    pub transactions: Vec<Transaction>,
}

#[derive(Debug, Serialize)]
pub struct VerifiedBlock<'a> {
    pub index: u64,
    pub timestamp: i64,
    pub proof: u32,
    pub previous_hash: Option<&'a str>,
    pub transactions: &'a [Transaction],
}

impl Block {
    // The first block of the blockchain. It's a special case because it doesn't have a valid
    // proof or hash (to avoid the need to recompute these whenever a blockchain is validated)
    pub fn genesis() -> Self {
        Self {
            index: 0,
            timestamp: 0,
            transactions: vec![],
            proof: 0,
            hash: String::new(),
            previous_hash: None,
        }
    }

    // Creates the next block in the chain with the given list of transactions. This also calculates
    // the valid proof and hash
    pub fn next(previous: &Block, transactions: Vec<Transaction>) -> Self {
        let mut block = Self {
            index: previous.index + 1,
            timestamp: chrono::Utc::now().timestamp(),
            transactions,
            proof: 0,
            hash: String::new(),
            previous_hash: Some(previous.hash.clone()),
        };
        block.find_proof();
        block
    }

    pub fn validate(&self, previous: &Block) -> Result<(), BlockchainError> {
        self.validate_hashes(previous)
            .and_then(|_| self.validate_transactions())
    }

    // Verifies that:
    // 1. the cached hash matches the block's actual hash
    // 2. the previous hash matches the previous block's hash
    fn validate_hashes(&self, previous: &Block) -> Result<(), BlockchainError> {
        self.try_hash().and_then(|actual_hash| {
            if Some(&previous.hash) != self.previous_hash.as_ref() {
                Err(BlockchainError::block(
                    self.index,
                    BlockErrorKind::PreviousHashMismatch,
                ))
            } else if actual_hash != self.hash {
                Err(BlockchainError::block(
                    self.index,
                    BlockErrorKind::HashMismatch,
                ))
            } else {
                Ok(())
            }
        })
    }

    // Checks if all transactions in this block are valid
    fn validate_transactions(&self) -> Result<(), BlockchainError> {
        // First verify that there's only a single miner reward
        let reward_count = self.transactions
            .iter()
            .filter(|tx| match **tx {
                Transaction::Reward(_) => true,
                _ => false,
            })
            .count();

        if reward_count != 1 {
            return Err(BlockchainError::block(
                self.index,
                BlockErrorKind::InvalidRewardCount,
            ));
        }

        // Then verify each transaction separately
        for transaction in &self.transactions {
            transaction.validate()?;
        }

        Ok(())
    }

    // Calculates and returns the hash of this block if it is valid or None otherwise
    fn try_hash(&self) -> Result<String, BlockchainError> {
        let hash = self.calculate_hash::<VerifiedBlock>();
        if hash.starts_with("0000") {
            Ok(hash)
        } else {
            Err(BlockchainError::block(
                self.index,
                BlockErrorKind::InvalidProof,
            ))
        }
    }

    // Finds and saves the correct proof and hash for this node
    fn find_proof(&mut self) {
        // Start at a random value to avoid wasting work across multiple nodes
        self.proof = rand::thread_rng().gen::<u32>();
        loop {
            if let Ok(hash) = self.try_hash() {
                self.hash = hash;
                break;
            }
            self.proof = self.proof.wrapping_add(1);
        }
    }
}

impl<'a> From<&'a Block> for VerifiedBlock<'a> {
    fn from(block: &Block) -> VerifiedBlock {
        VerifiedBlock {
            index: block.index,
            timestamp: block.timestamp,
            transactions: &block.transactions,
            proof: block.proof,
            previous_hash: block.previous_hash.as_ref().map(|x| x.as_ref()),
        }
    }
}
