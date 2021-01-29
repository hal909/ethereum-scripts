import { ethers, BigNumber } from 'ethers'

// ts-node scripts/big_number_math.ts


export const floatToBigNumber = (n, precision) =>
    BigNumber.from(
        n.toFixed(precision) * 10**precision)
        .mul(BigNumber.from(10**(18-precision)))


/*
function bn(n) {
    return BigNumber.from(n)
}

function floatToBigNumber(n, precision) {
    const bn = (n) => BigNumber.from(n)
    let d = (n % 1) * 10
    console.log(d)
    return bn(d.toFixed(precision) * 10**(precision - 1))
        .mul(bn(10**(18-precision)))
        .add(bn(Math.floor(d)))
}
*/

// export const bigNumberToFloat = (bn, precision) =>
//     const s = BigNumber.toString(bn)
    // const end = "." + s.substring()
    // BigNumber.toString().substring(0, precision) + "." + x.substring(4, x.length)

    

async function math () {
    let x = floatToBigNumber(5.5, 8)
    console.log(x.toString())
}

math().catch(console.error)