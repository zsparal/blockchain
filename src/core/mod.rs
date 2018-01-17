use hex::ToHex;
use ring::digest;
use serde::Serialize;
use serde_json;

pub mod block;
pub mod chain;
pub mod error;
pub mod transaction;

pub use self::block::Block;
pub use self::chain::Blockchain;
pub use self::error::{BlockErrorKind, BlockchainError, ChainErrorKind, TransactionErrorKind};
pub use self::transaction::{Reward, Transaction, Transfer};

pub trait Verify
where
    Self: Serialize,
{
    // Converts the object to a byte representation which is the preferred input format for
    // most cryptographic operations
    fn to_bytes<'a, S>(&'a self) -> Vec<u8>
    where
        S: Verify + From<&'a Self>,
    {
        let json = serde_json::to_string(&S::from(self))
            .expect("Blockchain primitives must be able to be serialized into a byte vector");
        let bytes = json.into_bytes();
        bytes
    }

    // Calculates the SHA512 hash of the byte representation of the given object after converting
    // it to the suitable representation given as the generic type parameter. This allows us to
    // skip certain parts of the struct for the purposes of hashing
    fn calculate_hash<'a, S>(&'a self) -> String
    where
        S: Verify + From<&'a Self>,
    {
        let bytes = self.to_bytes::<S>();
        digest::digest(&digest::SHA512, &bytes).to_hex()
    }
}

impl<T> Verify for T
where
    T: Serialize,
{
}
