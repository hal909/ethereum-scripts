/**
 * PRIVATE_KEY={private_key} ts-node scripts/transfer_tokens.ts '{network}' {path_to_csv}
 */
import { ethers, providers, BigNumber } from 'ethers'
import { getContract, wait } from './utils'
import fs from 'fs'
const TOKEN_AMOUNT = '10'

// gas limit, gas price
const txnArgs = { /*gasLimit: 1_000_000,*/ gasPrice: 100_000_000_000 }
// token precision
const precision = BigNumber.from('1000000000000000000') // 1e18

async function transferTokens() {
  // transaction arguments
  // get network from args
  const network = process.argv[2] || 'ropsten'

  // set provider from infura & network
  const provider = new providers.InfuraProvider(
    network, 'e33335b99d78415b82f8b9bc5fdc44c0')

  // use private key for wallet
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider)

  // testnet address
  const tokenAddress = '0x0000000000085d4780B73119b644AE5ecd22b376'

  // Use wallet to get contract
  const contractAt = getContract(wallet)

  const tusd = contractAt('IERC20', tokenAddress)

  // connect to wallet
  const token = await tusd.connect(wallet)

  // tranfers: [string, number]
  const transfers = getTransferArray()

  // parse accounts from csv
  const addresses = parseData(fs.readFileSync(process.argv[3]).toString())

  for (let i = 0; i < transfers.length; i++) {
    let to = transfers[i][0]
    // convert to token precision (will not accept floating point numbers)
    let amount = BigNumber.from(transfers[i][1]).mul(precision)

    // transfer
    await transfer(provider, wallet, token, to, amount)
  }
}

// transfer
async function transfer(provider, wallet, token, to: string, amount: BigNumber) {
  const txn = await wait(token.transfer(to, amount, txnArgs))
  console.log('transferred ', amount, 'to ', to)
}

// address, amount
// TODO parse data correctly
export const parseData = (text: string): string[] =>
  text
    .split(',')
    .filter((address) => address.length > 0)
    .map((address) => address.trim())

// store array of [string, number]
// numbers can only be whole numbers
// 1 = 1e18 in big number
function getTransferArray(): [string, number][] {
  return [
    ['0x5bE769783bBF5c74410288D334D526687B29F2F6', 1],
    ['0xF5aabc6E4cDa33f2c60c255c230AaC0CF6eF7b24', 1]
  ]
}

transferTokens().catch(console.error)
