import {
  Tabs, Typography, Divider
} from 'antd';
import "./landingPage.css"
import CardListing from '../../components/cardListing/cardListing';

/*alias for better representation*/
const {Text} = Typography


export default function LandingPage () {
    console.log("entouer")
    return (
      // <div style={{height:"5000px", backgroundColor:"grey"}}>
      //   test
      // </div>
      <div >
        <div className="landing-pic">
          <Text className="landing-title landing-pic-text">PokeAuction</Text>
          <Text className="landing-title landing-pic-text">PokeAuction</Text>
          <Text className="landing-pic-text landing-desc">The best pokemon trading NFT platform</Text>
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
          <div className="closing-background closing-pic"/>
        </div>


      </div>
    )
}