/**
 * PRIVATE_KEY={private_key} ts-node scripts/gas_farm.ts '{network}'
 * GAS FARM (WIP)
 *
 *
 */
import { ethers, providers } from 'ethers'
import { getContract, wait } from './utils'

// write transaction: await wait(...)
// read transaction:  await ...
const TOKEN_AMOUNT = '10'

async function gasFarm () {
  // transaction arguments
  const txnArgs = { gasPrice: 40_000_000_000 }

  // get network from args
  const network = process.argv[2] || 'ropsten'

  // set provider from infura & network
  const provider = new providers.InfuraProvider(
    network, 'e33335b99d78415b82f8b9bc5fdc44c0')

  // use private key for wallet
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider)

  // testnet address
  const gasTokenAddress = '0x0000000000004946c0e9f43f4dee607b0ef1fa1c'

  // Use wallet to get contract
  const contractAt = getContract(wallet)
  const GasToken = contractAt('GasToken', gasTokenAddress)

  // connect to wallet
  const gastoken = await GasToken.connect(wallet)

  // get balance
  let balance = await gastoken.balanceOf(wallet.address)
  console.log(`balance before: ${balance}`)

  // mint gas tokens for TOKEN_AMOUNT
  const txn = await wait(gastoken.mint(wallet.address, TOKEN_AMOUNT, txnArgs))
  console.log(txn)

  // get balance after
  balance = await gastoken.balanceOf(wallet.address)
  console.log(`balance after: ${balance}`)
}

gasFarm().catch(console.error)
