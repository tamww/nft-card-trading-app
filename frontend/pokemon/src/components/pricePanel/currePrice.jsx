import {useState} from "react"
import {ONE_ETHER} from "../common/CONSTANT.js"
import { 
    Typography
} from 'antd';

const { Text } = Typography;


export default function CurrentPrice(prop){
    let {deal} = prop
    const [price, setPrice] = useState(0)
    function getCurrentPrice(){
        var startPrice = parseInt(deal.startPrice) / ONE_ETHER
        var newPrice = startPrice
        if(deal.saleType ==1){
            var endTime = new Date(parseInt(deal.endTime)*1000)
            var startTime = new Date(parseInt(deal.startTime)*1000)
            var endPrice = parseInt(deal.endPrice) / ONE_ETHER
            if(Date.now()>endTime){
                newPrice = endPrice
            }else if(Date.now()>startTime){
                let timegap = endTime - startTime
                let pricegap = startPrice - endPrice
                newPrice = startPrice - pricegap * (Date.now() - startTime) / timegap
            }else{
                newPrice = startPrice
            }
        }
        setPrice(newPrice)
    }

    setTimeout(getCurrentPrice, 10000);


    return (
        <Text 
        style={{
            // fontWeight:"500", 
            fontSize:"20px",
            marginLeft:"10px"
            }}
    >
        {price.toFixed(5)}
    </Text>
    )
}