#![feature(plugin)]
#![feature(decl_macro)]
#![plugin(rocket_codegen)]

extern crate rocket;
extern crate rocket_contrib;

extern crate iridium;

use rocket::State;
use rocket_contrib::Json;
use std::sync::RwLock;

use iridium::core::{self, Blockchain, Block};
use iridium::network::{self, BlockchainResult, BlockIndexResult, Client, ClientList};

struct App {
    blockchain: RwLock<Blockchain>,
    clients: RwLock<Vec<Client>>,
}

#[post("/transactions/new", data = "<transfer>")]
fn new_transaction(transfer: Json<network::Transfer>, app: State<App>) -> Json<BlockIndexResult> {
    let mut blockchain = app.blockchain.write().unwrap();
    let block_index = blockchain.new_transaction(core::Transfer::from(transfer.into_inner()));
    Json(BlockIndexResult { block_index })
}

#[get("/chain")]
fn chain(app: State<App>) -> Json<BlockchainResult> {
    let blockchain = app.blockchain.read().unwrap();
    Json(BlockchainResult {
        blocks: blockchain.blocks.clone(),
        length: blockchain.len(),
    })
}

#[post("/clients/register", data = "<client>")]
fn register_client(client: Json<Client>, app: State<App>) -> () {
    let mut clients = app.clients.write().unwrap();
    clients.push(client.into_inner());
}

#[get("/clients")]
fn clients(app: State<App>) -> Json<ClientList> {
    let clients = app.clients.read().unwrap();
    Json(ClientList { clients: (*clients).clone() })
}

#[get("/mine")]
fn mine(app: State<App>) -> Json<Option<Block>> {
    let mut blockchain = app.blockchain.write().unwrap();
    let mut block = blockchain.create_block();
    block.find_proof();

    let block = blockchain.add_block(block);
    Json(block.cloned())
}


fn main() {
    rocket::ignite()
        .manage(App {
            blockchain: RwLock::new(core::Blockchain::new()),
            clients: RwLock::new(Vec::new()),
        })
        .mount("/", routes![new_transaction, chain, mine])
        .launch();
}
