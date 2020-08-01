/**
 * PRIVATE_KEY={private_key} node lib/timelock_deploy.js "{network}"
 *
 *
 *
 *
 *
 * GAS FARM (WIP)
 *
 *
 */
import { ethers, providers, utils } from 'ethers'
import { getContract } from './utils'

const parseEther = utils.parseEther
const fromEther = utils.parseEther

const wait = async <T>(tx: Promise<{wait: () => Promise<T>}>): Promise<T> => (await tx).wait()
const TOKEN_AMOUNT = '10'

async function truFaucet() {
    // transaction arguments
    const txnArgs = { gasPrice: 40_000_000_000 }

    // get network from args
    const network = process.argv[2] || "ropsten"

    // set provider from infura & network
    const provider = new providers.InfuraProvider(
        network, 'e33335b99d78415b82f8b9bc5fdc44c0')

    // use private key for wallet
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider)

    // testnet address
    const gasTokenAddress = "0x0000000000004946c0e9f43f4dee607b0ef1fa1c"

    // Use wallet to get contract
    const contractAt = getContract(wallet)

    const GasToken = contractAt('GasToken', gasTokenAddress)

    // connect to wallet
    const gastoken = await GasToken.connect(wallet)

    // get balance
    let balance = await gastoken.balanceOf(wallet.address)
    console.log(`balance before: ${balance}`)


    const txn = await wait(gastoken.mint(wallet.address, '10', txnArgs))
    console.log(txn)

    // get balance after
    balance = await gastoken.balanceOf(wallet.address)
    console.log(`balance after: ${balance}`)
}

truFaucet().catch(console.error)
