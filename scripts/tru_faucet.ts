/**
 * PRIVATE_KEY={private_key} node scripts/tru_faucet.js "{network}"
 */
import { ethers, providers, utils } from 'ethers'
import { getContract } from './utils'

const parseEther = utils.parseEther
// const fromEther = utils.parseEther

const wait = async <T>(tx: Promise<{wait: () => Promise<T>}>): Promise<T> => (await tx).wait()
const TRU1000 = parseEther('1000').div(1e10)

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

  // testnet address
  const trustTokenProxyAddress = '0x711161BaF6fA362Fa41F80aD2295F1f601b44f3F'

  // Use wallet to get contract
  const contractAt = getContract(wallet)

  const TrustToken = contractAt('MockTrustToken', trustTokenProxyAddress)

  // connect to wallet
  const trusttoken = await TrustToken.connect(wallet)

  // get balance before
  let balance = await trusttoken.balanceOf(wallet.address)
  console.log(`balance before: ${balance}`)

  const faucet = await wait(trusttoken.faucet(wallet.address, TRU1000, txnArgs))
  console.log(faucet)

  // get balance after
  balance = await trusttoken.balanceOf(wallet.address)
  console.log(`balance after: ${balance}`)
}

truFaucet().catch(console.error)
