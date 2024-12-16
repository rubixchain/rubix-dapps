# Rubix Super App

A Super Dapp hosting all the Core Features of Rubix and sample usescases to try out!

Currently hosted Dapps:

- [NFT](./src/features/nft)
- [FT](./src/features/ft)

## Prerequisites

- Node & NPM
- Python
- Golang
- tmux (For MacOS and Linux users)

## Instructions

### 1. Run a Localnet

1. Move inside the `scripts` dir
  ```
  cd scripts
  ```

2. Run the localnet script

  ```
  python3 run.py
  ```

A total of 5 Quorum and 1 Non-Quorum nodes will run. Quorum nodes will run on ports between 20000 to 20004, while the non-quorum node will run on port 20005. A DID will already created for use and it will be visible on the Dapp's UI. It also deploys the NFT smart contract.

3. To shutdown all nodes

```
python3 shutdown.py
```

### 2. Run CallBack DApp Server

A Callback DApp server expects a request from a Rubix Node where a Smart Contract is executed. To run this server:

```
cd backend/dapp_server
go run .
```

It will run on port 8080.

### 3. Run Frontend Server

The Frontend is written in React + Typescript with Vite build tooling. We need to run two servers here: Vite server and File Server which hosts NFT artifact and metadata files

1. Install Dependencies

```
npm i
```

2. Run the Vite server

```
npm run dev
```

3. In another terminal, run the File Server

```
node server.js
```

The App will hosted on port `5173`, and the file server runs on `3000`