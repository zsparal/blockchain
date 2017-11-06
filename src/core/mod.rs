use bincode;
use hex::ToHex;
use ring::digest;
use serde::Serialize;

pub mod block;
pub mod chain;
pub mod transaction;

pub use self::block::Block;
pub use self::chain::Blockchain;
pub use self::transaction::{Reward, Transaction, Transfer};

pub trait BlockHash where Self: Serialize {
    fn calculate_hash(&self) -> String {
        bincode::serialize(self, bincode::Infinite)
            .map(|bytes| digest::digest(&digest::SHA256, &bytes).to_hex())
            .expect(
                "Blockchain primitives must be able to generate a valid hash",
            )
    }
}

impl<T: Serialize> BlockHash for T { }
