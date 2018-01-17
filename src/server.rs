#![feature(plugin)]
#![feature(decl_macro)]
#![plugin(rocket_codegen)]
#![allow(unknown_lints)]
#![allow(needless_pass_by_value)]
#![allow(let_unit_value)]

extern crate hex;
extern crate ring;
extern crate rocket;
extern crate rocket_contrib;
extern crate rocket_cors;
extern crate untrusted;

extern crate iridium;

use std::collections::HashMap;
use std::sync::RwLock;

use hex::ToHex;
use ring::{rand, signature};
use rocket::State;
use rocket_contrib::Json;

use iridium::core::{self, Block, Blockchain, BlockchainError, Transaction};
use iridium::network::{self, BlockIndexResult, Client, ClientList, ErrorResult, SelfInformation};

struct App {
    key_pair: signature::Ed25519KeyPair,
    public_key: String,
    blockchain: RwLock<Blockchain>,
    clients: RwLock<HashMap<String, Client>>,
}

impl App {
    pub fn new() -> Self {
        let rng = rand::SystemRandom::new();
        let pkcs8_bytes =
            signature::Ed25519KeyPair::generate_pkcs8(&rng).expect("Cannot create pk/sk pair");
        let key_pair = signature::Ed25519KeyPair::from_pkcs8(untrusted::Input::from(&pkcs8_bytes))
            .expect("Cannot create pk/sk pair");
        let public_key = key_pair.public_key_bytes().to_hex();
        Self {
            key_pair,
            public_key,
            blockchain: RwLock::new(core::Blockchain::new()),
            clients: RwLock::new(HashMap::new()),
        }
    }
}

#[post("/transactions/new", data = "<transfer>")]
fn new_transaction(
    transfer: Json<network::TransferRequest>,
    app: State<App>,
) -> Result<Json<Blockchain>, Json<ErrorResult<BlockchainError>>> {
    let mut blockchain = app.blockchain.write().unwrap();
    blockchain
        .new_transaction(core::Transfer::from(transfer.into_inner()))
        .map(|_| Json(blockchain.clone()))
        .map_err(|error| Json(ErrorResult { error }))
}

#[post("/transactions/send", data = "<client>")]
fn send_coins(
    client: Json<Client>,
    app: State<App>,
) -> Result<Json<Blockchain>, Json<ErrorResult<BlockchainError>>> {
    let mut blockchain = app.blockchain.write().unwrap();
    let transfer = Transaction::transfer(
        &app.public_key,
        &client.into_inner().public_key,
        50,
        &app.key_pair,
    );
    blockchain
        .new_transaction(transfer)
        .map(|_| Json(blockchain.clone()))
        .map_err(|error| Json(ErrorResult { error }))
}

#[get("/chain")]
fn chain(app: State<App>) -> Json<Blockchain> {
    let blockchain = app.blockchain.read().unwrap();
    Json(blockchain.clone())
}

#[post("/chain/replace", data = "<chain>")]
fn replace_chain(
    chain: Json<Blockchain>,
    app: State<App>,
) -> Result<Json<Blockchain>, Json<ErrorResult<BlockchainError>>> {
    let mut blockchain = app.blockchain.write().unwrap();
    blockchain
        .replace(chain.into_inner())
        .map(|replaced| Json(replaced.clone()))
        .map_err(|error| Json(ErrorResult { error }))
}

#[post("/chain/tamper", data = "<block>")]
fn tamper(block: Json<Block>, app: State<App>) -> Json<Blockchain> {
    let mut blockchain = app.blockchain.write().unwrap();
    blockchain.tamper(block.into_inner());
    Json(blockchain.clone())
}

#[post("/clients/register", data = "<client>")]
fn register_client(client: Json<Client>, app: State<App>) -> () {
    let mut clients = app.clients.write().unwrap();
    let client = client.into_inner();
    let public_key = client.public_key.clone();
    clients.insert(public_key, client);
}

#[get("/client/me")]
fn me(app: State<App>) -> Json<SelfInformation> {
    Json(SelfInformation {
        public_key: app.public_key.clone(),
        blockchain: app.blockchain.read().unwrap().clone(),
    })
}

#[get("/clients")]
fn clients(app: State<App>) -> Json<ClientList> {
    let clients = app.clients.read().unwrap();
    Json(ClientList {
        clients: clients.values().cloned().collect(),
    })
}

#[post("/mine")]
fn mine(app: State<App>) -> Json<Block> {
    let mut blockchain = app.blockchain.write().unwrap();
    let public_key = &app.public_key;
    let block = blockchain.mine(public_key);
    Json(block.clone())
}

fn main() {
    let options: rocket_cors::Cors = Default::default();
    rocket::ignite()
        .manage(App::new())
        .mount(
            "/",
            routes![
                new_transaction,
                send_coins,
                chain,
                replace_chain,
                tamper,
                mine,
                register_client,
                clients,
                me
            ],
        )
        .attach(options)
        .launch();
}
