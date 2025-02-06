import { 
    ProCard, StatisticCard
} from '@ant-design/pro-components';
import { 
    Divider, Space, Splitter,
    Collapse, theme, Typography,
    Statistic, Card
} from 'antd';
import { 
    CryptoPrice, NFTImage, NFTCard
} from '@ant-design/web3'
import { useParams } from 'react-router-dom';
import { BitcoinCircleColorful } from '@ant-design/web3-icons';

import fakeData from '../../testingData/fakeNFT.json'

import './detailPage.css'

const nftObj = fakeData[0]
const { Paragraph, Title, Text } = Typography;
const { Countdown } = Statistic;
const deadline = Date.now() + 1000 * 60 * 60 * 24 * 2 + 211 + 1000 * 30; // Dayjs is also OK

export default function CardDetailPage(){
    let { id } = useParams();

    const { token } = theme.useToken();

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


    return(
        <div style={{marginTop:"20px"}}>

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
                    <Title>{nftObj.name}</Title>
                    <Title></Title>
                    {/* <div className="detail-nftCard"> */}
                    <Card style={{width:"300px"}}>
                        <Text style={{fontWeight:"500", fontSize:"20px"}}>{"Time Remain"}</Text><br/>
                        <Text>{"(Hrs : Mins : Secs)"}</Text>
                        <Countdown 
                            value={deadline} 
                            format="HH:mm:ss" 
                        />
                    </Card>

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
                    {/* </div> */}

                </Space>
            </Splitter.Panel>
        </Splitter>


            <Divider/>
        </div>
    )
}