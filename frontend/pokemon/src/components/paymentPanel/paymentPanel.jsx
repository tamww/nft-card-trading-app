'use client';
import { useState, useEffect } from 'react';
import { 
  message, Button, Space,
  Descriptions, Typography, Badge,
  Steps, Divider, Row,
  Col, InputNumber, Spin,
  Result 
} from 'antd';

import {
  useReadContracts,useAccount,
  useWriteContract, useWaitForTransactionReceipt    
} from 'wagmi'
import {ethers} from "ethers";
import { BitcoinCircleColorful } from '@ant-design/web3-icons';
import { useNavigate } from 'react-router-dom';

import * as CONSTANT_POKE from "../common/CONSTANT.js"

const { Paragraph, Title, Text } = Typography;

const waitTime = (time = 100) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, time);
    });
  };

const contentStyle = {
  padding: 50,
  background: 'rgba(0, 0, 0, 0.05)',
  borderRadius: 4,
};

const content = <div style={contentStyle} />;

export default function PaymentPanel(prop){
    let {closeModal , idd, userPrice, objTrait} = prop
    const navigate = useNavigate();
    const [curPrice, setCurPrice] = useState(0)
    const [inputPrice, setIntPrice] = useState(userPrice)
    // const [inputDeal, setInputDeal] = useState(deal)
    const [trait, setTrait] = useState(objTrait)
    const { address } = useAccount(); // Ensure address is available
    const [auctionObj, setAuctionObj] = useState(CONSTANT_POKE.POKEAUCTION_BASE_OBJ)
    const [item, setItem] = useState(null)
    const [current, setCurrent] = useState(0);
    const next = () => {
      setCurrent(current + 1);
    };
    const prev = () => {
      setCurrent(current - 1);
    };

    const getADeal = useReadContracts({      
        contracts:[
          {
            address: CONSTANT_POKE.POKEMONAUCTION_CONTRACT,
            abi: CONSTANT_POKE.ABI_POKE_MARKET,
            chainId: CONSTANT_POKE.HARDHAT_ID,
            functionName: "calculatePrice", 
            enabled: !!address, 
            args:[idd],
            onError(error) {
                console.log('Error', error)
            }
          },
          {
            address: CONSTANT_POKE.POKEMONAUCTION_CONTRACT,
            abi: CONSTANT_POKE.ABI_POKE_MARKET,
            chainId: CONSTANT_POKE.HARDHAT_ID,
            functionName: "getATrade", 
            enabled: !!address, 
            args:[idd],
            onError(error) {
                console.log('Error', error)
            }
          }
        ]}
    );

    // console.log(getADeal)
    useEffect(()=>{
        if(getADeal.data){
            setCurPrice(parseInt((getADeal.data)[0].result) / CONSTANT_POKE.ONE_ETHER)
            setAuctionObj((getADeal.data)[1].result)
        }
        
        // console.log(getPrice)
    },[getADeal.isLoading])

    useEffect(()=>{
      setTrait(objTrait)
      setIntPrice(userPrice)
      getDescObj(objTrait)
    },[objTrait, userPrice])

    function getDescObj(_trait){
      var descObj = []

      if(getADeal.data){
        var _deal = (getADeal.data)[1].result
        var startDate = new Date(parseInt(_deal.startTime )*1000)
        var endDate = new Date(parseInt(_deal.endTime )*1000) 
        descObj = [
          {
            label: 'Token ID',
            children: <Text>{parseInt(_deal.tokenId)}</Text>,
          },
          {
            label: 'Name',
            span: 'filled',
            // span = 2
            children: <Text>{_trait.name}</Text>,
          },
          {
            label: 'Trade Type',
            span: 'filled',
            // span = 2
            children: (
              <Button color={CONSTANT_POKE.SALE_TYPE_COLOR[_deal['saleType']]} variant="filled">
              {CONSTANT_POKE.SALE_TYPE[_deal['saleType']]}
              </Button>
            ),
          },
          {
            label: 'Status',
            span: 'filled',
            // span = 2
            children: ((endDate) > Date.now() && (startDate) <= Date.now())?
            <Badge status="processing" text="On Sales" />:
            <Badge status="default" text="Not On Sale" />,
          },
          {
            label: 'Start Time',
            span: 'filled',
            // span = 3
            children: <Text>{startDate.toLocaleString("en-GB", { timeZone: "UTC" })}</Text>,
          },
          {
            label: 'End Time',
            span: 'filled',
            // span will be 3 and warning for span is not align to the end
            children: <Text>{endDate.toLocaleString("en-GB", { timeZone: "UTC" })}</Text>,
          },
        ]
      }
  
      setItem(descObj)
    }

    const { data: hash, error, isPending, writeContract } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });
    async function confirmPayment(e){
      e.preventDefault();
      next()
       writeContract({
        address: CONSTANT_POKE.POKEMONAUCTION_CONTRACT,
        abi: CONSTANT_POKE.ABI_POKE_MARKET,
        functionName: 'executePurchase',
        // chainId: CONSTANT_POKE.HARDHAT_ID,
        // enabled: !!address, 
        args: [BigInt(idd)], // Only the argument(s) the function expects.
        value:ethers.parseEther(inputPrice.toString())
      })
    }
    
    useEffect(()=>{
      if(isConfirmed&&current==1){
        setCurrent(2)
      }
    }, [isConfirmed, isConfirming])

    function backHome(){
      closeModal(false)
      navigate("/main" )
    }

    return (
        <div style={{height:"50"}}>
        <Steps current={current} items={
          [
            {
              title: 'Confirm Payment',
              content: "",
            },
            {
              title: 'Processing Payment',
              content: "",
            },
            {
              title: 'Payment Result',
              content: "",
            },
          ]
        } />
        <div style={{height:"60vh"}}>
        {current==0?(
          <>
            <Descriptions bordered title="Card Info" items={item} />
            <Divider/>
            <Row>
              <Col span={12}>
                <Text style={{fontWeight:"500", fontSize:"20px"}}>{"Current Price (ETH)"}</Text><br/>
                <BitcoinCircleColorful />
                <Text 
                    style={{
                        // fontWeight:"500", 
                        fontSize:"20px",
                        marginLeft:"10px"
                        }}
                >
                    {curPrice.toFixed(5)}
                    {/* {console.log("udpate jor")} */}
                </Text>
              </Col>
              <Col span={12}>
                <Text style={{fontWeight:"500", fontSize:"20px"}}>{"Price to pay"}</Text><br/>
                  <BitcoinCircleColorful />
                  <InputNumber
                        suffix="ETH"
                        style={{
                            width: '70%',
                            marginLeft:"10px"
                        }}
                        value={inputPrice}
                        onChange={setIntPrice}
                        max={ethers.MaxUint256}
                        min={0}
                  />
              </Col>
            </Row>

            
          </>
        ):""}
        {current==1&&!error?(
          <div >
            <Spin style={{position:"flex"}} tip="Processing Payment..." size="large">
              <div style={{height:"50vh"}}></div>
            </Spin>
          </div>
        ):""}
        {isConfirmed&&current==2? 
          <Result
            status="success"
            title="Payment Success"
            subTitle={"You are now the owner of token #" + parseInt(auctionObj.tokenId)}
          />
        :""}
        {error? 
          
          <Result
            status="error"
            title={error.shortmessage}
            subTitle={error.message}
            
          >
            
          </Result>
        :""}
        </div>
        <div
          style={{
            // marginTop: 24,
          }}
        >
          {current ==0 && (
            <Button type="primary" onClick={confirmPayment}>
              Confirm Payment
            </Button>
          )}
          {current ==2 && (
            <Button type="primary" onClick={backHome}>
              Back to Home
            </Button>
          )}
        </div>
        </div>
    )
}