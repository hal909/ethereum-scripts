import { Wallet, ethers, ContractFactory } from 'ethers'

// eslint-disable-next-line @typescript-eslint/no-var-requires
export const getContractJSON = (contractName: string) => require(`../abi/${contractName}.json`)

export const getContract = (wallet: ethers.Wallet) => (contractName: string, contractAddress: string) => {
  const contractJson = getContractJSON(contractName)
  return new ethers.Contract(contractAddress, contractJson.abi, wallet)
}