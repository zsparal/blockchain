use uuid::Uuid;

use core;

#[derive(Serialize, Deserialize)]
pub struct TransferRequest {
    pub id: Uuid,
    pub amount: i64,
    pub sender: String,
    pub recipient: String,
    pub signature: String,
}

#[derive(Serialize)]
pub struct BlockIndexResult {
    pub block_index: u64,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct Client {
    pub name: Option<String>,
    pub public_key: String,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct SelfInformation {
    pub public_key: String,
    pub blockchain: core::Blockchain,
}

#[derive(Serialize)]
pub struct ClientList {
    pub clients: Vec<Client>,
}

#[derive(Debug, Serialize)]
pub struct ErrorResult<E> {
    pub error: E,
}

impl From<TransferRequest> for core::Transfer {
    fn from(transfer: TransferRequest) -> Self {
        Self {
            id: transfer.id,
            amount: transfer.amount,
            sender: transfer.sender,
            recipient: transfer.recipient,
            signature: transfer.signature,
        }
    }
}
