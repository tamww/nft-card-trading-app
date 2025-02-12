'use client';
import { useEffect, useState } from 'react';
import "./pricePanel.css"

import { createStyles } from 'antd-style';
import { 
    ProCard, StatisticCard
} from '@ant-design/pro-components';
import { 
    Divider, Space, Splitter,
    Collapse, theme, Typography,
    Statistic, Card, Tag,
    InputNumber, Rate, Button,
    ConfigProvider, notification, Skeleton, 
    Descriptions, Row, Col
} from 'antd';

import { BitcoinCircleColorful } from '@ant-design/web3-icons';
import {
    DollarOutlined
} from '@ant-design/icons';
import {useReadContract,useReadContracts,useAccount,useEnsName   } from 'wagmi'

import * as CONSTANT_POKE from "../common/CONSTANT.js"
import CurrentPrice from './currePrice.jsx';

const { Countdown } = Statistic;
const deadline = Date.now() + 1000 * 60 * 60 * 24 * 2 + 211 + 1000 * 30; // Dayjs is also OK

const useStyle = createStyles(({ prefixCls, css }) => ({
    linearGradientButton: css`
      &.${prefixCls}-btn-primary:not([disabled]):not(.${prefixCls}-btn-dangerous) {
        > span {
          position: relative;
        }
  
        &::before {
          content: '';
          background: linear-gradient(135deg, #6253e1, #04befe);
          position: absolute;
          inset: -1px;
          opacity: 1;
          transition: all 0.3s;
          border-radius: inherit;
        }
  
        &:hover::before {
          opacity: 0;
        }
      }
    `,
  }));

const { Paragraph, Title, Text } = Typography;

export default function PricePanel(prop){
    let {onlyPrice, id} = prop
    const { styles } = useStyle();

    const { address } = useAccount(); // Ensure address is available
    const [api, contextHolder] = notification.useNotification();

    // const getADeal = useReadContracts({      
    //     contracts:[
    //         {
    //             address: CONSTANT_POKE.POKEMONAUCTION_CONTRACT,
    //             abi: CONSTANT_POKE.ABI_POKE_MARKET,
    //             chainId: CONSTANT_POKE.HARDHAT_ID,
    //             functionName: "getATrade", // ✅ Correct function usage
    //             enabled: !!address, // ✅ Only fetch if user is connected
    //             args:[id]
    //         },
    //         {
    //             address: CONSTANT_POKE.POKEMONAUCTION_CONTRACT,
    //             abi: CONSTANT_POKE.ABI_POKE_MARKET,
    //             chainId: CONSTANT_POKE.HARDHAT_ID,
    //             functionName: "calculatePrice", // ✅ Correct function usage
    //             enabled: !!address, // ✅ Only fetch if user is connected
    //             args:[id]
    //         }
    //     ]}
    // );
    const getADeal = useReadContract(
        {
            address: CONSTANT_POKE.POKEMONAUCTION_CONTRACT,
            abi: CONSTANT_POKE.ABI_POKE_MARKET,
            chainId: CONSTANT_POKE.HARDHAT_ID,
            functionName: "getATrade", 
            enabled: !!address, 
            args:[id],
            onError(error) {
                console.log('Error', error)
            },
        }
    );

    const getPrice = useReadContract(
            {
                address: CONSTANT_POKE.POKEMONAUCTION_CONTRACT,
                abi: CONSTANT_POKE.ABI_POKE_MARKET,
                chainId: CONSTANT_POKE.HARDHAT_ID,
                functionName: "calculatePrice", 
                enabled: !!address, 
                args:[id],
                watch:true,
                structuralSharing: (prev, next) => (prev === next ? prev : next),
                onError(error) {
                    console.log('Error', error)
                },
            }
    );

    
    const [deal, setDeal] = useState(CONSTANT_POKE.POKEAUCTION_BASE_OBJ)

    useEffect(()=>{
        if(getADeal.data){
            // setPrice(parseInt(getADeal.data.startPrice) / 1000000000000000000)
            setDeal(getADeal.data)
        }
    },[getADeal.data, getPrice])

    // useEffect(()=>{
    //     setPrice(parseInt(getPrice.data) / CONSTANT_POKE.ONE_ETHER )
    // },[getPrice.data])

    function openNotification(pauseOnHover, type){
        api[type]({
          message: 'Notification Title',
          description:
            'This is the content of the notification. This is the content of the notification. This is the content of the notification.',
          showProgress: true,
          pauseOnHover,
        });
      };

    function buyNow(){
        openNotification(true, 'success')
    }

    function createADeal(){

    }

    return(
        <ProCard
        split='vertical'
        bordered
        headerBordered
    >
        <ProCard colSpan="60%">
            <Text style={{fontWeight:"500", fontSize:"20px"}}>{"Current Price (ETH) - update every 10 seconds"}</Text><br/>
            <BitcoinCircleColorful />
            <CurrentPrice deal={deal}/>
            {/* <Text 
                style={{
                    // fontWeight:"500", 
                    fontSize:"20px",
                    marginLeft:"10px"
                    }}
            >
                {price.toFixed(5)}
            </Text> */}
            <Divider/>
            <InputNumber
                suffix="ETH"
                style={{
                    width: '70%'
                }}
            />
            <Divider/>
            <div 
                style={{
                    width:"100%",
                    textAlign:"center"
                }}
            >
                <ConfigProvider
                    button={{
                        className: styles.linearGradientButton,
                    }}
                >
                    <Button 
                        type="primary" 
                        size="large" 
                        icon={<DollarOutlined />}
                        style={{margin:"0 auto"}}
                        onClick={()=>buyNow()}
                    >
                        Make An Offer / Buy Now
                    </Button>

                </ConfigProvider>
            </div>
        </ProCard>
        <ProCard className='detail-card-countdown'>
            <div 
                style={{
                    width:"fit-content",
                    height:"50%",
                    margin:"0 auto",
                    marginTop:"50%"
                }}
            >
                <Text style={{fontWeight:"500", fontSize:"20px"}}>{"Time Remain"}</Text><br/>
                <Text>{"(Hrs : Mins : Secs)"}</Text>
                {deal.isActive?(
                    ((new Date(parseInt(deal.endTime))*1000) > Date.now())?
                    
                    <Countdown 
                        value={new Date(parseInt(deal.endTime))*1000} 
                        format="HH:mm:ss" 
                    />
                    :
                    <div>
                    <br/>
                    <Text>{"Trade ended"}</Text>
                    </div>
                ):(
                    <div>
                    <br/>
                    <Text>{"No ongoing trade / trade ended"}</Text>
                    </div>
                )}

            </div>

        </ProCard>

    </ProCard>
    )
}