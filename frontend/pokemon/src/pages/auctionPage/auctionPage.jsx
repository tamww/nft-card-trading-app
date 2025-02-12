import CardListing from "../../components/cardListing/cardListing";

import "./auctionPage.css"

export default function AuctionPage(){
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