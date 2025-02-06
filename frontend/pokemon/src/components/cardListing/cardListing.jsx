import "./cardListing.css"
import { 
    ProCard 
} from '@ant-design/pro-components';


import fakeData from '../../testingData/fakeNFT.json'
import NCard from "../nftCard/nftCard";


export default function CardListing(){
    // console.log(fakeData)
    return(
        <div 
            style={{
                width:"98vw", 
                margin:"0 auto"
                // backgroundColor:'red'
                // display:"flex"
            }}
        >
            <ProCard 
                split="vertical" 
                style={{
                    // backgroundColor:'red'
                }}
            >
                <ProCard hoverable colSpan="25%">
                    Filters
                </ProCard>

                <ProCard         
                    // title="换行"
                    // layout="center"
                    // style={{backgroundColor:"black"}}
                    
                >
                    {/* right ant-pro-card-body*/}
                    <div 
                        className="listing-card"
                    
                    >
                        {fakeData.map((element)=>{
                            return(
                                <NCard
                                    key={'nftCard_'+element.key}
                                    item={element}
                                    dark={false}
                                />
                            )
                        })}
                    </div>

                </ProCard>
            </ProCard>
        </div>
    )
}