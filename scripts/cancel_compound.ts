/**
 * PRIVATE_KEY={private_key} ts-node scripts/cancel_compound.ts '{network}'
 * GAS FARM (WIP)
 *
 *
 */
import { ethers, providers } from 'ethers'
import { getContract, wait } from './utils'
const TOKEN_AMOUNT = '10'

async function gasFarm () {
  // transaction arguments
  const txnArgs = { gasLimit: 1_000_000, gasPrice: 55_000_000_000 }

  // get network from args
  const network = process.argv[2] || 'ropsten'

  // set provider from infura & network
  const provider = new providers.InfuraProvider(
    network, 'e33335b99d78415b82f8b9bc5fdc44c0')

  // use private key for wallet
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider)

  // testnet address
  const adddress = '0xF8388bb567CEEB85cBfbE2923AfDEb5450292B1e'

  // Use wallet to get contract
  const contractAt = getContract(wallet)
  const CancelCompound = contractAt('CancelCompound', adddress)

  // connect to wallet
  const cancelcompound = await CancelCompound.connect(wallet)

  // mint gas tokens for TOKEN_AMOUNT
  const txn = await wait(cancelcompound.terminate(txnArgs))
  console.log(txn)
  console.log('cancelled compound proposal')
}

gasFarm().catch(console.error)
