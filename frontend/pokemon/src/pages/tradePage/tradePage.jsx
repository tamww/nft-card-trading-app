import CardListing from "../../components/cardListing/cardListing";

import "./tradePage.css"

export default function TradePage(){
    return (
        <div 
        style={{
          // maxWidth:"inherit", 
          // overFlow:"hidden", 
          width:"100%"
          }}>
        <CardListing/>
      </div>
    )
}