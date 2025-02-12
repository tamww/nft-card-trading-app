import {
  Space, Typography, Divider
} from 'antd';
import "./landingPage.css"
import CardListing from '../../components/cardListing/cardListing';
import {useReadContract,useAccount  } from 'wagmi'
import { hardhat } from 'wagmi/chains';
import pokeAuctionABI from "../../components/etherConnect/PokeAuctionABI.json"
import pokeMetadataABI from "../../components/etherConnect/PokeMetadataABI.json"
import { ethers } from 'ethers';
/*alias for better representation*/
const {Text} = Typography


export default function LandingPage () {

  // const provider = ethers.getDefaultProvider();
  // const balance = await provider.getBalance(`vitalik.eth`);
  // console.log(`ETH Balance of vitalik: ${ethers.utils.formatEther(balance)} ETH`);
  const abi = JSON.parse(JSON.stringify(pokeMetadataABI))
  // const { address } = useAccount();
  const result = useReadContract({
              address: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
              abi,
              chainId: hardhat.id,
              // functionName: 'getTotalSupply',
              functionName: () => "getTotalSupply",
              args: ["true"],
              // enabled: !!address,
          })
  console.log(result)


  // if (error) console.error("Wagmi error:", error);
  const ethereum = window.ethereum;

  ethereum
    .request({ method: "eth_chainId" })
    .then((chainId) => {
      console.log(`hexadecimal string: ${chainId}`);
      console.log(`decimal number: ${parseInt(chainId, 16)}`);
    })
    .catch((error) => {
      console.error(`Error fetching chainId: ${error.code}: ${error.message}`);
    });
  

  return (
      // <div style={{height:"5000px", backgroundColor:"grey"}}>
      //   test
      // </div>
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