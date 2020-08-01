# TrustToken Ethereum Scripts

This repo has some useful scripts for interacting with TrustToken smart contracts. Most of the scripts are meant to be run on testnet, but we can also get some useful data from mainnet as well.

## Setup

`yarn install`

### Running Scripts

Any script can be run this way:
`PRIVATE_KEY={private_key} ts-node scripts/{script_name}`

**getting testnet TRU**  

PRIVATE_KEY={private_key} yarn faucet

# Using utiils.ts

**async & wait**  
We can use the wait() function to wait for a transaction to complete:
  
write transaction: `await wait(...)`  
read transaction:  `await ...`  

**interacting with a smart contract**  
First get the bytecode for a contract and save it as {contract_name].json file
You can use `contractAt({contract_name}, {contract_address})` to get the Contract object

```
// file: scripts/example_script.ts
import { ethers, providers } from 'ethers'
import { getContract, wait } from './utils'

// set provider from infura & network
const provider = new providers.InfuraProvider({network}, {infura_key})

// use private key for wallet
const wallet = new ethers.Wallet({private_key}, provider)

// contract address
const contractAddress = {contract_address}

// get contract object
// put abi in abi/{contract_name}.json
const contractAt = getContract(wallet)
const Contract = contractAt({contract_name}, contractAddress)

// connect wallet to contract
const contract = await Contract.connect(wallet)

// read with await ...
let result = await gastoken.read(wallet.address)

// write with await wait(...)
let txn = await wait(contract.write({txnArgs})
```

