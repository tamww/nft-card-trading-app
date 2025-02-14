'use client';
import { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';

import './detailPage.css'

import { 
    ProCard, StatisticCard
} from '@ant-design/pro-components';
import { 
    Divider, Space, Splitter,
    Collapse, theme, Typography,
    Modal, Card, Tag,
    InputNumber, Rate, Button,
    ConfigProvider, notification, Skeleton, 
    Descriptions, Row, Col
} from 'antd';
import { 
    CryptoPrice, NFTImage, NFTCard
} from '@ant-design/web3'

import { BitcoinCircleColorful } from '@ant-design/web3-icons';
import {
    DollarOutlined
} from '@ant-design/icons';
import {useReadContract,useAccount   } from 'wagmi'

import {get_trait} from "../../components/API/APIUtil.js"
import * as CONSTANT_POKE from "../../components/common/CONSTANT.js"
import NameTag from '../../components/common/nameTag.jsx';
import PricePanel from '../../components/pricePanel/pricePanel.jsx';
import PaymentPanel from '../../components/paymentPanel/paymentPanel.jsx';
import DealActionPanel from '../../components/dealActionPanel/dealActionPanel.jsx';
import { useNavigate } from 'react-router-dom';
import TradeHistory from '../../components/eventTracePanel/tradeHistory.jsx';
import UserContext from "../../components/Context/UserContext.js"
import TradeListing from '../../components/eventTracePanel/tradeListing.jsx';
 
const { Paragraph, Title, Text } = Typography;

export default function CardDetailPage(){
    const navigate = useNavigate();
    let { id } = useParams();
    const {address, isPaused, isAdmin} = useContext(UserContext);

    const { token } = theme.useToken();

    const [api, contextHolder] = notification.useNotification();

    const [trait, setTrait] = useState(CONSTANT_POKE.TRAIT_BASE_OBJ)

    const [nftObj, setnftObj] = useState(CONSTANT_POKE.POKEMETADATA_BASE_OBJ)

    const [inputUserPrice, setInputUserPrice] = useState(0)
    const [openModal, setOpenModal] = useState(false)

    const getACardData = useReadContract({
        address: CONSTANT_POKE.POKEMONCARD_CONTRACT,
        abi: CONSTANT_POKE.ABI_POKE_CARD,
        chainId: CONSTANT_POKE.HARDHAT_ID,
        functionName: "getACard", 
        enabled: !!address, 
        args:[id]
    });
    
    // console.log(id)
    // console.log(getACardData)
    // console.log(getACardData.isError)
    // console.log(getACardData.isLoading)

    useEffect(()=>{
        if(getACardData.isSuccess&&getACardData.data.tokenId==0){
            navigate("/main/tokenNotFound")
        }
        if(!getACardData.isLoading && !getACardData.isError){
            setnftObj(getACardData.data);
            api_getTrait(getACardData.data.tokenTraitCID)
            // console.log(userName)
        }
        
    }, [getACardData.data])

    function api_getTrait(url){
        get_trait(url).then(function(res){
          if(res.status >= 200 && res.status < 300 ){
            // console.log(res)
            setTrait(res.data)
          }
        })
      }

    const panelStyleLeft = {
        // marginBottom: 30,
        // background: token.colorFillAlter,
        borderRadius: 10,
        border: 'none',
      };

    const panelStyleRight = {
      marginBottom: 30,
      background: token.colorFillAlter,
      borderRadius: 10,
      border: 'none',
    };

    function getCollapseItemLeft(){
        return [
            {
                key: '1',
                label: 'Description',
                children: <Paragraph>{trait.description}</Paragraph>,
                style: panelStyleLeft
            },
            {
                key: '2',
                label: 'Traits',
                children: (
                <Space direction='vertical'>
                    <div>
                    {(
                        trait.attributes[0]?
                        trait.attributes[0].value.map((item, index)=>{
                            return(
                                <Tag key={'tag_trait'+index} bordered={false} color={(CONSTANT_POKE.TYPE_COLOR)[item]?(CONSTANT_POKE.TYPE_COLOR)[item]:"blue"}>
                                {item}
                                </Tag>
                            )
                        })
                        :(
                            <Tag bordered={false} color="blue">{" No Valid Type "}</Tag>
                        ))}</div>
                    <Descriptions title="">
                        <Descriptions.Item span="filled"  label="HP">
                            {(trait.attributes[3]?trait.attributes[3].value:"0")}
                        </Descriptions.Item>
                        <Descriptions.Item span="filled"  label="Evoluation Stage">
                            {(trait.attributes[1]?trait.attributes[1].value:"-")}
                        </Descriptions.Item>
                        <Descriptions.Item span="filled" label="Evoluation From">
                            {(trait.attributes[2]?trait.attributes[2].value:"N/A")}
                        </Descriptions.Item>
                    </Descriptions>
                </Space>
                  ),
                style: panelStyleLeft
            },
            {
                key: '3',
                label: 'Attacks',
                children: <Row key={'tag_attack_row'} gutter={16} style={{width:"100%"}}>
                {(
                    trait.attributes[6]?
                    trait.attributes[6].value.map((item,index)=>{
                        return(
                            <Col key={'tag_attack_col_'+index} span={12}>
                            <Card key={'tag_attack_'+index} title="" bordered={true}>
                            <Descriptions title={item.Name}>
                                <Descriptions.Item span="filled"  label="Points">
                                    {item.Points}
                                </Descriptions.Item>
                                <Descriptions.Item span="filled"  label="Effect">
                                    {item.Effect}
                                </Descriptions.Item>
                            </Descriptions>
                            </Card>
                            </Col>
                        )
                    })
                    :(
                        <Col span={12}><Card bordered={false} title="">-</Card></Col>

                    ))}</Row>,
                style: panelStyleLeft
            }
        ]
    }

    function getCollapseItemRight(){
        return [
            {
                key: '1',
                label: 'Price History',
                children: <TradeHistory incomeId={id}/>,
                style: panelStyleRight
            },
            {
                key: '2',
                label: 'Order History',
                children: <TradeListing incomeId={id}/>,
                style: panelStyleRight
            }
        ]
    }

    function updateInputUserPrice(price){
        setInputUserPrice(price)
    }

    function modalControl(state){
        setOpenModal(state)
    }

    return(
        <div style={{marginTop:"5px"}}>
            
        <div style={{marginTop:"-20px", height:"20px", backgroundColor:"whitesmoke"}}/>
        {contextHolder}
        {getACardData.isLoading?(
            <Skeleton active />
        ):(
                <Splitter
                style={{
                // height: 200,
                    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
                    backgroundColor:"white"
                }}
            >
                <Splitter.Panel defaultSize="40%" min="20%" max="70%">
                    <Space 
                        direction="vertical" 
                        size="small" 
                        style={{ 
                            display: 'flex', 
                            width:"100%",
                            justifyContent:'center',
                        }}
                    >
                        <div className="detail-nftCard-holder">
                            <Space 
                                direction="vertical" 
                                size="small" 
                                style={{ 
                                    display: 'flex', 
                                    width:"100%",
                                    justifyContent:'center',
                                }}
                            >
                        
                                <BitcoinCircleColorful style={{padding:"10px",fontSize:"40px"}}/>
    
                                <NFTImage
                                    className="detail-nftCard"
                                    src={nftObj.tokenImageCID}
                                    // width={300}
                                />

                            </Space>
                        </div>
                        
                        <Collapse
                            size="large"
                            // bordered={true}
                            // className="detail-collapse"
                            defaultActiveKey={['1', '2', '3']}
                            // expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
                            style={{
                                width:"95%",
                                margin:"0 auto",
                                backgroundColor:"white"
                            }}
                            ghost
                            items={getCollapseItemLeft()}
                        />
                        <br/>
                    </Space>
                </Splitter.Panel>
                <Splitter.Panel>
                    <Space 
                        direction="vertical" 
                        size="large" 
                        style={{ 
                            display: 'flex', 
                            width:"95%",
                            justifyContent:'center',
                            margin:"10px auto"
                        }}
                    >
                        <div>
                            <Text 
                                style={{fontSize:"50px", fontWeight:"20px"}}
                            >
                                {trait.name + " "}
                            </Text>
                            <Tag 
                                bordered={false} 
                                color="processing"
                                style={{fontSize:"30px", lineSize:"30px"}}
                            >
                                {"#" + parseInt(nftObj.tokenId)}
                            </Tag>
                            

                            <br/>
                            <Button color={CONSTANT_POKE.SALE_TYPE_COLOR[nftObj['cardStatus']]} variant="filled">
                                    {CONSTANT_POKE.SALE_TYPE[nftObj['cardStatus']]}
                            </Button>
                            <br/>
                            <br/>
                            <Text
                                style={{fontSize:"15px"}}
                            >
                                {"Owned by "}<NameTag addr={nftObj.owner}/>
                            </Text>
                            
                            <br></br>
                            <br></br>
                            <Text
                                style={{fontSize:"15px", fontWeight:"15px"}}
                            >
                                {"Rarity: "}
                            </Text>
                            <Rate disabled value={trait.attributes[5]?parseInt(trait.attributes[5].value):0} />
                            <br></br>
                            <br></br>
                            <Text
                                style={{fontSize:"15px", fontWeight:"15px"}}
                            >
                                {"Card Number: " + (trait.attributes[4]?trait.attributes[4].value:"000") + "/250"}
                            </Text>
                        </div>
                        {address==nftObj.owner||isAdmin?<DealActionPanel metaData={nftObj}/>:""}
                        {nftObj.cardStatus!=3?(
                            <PricePanel 
                                onlyPrice={false} 
                                id={parseInt(nftObj.tokenId)}
                                updateInputUserPrice={updateInputUserPrice}
                                modalControl={modalControl}
                            />
                        ):""}
    
                        <Collapse
                            size="large"
                            bordered={false}
                            className="detail-collapse"
                            defaultActiveKey={['1']}
                            // expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
                            // style={{
                            //     background: token.colorBgContainer,
                            // }}
                            items={getCollapseItemRight()}
                        />
    
                        <br/>
    
                    </Space>
                </Splitter.Panel>
                </Splitter>

        )}
        {openModal&&inputUserPrice!=0?
            <Modal 
                open={openModal} 
                footer={null} 
                width={"80%"}
                
                onCancel={()=>{modalControl(false)}}
            >
                <div >
                    <PaymentPanel 
                        closeModal={modalControl}
                        idd = {id}
                        userPrice = {inputUserPrice}
                        objTrait={trait}
                    />
                </div>

            </Modal>:""}
        <Divider/>
        </div>
    )
}