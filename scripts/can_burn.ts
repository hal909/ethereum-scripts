/**
 * PRIVATE_KEY={private_key} ts-node scripts/can_burn.ts "{network}"
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

// start block for event logging
// 10719646 before contract upgrades
const START_BLOCK = 10719646

// Smart Contract Addresses
const registryProxyAddress = '0x0000000000013949F288172bD7E36837bDdC7211'
const trueHKDAddress = '0x0000852600ceb001e08e00bc008be620d60031f2'
const canBurnAdmin = '0x6973526567697374727941646d696e0000000000000000000000000000000000'
const thkdControllerAddress = '0x0000107d120000E00095Cf06b787a0a900B1F8Bd'

// Registry Attributes
const canBurnHKD = '0x63616e4275726e484b4400000000000000000000000000000000000000000000'

async function findCanBurn () {
  // transaction arguments
  const txnArgs = { gasLimit: 5_000_000, gasPrice: 16_000_000_000 }

  // get network from args
  const network = process.argv[2] || 'ropsten'

  // set provider from infura & network
  const provider = new providers.InfuraProvider(
    network, 'e33335b99d78415b82f8b9bc5fdc44c0')

  // use private key for wallet
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider)

  // Use wallet to get contract
  const contractAt = getContract(wallet)

  const Registry = contractAt('Registry', registryProxyAddress)
  const TrueHKD = contractAt('TimeLockRegistry', trueHKDAddress)
  const THKDController = contractAt('TokenControllerV2', thkdControllerAddress)

  // connect to wallet
  const registry = await Registry.connect(wallet)
  const thkd = await TrueHKD.connect(wallet)
  const thkdController = await THKDController.connect(wallet)

  // get balance
  let isCanBurnAdmin = await registry.hasAttribute(wallet.address, canBurnAdmin)
  console.log(`\nisCanBurnAdmin ${isCanBurnAdmin}`)

  // log events
  if (isCanBurnAdmin) {
    await logEvents(provider, wallet, Registry, TrueHKD, THKDController)
  }
  // await logEvents(provider, wallet, Registry, TrueHKD)
}

async function logEvents (provider, wallet, Registry, TrueHKD, THKDController) {
  // data object 
  let data = []
  // get thkd contract
  const thkd = await TrueHKD.connect(wallet)
  const thkdController = await THKDController.connect(wallet)

  console.log("\nlogging events...")

  // get current block
  let endBlock = await provider.getBlockNumber()

  // setup filters for interesting events
  let filterAttributeValue = Registry.filters.SetAttribute()

  // query filters
  let events = await Registry.queryFilter(filterAttributeValue, START_BLOCK, endBlock)
  
  console.log("\nregistrations:\n---------------- address ----------------- | amount")
  
  // loop through events
  for (let event of events) {
    // get event data & log
    let who = event.args.who
    let attribute = event.args.attribute
    let value = event.args.value
    if (attribute == canBurnHKD) {
      console.log(who, ", ", attribute, ", ", value.toNumber())
    }
    data.push({
      who: who,
      attribute: attribute,
      value: value.toNumber(),
      txn: event.transactionHash
    })

    // console.log(who, ", ", attribute, ", ", value.toNumber())
  }

  console.log("\n")
  await writeToCsv(data)
}

async function writeToCsv (data) {
  console.log("writing to CSV...\n")
  // format writer object
  const csvWriter = createObjectCsvWriter({
    path: 'output/can_burn.csv',
    header: [
      { id: 'who', title: 'who' },
      { id: 'attribute', title: 'attribute' },
      { id: 'value', title: 'value' },
      { id: 'txn', title: 'txn' }
    ]
  })

  // write to CSV
  await csvWriter.writeRecords(data)
  console.log('The CSV file was written successfully\n');

}

findCanBurn().catch(console.error)
