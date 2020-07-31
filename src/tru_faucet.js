/**
 * PRIVATE_KEY={private_key} node lib/timelock_deploy.js "{network}"
 */
require("@babel/register");
import { ethers, providers } from 'ethers'
import { TrustToken } from '../abi/TrustToken'

async function truFaucet() {
    // get network from args
    const network = process.argv[2] || "ropsten"

    // set provider from infura & network
    const provider = new providers.InfuraProvider(
        process.argv[2], 'e33335b99d78415b82f8b9bc5fdc44c0')

    // use private key for wallet
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider)

    // testnet address
    const trustTokenProxyAddress = "0x711161BaF6fA362Fa41F80aD2295F1f601b44f3F"

    // get contract object
    const trustTokenContract = new ethers.Contract(
        trustTokenProxyAddress, TrustTokenABI, provider)

    // connect to wallet
    const trusttoken = trustTokenContract.connect(wallet)

    // get balance
    const balance = await trusttoken.balanceOf(wallet.address)

    // log balance
    console.log("TRU balance: ", balance)
}

truFaucet().catch(console.error)
