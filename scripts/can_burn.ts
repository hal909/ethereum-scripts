/**
 * PRIVATE_KEY={private_key} ts-node scripts/can_burn.ts "{network}"
 */
import { ethers, providers, utils } from 'ethers'
import { getContract } from './utils'
import { createObjectCsvWriter } from 'csv-writer'
import { canBurnFinal } from './can_burn_final'

const parseEther = utils.parseEther
const fromEther = utils.formatEther

// TRU has 8 decimals of precision
const fromTrustToken = (amount: ethers.BigNumber) => fromEther(amount.mul(1e10))

// wait function for contract writes
const wait = async <T>(tx: Promise<{wait: () => Promise<T>}>): Promise<T> => (await tx).wait()

// start block for event logging
// 10719646 before contract upgrades
// const START_BLOCK = 10719646
const START_BLOCK = 6906592 // registry deployment

// Smart Contract Addresses
const registryProxyAddress = '0x0000000000013949F288172bD7E36837bDdC7211'
const trueUSDAddress = '0x0000000000085d4780B73119b644AE5ecd22b376'
const canBurnAdmin = '0x6973526567697374727941646d696e0000000000000000000000000000000000'
const controllerAddresss = '0x0000000000075efbee23fe2de1bd0b7690883cc9'

// Registry Attributes
const canBurnHKD = '0x63616e4275726e484b4400000000000000000000000000000000000000000000'
const canBurn = '0x63616e4275726e00000000000000000000000000000000000000000000000000'

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
  const TrueUSD = contractAt('TrueUSD', trueUSDAddress)
  const TokenControllerV2 = contractAt('TokenControllerV2', controllerAddresss)

  // connect to wallet
  const registry = await Registry.connect(wallet)
  const tusd = await TrueUSD.connect(wallet)
  const tokenController = await  TokenControllerV2.connect(wallet)

  // get balance
  let isCanBurnAdmin = await registry.hasAttribute(wallet.address, canBurnAdmin)
  console.log(`\nisCanBurnAdmin ${isCanBurnAdmin}`)

  // log events
  if (isCanBurnAdmin) {
    //await logEvents(provider, wallet, Registry, TrueUSD, TokenControllerV2)
    await logTransfers(provider, wallet, Registry, TrueUSD, TokenControllerV2, canBurnFinal)
  }

}

async function logTransfers(provider, wallet, Registry, TrueUSD, TokenControllerV2, list) {
  console.log('log transfers')
  let dict = {}
  let data = []
  let rawData = []

  // init dictionary for time & amount
  for (let item of list) {
    dict[item] = {
      'block': 0, 
      'amount': 0
    }
  }

  let endBlock = await provider.getBlockNumber()
  let startBlock = START_BLOCK
  let searchSize = 100
  let filterTransfers = TrueUSD.filters.Transfer()

  for (let block = endBlock; block >= startBlock; block -= searchSize) {
    let transfers = await TrueUSD.queryFilter(filterTransfers, block, block + searchSize)
    // loop through transfers
    for (let transfer of transfers) {
      let to = transfer.args.to
      if (dict[to] != null) {
        console.log("redemption address: ", to)
        // set highest block
        if (dict[to].block != 0) {
          dict[to].block = block
        }
        // count transfers
        dict[to].amount = dict[to].amount + 1
      }
    }
  }

  let formatData = []
  for (let item of list) {
    formatData.push({
      who: item,
      amount: dict[item].amount,
      block: dict[item].block
    })
  }

  await writeToCsv(formatData, 
    [
      { id: 'who', title: 'who' },
      { id: 'amount', title: 'amount' },
      { id: 'block', title: 'block' },
    ])
}

async function logEvents (provider, wallet, Registry, TrueUSD, TokenControllerV2) {
  // data object 
  let rawData = []
  let data = {}
  // get tusd contract
  const tusd = await TrueUSD.connect(wallet)
  const tokenController = await TokenControllerV2.connect(wallet)

  console.log("\nlogging events...")

  // get current block
  let endBlock = await provider.getBlockNumber()

  // setup filters for interesting events
  let filterAttributeValue = Registry.filters.SetAttribute()
  let filterTransfers = TrueUSD.filters.Transfer()

  // query filters
  let events = await Registry.queryFilter(filterAttributeValue, START_BLOCK, endBlock)
  // let transfers = await TrueUSD.queryFilter(filterTransfers, START_BLOCK, endBlock)
  
  console.log("\nregistrations:\n---------------- address ----------------- |  -------------------------- attribute ------------------------------ | value")

  // loop through events
  for (let event of events) {
    // get event rawData & log
    let who = event.args.who
    let attribute = event.args.attribute
    let value = event.args.value
    if (attribute == canBurn) {
      console.log(who, ", ", attribute, ", ", value.toNumber())
      data[who] = value.toNumber()
      rawData.push({
        who: who,
        attribute: attribute,
        value: value.toNumber(),
        block: event.args.blockNumber
      })
    }
  }

  // format data removing any that are set to zero
  let counter = 0
  let formatData = []
  let visited = {}
  rawData.forEach( (item) => {
    if (data[item.who] == 1 && !visited[item.who]) {
      visited[item.who] = true
      formatData.push(item)
      counter++
      console.log(item.who)
    }
  })
  console.log()
  console.log("\n", counter, " addresses")

  let invalidCount = 0;
  let invalid = []

  const registry = await Registry.connect(wallet)

  for (let i = 0; i < counter; i++) {
    let isCanBurn = await registry.hasAttribute(formatData[i].who, canBurn)
    if (isCanBurn) {
      console.log("validated ", formatData[i].who)
    }
    else {
      invalid.push(formatData[i])
      console.log("\n\ninvalid!! ", formatData[i].who, "\n\n")
    }
  }

  console.log("\n")
  await writeToCsv(formatData, 
    [
      { id: 'who', title: 'who' },
      { id: 'attribute', title: 'attribute' },
      { id: 'value', title: 'value' },
      { id: 'txn', title: 'txn' }
    ])
}


async function writeToCsv (data, header) {
  console.log("writing to CSV...\n")
  // format writer object
  const csvWriter = createObjectCsvWriter({
    path: 'output/can_burn.csv',
    header: header
  })

  // write to CSV
  await csvWriter.writeRecords(data)
  console.log('The CSV file was written successfully\n');

}

findCanBurn().catch(console.error)
