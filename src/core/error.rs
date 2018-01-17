use uuid::Uuid;

#[derive(Debug, Copy, Clone, PartialEq, Eq, Serialize)]
pub enum TransactionErrorKind {
    InvalidSignature,
    InsufficientBalance,
    InvalidAmount,
    DuplicateId,
    MismatchedMinerReward,
}

#[derive(Debug, Copy, Clone, PartialEq, Eq, Serialize)]
pub enum BlockErrorKind {
    GenesisBlockMismatch,
    HashMismatch,
    InvalidProof,
    PreviousHashMismatch,
    InvalidRewardCount,
}

#[derive(Debug, Copy, Clone, PartialEq, Serialize)]
pub enum ChainErrorKind {
    InvalidBalance,
    PendingTransactionLimitReached,
}

#[derive(Debug, Clone, Serialize)]
#[serde(tag = "type")]
pub enum BlockchainError {
    Transaction {
        id: Uuid,
        kind: TransactionErrorKind,
    },
    Block {
        index: u64,
        kind: BlockErrorKind,
    },
    Chain {
        kind: ChainErrorKind,
    },
}

impl BlockchainError {
    pub fn transaction(id: Uuid, kind: TransactionErrorKind) -> Self {
        BlockchainError::Transaction { id, kind }
    }

    pub fn block(index: u64, kind: BlockErrorKind) -> Self {
        BlockchainError::Block { index, kind }
    }

    pub fn chain(kind: ChainErrorKind) -> Self {
        BlockchainError::Chain { kind }
    }
}
