import { HARDHAT_ID } from "./CONSTANT.js"
import {useAccount,useEnsName} from 'wagmi'

export default function NameTag(prop){
    const { address } = useAccount(); // Ensure address is available

    let {addr} = prop;
    const userName = useEnsName({
        address: addr,
        enabled: !!address, 
        blockTag: 'latest',
        chainId: HARDHAT_ID,
    })
    return (
        <a>{userName.data?userName.data:addr}</a>
    )
}