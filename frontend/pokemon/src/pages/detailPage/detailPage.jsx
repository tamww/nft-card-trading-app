import { 
    ProCard, StatisticCard
} from '@ant-design/pro-components';
import { 
    Divider, Space, Splitter,
    Collapse, theme, Typography,
    Statistic, Card, Tag,
    InputNumber, Tooltip, Button,
    ConfigProvider, notification
} from 'antd';

import { 
    CryptoPrice, NFTImage, NFTCard
} from '@ant-design/web3'

import { useParams } from 'react-router-dom';

import { BitcoinCircleColorful } from '@ant-design/web3-icons';
import {
    DollarOutlined
} from '@ant-design/icons';

import { createStyles } from 'antd-style';

import fakeData from '../../testingData/fakeNFT.json'

import './detailPage.css'

const nftObj = fakeData[0]
const { Paragraph, Title, Text } = Typography;
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

export default function CardDetailPage(){
    let { id } = useParams();

    const { token } = theme.useToken();
    const { styles } = useStyle();

    const [api, contextHolder] = notification.useNotification();
    function openNotification(pauseOnHover, type){
      api[type]({
        message: 'Notification Title',
        description:
          'This is the content of the notification. This is the content of the notification. This is the content of the notification.',
        showProgress: true,
        pauseOnHover,
      });
    };



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
                children: <Paragraph>{nftObj.description}</Paragraph>,
                style: panelStyleLeft
            },
            {
                key: '2',
                label: 'Traits',
                children: <Paragraph>{nftObj.description}</Paragraph>,
                style: panelStyleLeft
            },
            {
                key: '3',
                label: 'Details',
                children: <Paragraph>{nftObj.description}</Paragraph>,
                style: panelStyleLeft
            }
        ]
    }

    function getCollapseItemRight(){
        var priceHistory = (
            <StatisticCard
            chartPlacement="right"
            statistic={{
              title: 'Current Best Price',
              value: 112893,
              precision: 2,
              suffix: 'ETH',
              description: (
                <>
                  {/* <Statistic title="周同比" value="6.47%" trend="up" />
                  <Statistic title="月同比" value="6.47%" trend="down" /> */}
                </>
              ),
            }}
            style={{ width: 584 }}
            chart={
              <img
                src="https://gw.alipayobjects.com/zos/alicdn/snEBTn9ax/zhexiantuchang.svg"
                alt="折线图"
                width="100%"
              />
            }
          />
        )
        return [
            {
                key: '1',
                label: 'Price History',
                children: priceHistory,
                style: panelStyleRight
            },
            {
                key: '2',
                label: 'Bids',
                children: <p>sss</p>,
                style: panelStyleRight
            },
            {
                key: '3',
                label: 'Listings',
                children: <p>sss</p>,
                style: panelStyleRight
            }
        ]
    }

    function buyNow(){
        openNotification(true, 'success')
    }


    return(
        <div style={{marginTop:"5px"}}>
            <div style={{marginTop:"-20px", height:"20px", backgroundColor:"whitesmoke"}}/>
        {contextHolder}
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
                                src={nftObj.image}
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
                            {nftObj.name + " "}
                        </Text>
                        <Tag 
                            bordered={false} 
                            color="processing"
                            style={{fontSize:"30px", lineSize:"30px"}}
                        >
                            {"#" + nftObj.key}
                        </Tag>
                        <br/>
                        <Text
                            style={{fontSize:"15px"}}
                        >
                            Owned by
                        </Text>
                    </div>

                    <ProCard
                        split='vertical'
                        bordered
                        headerBordered
                    >
                        <ProCard colSpan="60%">
                            <Text style={{fontWeight:"500", fontSize:"20px"}}>{"Current Best Price"}</Text><br/>
                            <BitcoinCircleColorful />
                            <Text 
                                style={{
                                    // fontWeight:"500", 
                                    fontSize:"20px",
                                    marginLeft:"10px"
                                    }}
                            >
                                {BigInt(nftObj.price).toString()}
                            </Text>
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
                                <Countdown 
                                    value={deadline} 
                                    format="HH:mm:ss" 
                                />
                            </div>

                        </ProCard>

                    </ProCard>


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


        <Divider/>
        </div>
    )
}