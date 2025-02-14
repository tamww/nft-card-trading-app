import {
  Space, Typography, Divider
} from 'antd';
import "./landingPage.css"
import CardListing from '../../components/cardListing/cardListing';
/*alias for better representation*/
const {Text} = Typography


export default function LandingPage () {


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
        <Divider>Explore our market</Divider>
        <div 
          style={{
            // maxWidth:"inherit", 
            // overFlow:"hidden", 
            width:"100%"
            }}>
          <CardListing userCard={false} auction={false} trade={false}/>
        </div>
        
        {/* <Divider>End</Divider> */}
        <div className="closing-pic">
          <div className="closing-background closing-pic"/>
        </div>


      </div>
    )
}