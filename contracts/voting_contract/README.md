# Rubix Smart Contract - Voting Contract

This contract allows users to **register a color**, **vote** for one, and **retrieve the winning color**. It's written in **Rust**, compiled to **WASM**, and deployed on the **Rubix blockchain**.

**To set up a Rubix Node, [click here](https://gist.github.com/arnabghose997/cbc9450c3108a94f2d2deb892e134280#smart-contract-setup).**

---

## Project Structure

```
voting_contract/
├── Cargo.toml          # Rust config
├── src/
│   └── lib.rs          # Contract code
└── target/
    └── wasm32-unknown-unknown/
        └── release/
            └── voting_contract.wasm  # Compiled WASM
```

---

## Build Instructions

```bash
cargo build --release --target wasm32-unknown-unknown
```

This generates the `.wasm` contract file in `target/wasm32-unknown-unknown/release`.

---

## Linker Functions

Rubix contracts interact with blockchain via **extern "C" functions** provided by the runtime.

```rust
extern "C" {
    fn read_state(key_ptr: *const u8, key_len: usize, val_ptr: *mut u8, val_len: usize) -> i32;
    fn write_state(key_ptr: *const u8, key_len: usize, val_ptr: *const u8, val_len: usize) -> i32;
}
```

These are used for:
- Reading/writing blockchain key-value storage
- Transferring tokens (if needed)
- Calling external APIs

---

## Contract Logic (`lib.rs`)

### Structs & Helpers

```rust
#[derive(Serialize, Deserialize)]
pub struct Vote {
    pub user_did: String,
    pub color: String,
}
```

- `Vote`: Keeps track of who voted and for what.

### Registering a Color

```rust
#[no_mangle]
pub extern "C" fn register_colour() -> i32 {
    let color = get_input_string(); // Reads color from input

    let mut colors = read_state_vec::<String>("colors");
    if colors.contains(&color) {
        return -1; // Already exists
    }

    colors.push(color.clone());
    write_state_vec("colors", &colors);
    0
}
```

- Adds a color to the blockchain list if not already present.

### Casting a Vote

```rust
#[no_mangle]
pub extern "C" fn cast_vote() -> i32 {
    let vote: Vote = get_input_json();
    let key = format!("vote_{}", vote.user_did);

    if let Some(_) = read_state::<String>(&key) {
        return -1; // Already voted
    }

    let mut tally = read_state_map::<String, u32>("tally");
    *tally.entry(vote.color.clone()).or_insert(0) += 1;
    
    write_state_map("tally", &tally);
    write_state(&key, &vote.color);
    0
}
```

- Checks if the user already voted.
- Increments vote count for the selected color.
- Records the user's vote.

### Tallying Votes

```rust
#[no_mangle]
pub extern "C" fn tally_votes() {
    // Already updated during cast_vote
}
```

- Optional if vote count is updated in `cast_vote`.

### Get Winner

```rust
#[no_mangle]
pub extern "C" fn get_winner() -> i32 {
    let tally = read_state_map::<String, u32>("tally");

    let mut winner = "".to_string();
    let mut max_votes = 0;

    for (color, count) in tally.iter() {
        if *count > max_votes {
            winner = color.clone();
            max_votes = *count;
        }
    }

    return_json(&winner); // Return as JSON
    0
}
```

- Iterates through the tally to find the color with max votes.
- Returns the winning color as JSON.

---

## Example Input & Output

### Input 
``` bash
curl -X POST http://localhost:8080/api/voting-contract \
-H "Content-Type: application/json" \
-d '{
  "votes": [
    {"voter_id": "voter1", "color": "Red"},
    {"voter_id": "voter2", "color": "Green"},
    {"voter_id": "voter3", "color": "Red"}
  ]
}'
```

### Output
``` bash
{"tally":"Vote tally: {\"Red\": 2, \"Green\": 1}","winner":"Winner is Red"}
```

---

## Deployment Flow

1. Write logic in `lib.rs`.
2. Compile using `cargo build`.
3. Upload `.wasm` file to Rubix node.
4. Trigger functions using Rubix CLI or DApp server:
   - `register_colour`
   - `cast_vote`
   - `get_winner`

---

## Security Checks

- Prevents double voting by checking `vote_<user_did>` state.
- Validates registered colors before allowing vote.
- Stores all state on-chain using Rubix's persistent storage.

---

## Prerequisites

* Rust (with `wasm32-unknown-unknown` target)
* Go (to run the DApp server)
* Rubix Node (Deployer and Executor)
* DIDs created on both nodes

---

## Smart Contract Setup Steps

### 1. Clone the Voting Smart Contract

```bash
git clone https://github.com/rubixchain/Rubix-Smart-Contract-Examples.git
cd Rubix-Smart-Contract-Examples/
git checkout sc-dev
cd voting-contract
```

### 2. Generate WASM & Run Server

```bash
cd voting-contract
cargo build --target wasm32-unknown-unknown
```

The WASM file will be generated at:

```
target/wasm32-unknown-unknown/debug/voting_contract.wasm
```

To run the DApp server:

```bash
cd ../server
go run main.go
```

> The server listens at: `http://localhost:8080/api/v1/contract-input`

---

### 3. Generate the Smart Contract (From Deployer Node)

Open Swagger at: `http://localhost:20000/swagger/index.html`

* Use `/api/genarate-smart-contract`
* Upload:

  * WASM file
  * `src/lib.rs`
  * `store_state/vote_contract/votefile.json`

Get the contract token hash from the logs (example: `QmXyz...`)

---

### 4. Subscribe to Smart Contract

**Deployer:**

```bash
curl -X POST http://localhost:20000/api/subscribe-smart-contract \
-H 'Content-Type: application/json' \
-d '{"smartContractToken": "<Smart Contract Token Hash>"}'
```

**Executor:**

```bash
curl -X POST http://localhost:20000/api/subscribe-smart-contract \
-H 'Content-Type: application/json' \
-d '{"smartContractToken": "<Smart Contract Token Hash>"}'
```

---

### 5. Register Callback URL

**Both nodes (Deployer and Executor):**

```bash
curl -X POST http://localhost:20000/api/register-callback-url \
-H 'Content-Type: application/json' \
-d '{
  "CallBackURL": "http://localhost:8080/api/v1/contract-input",
  "SmartContractToken": "<Smart Contract Token Hash>"
}'
```

---

### 6. Deploy the Smart Contract (Deployer Node)

```bash
curl -X POST http://localhost:20005/api/deploy-smart-contract \
-H 'Content-Type: application/json' \
-d '{
  "comment": "deploying..",
  "deployerAddr": "<Deployer DID>",
  "quorumType": 2,
  "rbtAmount": 1,
  "smartContractToken": "<Smart Contract Token Hash>"
}'
```

Then, confirm using:

```bash
curl -X POST http://localhost:20005/api/signature-response \
-H 'Content-Type: application/json' \
-d '{
  "id": "<UUID from deploy response>",
  "mode": 0,
  "password": "mypassword"
}'
```

---

### 7. Execute the Smart Contract (Executor Node)

```bash
curl -X POST http://localhost:20006/api/execute-smart-contract \
-H 'Content-Type: application/json' \
-d '{
  "comment": "executing..",
  "executorAddr": "<Executor DID>",
  "quorumType": 2,
  "smartContractData": "Red",
  "smartContractToken": "<Smart Contract Token Hash>"
}'
```

Then, confirm using:

```bash
curl -X POST http://localhost:20006/api/signature-response \
-H 'Content-Type: application/json' \
-d '{
  "id": "<UUID from execute response>",
  "mode": 0,
  "password": "mypassword"
}'
```

---

### 8. Fetch Smart Contract Chain Data

**Full Chain:**

```bash
curl -X POST http://localhost:20001/api/get-smart-contract-token-chain-data \
-H 'Content-Type: application/json' \
-d '{
  "latest": false,
  "token": "<Smart Contract Token Hash>"
}'
```

**Latest Block:**

```bash
curl -X POST http://localhost:20001/api/get-smart-contract-token-chain-data \
-H 'Content-Type: application/json' \
-d '{
  "latest": true,
  "token": "<Smart Contract Token Hash>"
}'
```

---




