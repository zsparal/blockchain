use core;

#[derive(Serialize, Deserialize)]
pub struct Transfer {
    pub id: String,
    pub amount: u64,
    pub sender: String,
    pub recipient: String,
    pub signature: String,
}

#[derive(Serialize)]
pub struct BlockIndexResult {
    pub block_index: u64,
}

#[derive(Serialize)]
pub struct BlockchainResult {
    pub blocks: Vec<core::Block>,
    pub length: usize,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct Client {
    pub name: Option<String>,
    pub public_key: String,
}

#[derive(Serialize)]
pub struct ClientList {
    pub clients: Vec<Client>,
}
