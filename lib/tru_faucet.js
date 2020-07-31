'use strict';

/**
 * PRIVATE_KEY={private_key} node src/timelock_deploy.js "{network}"
 */

var _require = require('ethers'),
    ethers = _require.ethers,
    providers = _require.providers;

var _require2 = require('../abi/TrustToken'),
    TrustToken = _require2.TrustToken;

async function truFaucet() {
    // get network from args
    var network = process.argv[2] || "ropsten";

    // set provider from infura & network
    var provider = new providers.InfuraProvider(process.argv[2], 'e33335b99d78415b82f8b9bc5fdc44c0');

    // use private key for wallet
    var wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    // testnet address
    var trustTokenProxyAddress = "0x711161BaF6fA362Fa41F80aD2295F1f601b44f3F";

    // get contract object
    var trustTokenContract = new ethers.Contract(trustTokenProxyAddress, TrustTokenABI, provider);

    // connect to wallet
    var trusttoken = trustTokenContract.connect(wallet);

    // get balance
    var balance = await trusttoken.balanceOf(wallet.address);

    // log balance
    console.log("TRU balance: ", balance);
}

truFaucet().catch(console.error);