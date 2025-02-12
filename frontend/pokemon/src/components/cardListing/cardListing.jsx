import {useEffect, useState} from 'react'
import { 
    ProCard 
} from '@ant-design/pro-components';
import NCard from "../nftCard/nftCard";

import {useReadContract,useAccount  } from 'wagmi'
import { hardhat } from 'wagmi/chains';
import ABI_PokemonCard from "../ABI/ABI_PokemonCard.json"

import "./cardListing.css"

import * as CONSTANT_POKE from "../common/CONSTANT.js"

export default function CardListing(){
    const { address } = useAccount(); // Ensure address is available
    // console.log(POKEMONCARD_CONTRACT)

    const { data: _data, isError, isLoading } = useReadContract({
        address: CONSTANT_POKE.POKEMONCARD_CONTRACT,
        abi: CONSTANT_POKE.ABI_POKE_CARD,
        chainId: CONSTANT_POKE.HARDHAT_ID,
        functionName: "getAllCards", // ✅ Correct function usage
        enabled: !!address, // ✅ Only fetch if user is connected
        args:[false]
    });

    const [data, setData] = useState([]);

    useEffect(()=>{
        if(_data){
            console.log(_data)
            setData(_data)
        }else{
            setData([])
        }
    },[_data])

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
                        {data.map((element, index)=>{
                            return(
                                <NCard
                                    key={'nftCard_'+index}
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