import {useState, useEffect, useReducer}  from "react"
import {ONE_ETHER} from "../common/CONSTANT.js"
import { 
    Typography
} from 'antd';
import {useReadContract,useAccount   } from 'wagmi'
import * as CONSTANT_POKE from "../common/CONSTANT.js"
const { Text } = Typography;


export default function CurrentPrice(prop){
    let {deal, curPrice} = prop
    const [price, setPrice] = useState(0)
    // useEffect(()=>{
    //     getCurrentPrice()
    // },[])
    // const [a, forceUpdate] = useReducer(x => x + 1, 0);

    // function getCurrentPrice(){
    //     var startPrice = parseInt(deal.startPrice) / ONE_ETHER
    //     var newPrice = startPrice
    //     if(deal.saleType == 1){
    //         var endTime = new Date(parseInt(deal.endTime)*1000)
    //         var startTime = new Date(parseInt(deal.startTime)*1000)
    //         var endPrice = parseInt(deal.endPrice) / ONE_ETHER
    //         if(Date.now()>endTime){
    //             newPrice = endPrice
    //         }else if(Date.now()>startTime){
    //             let timegap = endTime - startTime
    //             let pricegap = startPrice - endPrice
    //             newPrice = startPrice - pricegap * (Date.now() - startTime) / timegap
    //         }else{
    //             newPrice = startPrice
    //         }
    //     }
    //     setPrice(newPrice)
    //     curPrice(newPrice)
    // }

    // setTimeout(forceUpdate, 15000);

    const { address } = useAccount(); // Ensure address is available

    const getPrice = useReadContract(
        {
            address: CONSTANT_POKE.POKEMONAUCTION_CONTRACT,
            abi: CONSTANT_POKE.ABI_POKE_MARKET,
            chainId: CONSTANT_POKE.HARDHAT_ID,
            functionName: "calculatePrice", 
            enabled: !!address, 
            args:[parseInt(deal.tokenId)],
            // watch:true,
            // structuralSharing: (prev, next) => (prev === next ? prev : next),
            onError(error) {
                console.log('Error', error)
            },
            query: {
                refetchOnWindowFocus: 'always',
                refetchInterval:15000
            }
        }
    );
    useEffect(()=>{
        if(getPrice.data){
            setPrice(parseInt(getPrice.data) / CONSTANT_POKE.ONE_ETHER)
            curPrice(parseInt(getPrice.data) / CONSTANT_POKE.ONE_ETHER)
        }
        // console.log(getPrice)
    },[getPrice.data])

    return (
        <>
        {
            getPrice.isLoading?(
            <Text 
                style={{
                    // fontWeight:"500", 
                    fontSize:"20px",
                    marginLeft:"10px"
                    }}
            >
                {price.toFixed(5)}
                {/* {console.log("udpate jor")} */}
            </Text>
            ):(
                <Text 
                style={{
                    // fontWeight:"500", 
                    fontSize:"20px",
                    marginLeft:"10px"
                    }}
            >
                {price.toFixed(5)}
                {/* {console.log("udpate jor")} */}
            </Text>
            )
        }
        </>
    )
}