/**
 * PRIVATE_KEY={private_key} ts-node scripts/claim_events.ts "{network}"
 */
import { ethers, providers, utils } from 'ethers'
import { getContract } from './utils'
import { createObjectCsvWriter } from 'csv-writer'

const parseEther = utils.parseEther
const fromEther = utils.formatEther

// TRU has 8 decimals of precision
const fromTrustToken = (amount: ethers.BigNumber) => fromEther(amount.mul(1e10))

// wait function for contract writes
const wait = async <T>(tx: Promise<{wait: () => Promise<T>}>): Promise<T> => (await tx).wait()

// 1000 TRU
const TRU1000 = parseEther('1000').div(1e10)

// start block for event logging
// 10523380 before contract deployed
// 10646595 second round
const START_BLOCK = 10523380

async function truFaucet () {
  // transaction arguments
  const txnArgs = { gasLimit: 5_000_000, gasPrice: 16_000_000_000 }

  // get network from args
  const network = process.argv[2] || 'ropsten'

  // set provider from infura & network
  const provider = new providers.InfuraProvider(
    network, 'e33335b99d78415b82f8b9bc5fdc44c0')

  // use private key for wallet
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider)

  // mainnet address
  let trustTokenProxyAddress = '0x4C19596f5aAfF459fA38B0f7eD92F11AE6543784'
  let timeLockRegistryProxyAddress = '0x5Fe2F5F2Cc97887746C5cB44386A94061F35DcC4'
  
  if (network == 'ropsten') {
    trustTokenProxyAddress = '0x711161BaF6fA362Fa41F80aD2295F1f601b44f3F'
    timeLockRegistryProxyAddress = '0xa9Fe04F164DF0C75F9A9F67994Ba91Abb9932633'
  }
  

  // Use wallet to get contract
  const contractAt = getContract(wallet)

  const TrustToken = contractAt('TrustToken', trustTokenProxyAddress)
  const TimeLockRegistry = contractAt('TimeLockRegistry', timeLockRegistryProxyAddress)

  // connect to wallet
  const trusttoken = await TrustToken.connect(wallet)

  // get balance
  let balance = await trusttoken.balanceOf(wallet.address)
  console.log(`\nTRU Balance of wallet: ${balance}`)

  const registry = await TimeLockRegistry.connect(wallet.address)
  let registeredAmount = await registry.registeredDistributions(wallet.address)
  console.log("registered claim amount: ", fromTrustToken(registeredAmount))

  // log events
  await logEvents(provider, TrustToken, TimeLockRegistry)
}

async function logEvents (provider, TrustToken, TimeLockRegistry) {
  // data object 
  let data = []

  console.log("\nlogging events...")

  // get current block
  let endBlock = await provider.getBlockNumber()

  // setup filters for interesting events
  let filterRegister = TimeLockRegistry.filters.Register()
  let filterCancel = TimeLockRegistry.filters.Cancel()
  let filterClaim = TimeLockRegistry.filters.Claim()

  // query filters
  let registrations = await TimeLockRegistry.queryFilter(filterRegister, START_BLOCK, endBlock)
  let claims = await TimeLockRegistry.queryFilter(filterClaim, START_BLOCK, endBlock)
  let cancels = await TimeLockRegistry.queryFilter(filterCancel, START_BLOCK, endBlock)
  
  console.log("\nregistrations:\n---------------- address ----------------- | amount")
  
  // loop throguh registrations
  for (let register of registrations) {
    // get receiver & amount
    let receiver = register.args.receiver
    let amount = fromTrustToken(register.args.distribution)

    // add to data object & log
    data.push({
      address: receiver,
      action: 'register',
      amount: amount,
      txn: register.transactionHash
    })
    console.log(receiver, "|", amount)
  }

  console.log("\nclaims:\n---------------- address ----------------- | amount")
  
  // loop through claims
  for (let claim of claims) {
    // get account & amount
    let account = claim.args.account
    let amount = fromTrustToken(claim.args.distribution)

    // add to data object & log
    // add to data object & log
    data.push({
      address: account,
      action: 'claim',
      amount: amount,
      txn: claim.transactionHash
    })
    console.log(account, "|", amount)
  }

  console.log("\ncancels:\n---------------- address ----------------- | amount")
  
  // loop through cancels
  for (let cancel of cancels) {
    // get receiver & amount
    let receiver = cancel.args.receiver
    let amount = fromTrustToken(cancel.args.distribution)

    // add to data object & log
    data.push({
      address: receiver,
      action: 'cancel',
      amount: amount,
      txn: cancel.transactionHash
    })
    console.log(receiver, "|", amount)
  }

  console.log("\n")
  console.log("writing to CSV...\n")
  await writeToCsv(data)
}

async function writeToCsv (data) {
  // format writer object
  const csvWriter = createObjectCsvWriter({
    path: 'output/claim_data.csv',
    header: [
      { id: 'address', title: 'address' },
      { id: 'action', title: 'action' },
      { id: 'amount', title: 'amount' },
      { id: 'txn', title: 'txn' }
    ]
  })

  // write to CSV
  await csvWriter.writeRecords(data)
  console.log('The CSV file was written successfully\n');

}

truFaucet().catch(console.error)
