# TrustToken Ethereum Scripts
This repo has some useful scripts for interacting with TrustToken smart contracts. Most of the scripts are meant to be run on testnet, but we can also get some useful data from mainnet as well.

## Setup
`yarn install`

### Running Scripts
Any script can be run this way:
`PRIVATE_KEY={private_key} ts-node scripts/{script_name}`

*getting testnet TRU*
PRIVATE_KEY={private_key} yarn faucet

## Gas Farm

`PRIVATE_KEY={private_key} yarn gasfarm`

# Using the utiils.ts  
write transaction: await wait(...)
read transaction:  await ...