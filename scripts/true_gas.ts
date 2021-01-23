/**
 * PRIVATE_KEY={private_key} ts-node scripts/true_gas '{network}'
 *
 * Find empty gas storage slots for TrueCurrencies
 */
import { ethers, providers } from 'ethers'
import { getContract, wait } from './utils'

// write transaction: await wait(...)
// read transaction:  await ...
const TOKEN_AMOUNT = '10'
const SHEEP_LOCATION = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'

const fromBigNumber = (value) => {return ethers.BigNumber.from(value)}
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
  const TAUDAddress = '0x00006100F7090010005F1bd7aE6122c3C2CF0090'
  const TCADAddress = '0x00000100F2A2bd000715001920eB70D229700085'
  const TGBPAddress = '0x00000000441378008EA67F4284A57932B1c000a5'
  const THKDAddress = '0x0000852600ceb001e08e00bc008be620d60031f2'
  const TUSDAddress = '0x0000000000085d4780B73119b644AE5ecd22b376'

  let TAUDSheep = await provider.getStorageAt(TAUDAddress, SHEEP_LOCATION)
  console.log("TAUD remaining sheep slots: ", fromBigNumber(TAUDSheep).toString())
  console.log("Gas Value: ", fromBigNumber(TAUDSheep).mul(39000).toString(), "\n")

  let TCADSheep = await provider.getStorageAt(TCADAddress, SHEEP_LOCATION)
  console.log("TCAD remaining sheep slots: ", fromBigNumber(TCADSheep).toString())
  console.log("Gas Value: ", fromBigNumber(TCADSheep).mul(39000).toString(), "\n")

  let TGBPSheep = await provider.getStorageAt(TGBPAddress, SHEEP_LOCATION)
  console.log("TGBP remaining sheep slots: ", fromBigNumber(TGBPSheep).toString())
  console.log("Gas Value: ", fromBigNumber(TGBPSheep).mul(39000).toString(), "\n")

  let THKDSheep = await provider.getStorageAt(THKDAddress, SHEEP_LOCATION)
  console.log("THKD remaining sheep slots: ", fromBigNumber(THKDSheep).toString())
  console.log("Gas Value: ", fromBigNumber(THKDSheep).mul(39000).toString(), "\n")

  let TUSDSheep = await provider.getStorageAt(TUSDAddress, SHEEP_LOCATION)
  console.log("TUSD remaining sheep slots: ", fromBigNumber(TUSDSheep).toString())
  console.log("Gas Value: ", fromBigNumber(TUSDSheep).mul(39000).toString(), "\n")

  let totalGas = fromBigNumber(TAUDSheep).mul(39000)
    .add(fromBigNumber(TCADSheep).mul(39000))
    .add(fromBigNumber(TGBPSheep).mul(39000))
    .add(fromBigNumber(THKDSheep).mul(39000))
    .add(fromBigNumber(TUSDSheep).mul(39000))
  let totalGasToken = totalGas.div(5125271).mul(140)
  console.log("Total Gas: ", totalGas.toString())
  console.log("Total CHI: ", totalGasToken.toString())
}

gasFarm().catch(console.error)
