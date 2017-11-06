use chrono;

use super::BlockHash;
use super::transaction::Transaction;

#[derive(Debug, PartialEq, Eq, Clone, Serialize, Deserialize)]
pub struct Block {
    pub index: u64,
    pub timestamp: i64,
    pub proof: u64,
    pub previous_hash: Option<String>,
    pub transactions: Vec<Transaction>,
}

impl Block {
    pub fn genesis() -> Self {
        Self {
            index: 0,
            timestamp: 1_509_904_677,
            transactions: vec![],
            proof: 0,
            previous_hash: None,
        }
    }

    pub fn new(previous: &Block, transactions: Vec<Transaction>) -> Self {
        Self {
            index: previous.index + 1,
            timestamp: chrono::Utc::now().timestamp(),
            transactions,
            proof: 0,
            previous_hash: Some(previous.calculate_hash()),
        }
    }

    pub fn find_proof(&mut self) {
        while !self.is_valid() {
            self.proof += 1;
        }
    }

    pub fn is_valid(&self) -> bool {
        self.calculate_hash().starts_with("0000")
    }
}
