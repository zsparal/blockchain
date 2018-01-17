use hex::{FromHex, ToHex};
use ring::signature;
use untrusted;
use uuid::Uuid;

use core::Verify;

use super::{BlockchainError, TransactionErrorKind};

pub const MINER_REWARD: i64 = 100;

#[derive(Debug, Clone, Eq, PartialEq, Serialize, Deserialize)]
pub struct Transfer {
    pub id: Uuid,
    pub amount: i64,
    pub sender: String,
    pub recipient: String,
    pub signature: String,
}

#[derive(Debug, Clone, Eq, PartialEq, Serialize, Deserialize)]
pub struct Reward {
    pub id: Uuid,
    pub recipient: String,
    pub amount: i64,
}

#[derive(Debug, Clone, Eq, PartialEq, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum Transaction {
    Transfer(Transfer),
    Reward(Reward),
}

#[derive(Debug, Serialize)]
struct VerifiedTransfer<'a> {
    id: Uuid,
    sender: &'a str,
    recipient: &'a str,
    amount: i64,
}

impl Transaction {
    // Creates a new transfer transaction, signed by the given private key
    pub fn transfer<S: AsRef<str>, R: AsRef<str>>(
        sender: S,
        recipient: R,
        amount: i64,
        key_pair: &signature::Ed25519KeyPair,
    ) -> Transfer {
        // We create the transfer with a dummy signature first so we can reuse Verify::to_bytes
        // for creating the encoded message
        let mut transfer = Transfer {
            id: Uuid::new_v4(),
            sender: String::from(sender.as_ref()),
            recipient: String::from(recipient.as_ref()),
            amount,
            signature: String::new(),
        };

        // Generate the message signature
        let signature = {
            let message = transfer.to_bytes::<VerifiedTransfer>();
            key_pair.sign(message.as_ref()).to_hex()
        };

        // Finally set the signature and return the result
        transfer.signature = signature;

        transfer
    }

    // Creates a new miner reward transaction. Rewards aren't signed
    pub fn reward<R: AsRef<str>>(recipient: R) -> Self {
        Transaction::Reward(Reward {
            id: Uuid::new_v4(),
            recipient: String::from(recipient.as_ref()),
            amount: MINER_REWARD,
        })
    }

    pub fn id(&self) -> &Uuid {
        match *self {
            Transaction::Transfer(ref transfer) => &transfer.id,
            Transaction::Reward(ref reward) => &reward.id,
        }
    }

    pub fn sender(&self) -> Option<&str> {
        match *self {
            Transaction::Transfer(ref transfer) => Some(transfer.sender.as_ref()),
            Transaction::Reward(_) => None,
        }
    }

    pub fn recipient(&self) -> &str {
        match *self {
            Transaction::Transfer(ref transfer) => transfer.recipient.as_ref(),
            Transaction::Reward(ref reward) => reward.recipient.as_ref(),
        }
    }

    pub fn amount(&self) -> i64 {
        match *self {
            Transaction::Transfer(ref transfer) => transfer.amount,
            Transaction::Reward(ref reward) => reward.amount,
        }
    }

    // Calculates the effects of this transaction on the provided address's overall balance:
    // 1. If the address is the sender then it's the negative amount
    // 2. If the address is the recipient then it's the positive amount
    pub fn balance_change(&self, address: &str) -> i64 {
        match *self {
            Transaction::Transfer(ref transfer) if transfer.sender == address => -transfer.amount,
            Transaction::Transfer(ref transfer) if transfer.recipient == address => transfer.amount,
            Transaction::Reward(ref reward) if reward.recipient == address => reward.amount,
            _ => 0,
        }
    }

    // Validates the transaction, by checking if:
    // 1. its signature is valid if it's a transfer
    // 2. the amount equals to the miner reward if it's a reward
    pub fn validate(&self) -> Result<(), BlockchainError> {
        match *self {
            Transaction::Transfer(ref transfer) => transfer.validate(),
            Transaction::Reward(ref reward) => reward.validate(),
        }
    }
}

impl Transfer {
    pub fn validate(&self) -> Result<(), BlockchainError> {
        if self.amount <= 0 {
            return Err(BlockchainError::transaction(
                self.id,
                TransactionErrorKind::InvalidAmount,
            ));
        }

        let public_key_bytes = Vec::from_hex(&self.sender).unwrap();
        let signature_bytes = Vec::from_hex(&self.signature).unwrap();

        let public_key = untrusted::Input::from(public_key_bytes.as_ref());
        let signature = untrusted::Input::from(signature_bytes.as_ref());
        let message = self.to_bytes::<VerifiedTransfer>();
        signature::verify(
            &signature::ED25519,
            public_key,
            untrusted::Input::from(message.as_ref()),
            signature,
        ).map_err(|_| BlockchainError::transaction(self.id, TransactionErrorKind::InvalidSignature))
    }
}

impl Reward {
    // Checks if the transaction amount matches the current miner reward.
    // NOTE: this is not very future-proof, it basically ties any future miner reward changes
    // to a client update
    pub fn validate(&self) -> Result<(), BlockchainError> {
        if self.amount != MINER_REWARD {
            Err(BlockchainError::transaction(
                self.id,
                TransactionErrorKind::MismatchedMinerReward,
            ))
        } else {
            Ok(())
        }
    }
}

impl From<Transfer> for Transaction {
    fn from(transfer: Transfer) -> Self {
        Transaction::Transfer(transfer)
    }
}

impl From<Reward> for Transaction {
    fn from(reward: Reward) -> Self {
        Transaction::Reward(reward)
    }
}

impl<'a> From<&'a Transfer> for VerifiedTransfer<'a> {
    fn from(transfer: &Transfer) -> VerifiedTransfer {
        VerifiedTransfer {
            id: transfer.id,
            sender: &transfer.sender,
            recipient: &transfer.recipient,
            amount: transfer.amount,
        }
    }
}
