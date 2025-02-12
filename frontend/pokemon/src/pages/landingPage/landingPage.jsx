import {
  Space, Typography, Divider
} from 'antd';
import "./landingPage.css"
import CardListing from '../../components/cardListing/cardListing';
// import { hardhat } from 'wagmi/chains';
// import ABI_PokemonCard from "../../components/etherConnect/ABI_PokemonCard.json"
// import ABI_PokemonMarketplace from "../../components/etherConnect/ABI_PokemonMarketplace.json"
// import { ethers } from 'ethers';
/*alias for better representation*/
const {Text} = Typography


export default function LandingPage () {


  // // if (error) console.error("Wagmi error:", error);
  // const ethereum = window.ethereum;

  // ethereum
  //   .request({ method: "eth_chainId" })
  //   .then((chainId) => {
  //     console.log(`hexadecimal string: ${chainId}`);
  //     console.log(`decimal number: ${parseInt(chainId, 16)}`);
  //   })
  //   .catch((error) => {
  //     console.error(`Error fetching chainId: ${error.code}: ${error.message}`);
  //   });
  

  return (
      <div >
        <div className="landing-pic">
          <Space size="large">
            <div>
              <Text className="landing-title landing-pic-text">PokeAuction</Text>
              <Text className="landing-title landing-pic-text">PokeAuction</Text>
            </div>
            <Text className="landing-pic-text landing-desc">The best pokemon trading NFT platform</Text>
          </Space>
          <div className="landing-down-arrow"></div>
          <div className="landing-background landing-pic"/>
        </div>
        <Divider>.</Divider>
        <div 
          style={{
            // maxWidth:"inherit", 
            // overFlow:"hidden", 
            width:"100%"
            }}>
          <CardListing/>
        </div>
        
        <Divider>.</Divider>
        <div className="closing-pic">
          {/* <div className="closing-background closing-pic"/> */}
        </div>


      </div>
    )
}