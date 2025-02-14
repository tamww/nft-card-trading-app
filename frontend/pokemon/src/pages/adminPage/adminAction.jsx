'use client';
import {
    Space, Button,
    Typography, Descriptions, Popconfirm,
    notification, Alert, Badge,
    Input, Tooltip, Row, Col, 
    Collapse, Divider
} from "antd"
import { useState, useContext, useEffect } from 'react'
import {
    useReadContract,useAccount,
    useWriteContract, useWaitForTransactionReceipt    
  } from 'wagmi'
import * as CONSTANT_POKE from "../../components/common/CONSTANT.js"
import UserContext from "../../components/Context/UserContext.js"
import { InfoCircleOutlined, UserOutlined } from '@ant-design/icons';
import {ethers} from "ethers"
import TradeHistory from "../../components/eventTracePanel/tradeHistory.jsx";
import TradeListing from "../../components/eventTracePanel/tradeListing.jsx";
import { useNavigate } from 'react-router-dom';
import TradeEventAll from "../../components/eventTracePanel/tradeEventAll.jsx";

const {Title, Text, Paragraph} = Typography

export default function AdminAction(){
    const {address, isPaused, isAdmin} = useContext(UserContext);
    const navigate = useNavigate();
    useEffect(()=>{
        if(!isAdmin){
            navigate("/main")
        }
    }, [isAdmin])

    const [confirmLoading, setConfirmLoading] = useState(false)
    const [confirmLoadingAdmin, setConfirmLoadingAdmin] = useState(false)

    const { data: hash, error, isPending, writeContract } = useWriteContract();

    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });
    const [adminAddr, setAdminAddr] = useState()

    async function confirmPayment(e){
        e.preventDefault();
        setConfirmLoading(true)
        if(isPaused){
            writeContract({
                address: CONSTANT_POKE.POKEMONAUCTION_CONTRACT,
                abi: CONSTANT_POKE.ABI_POKE_MARKET,
                functionName: 'setPause',
                chainId: CONSTANT_POKE.HARDHAT_ID,
                enabled: !!address, 
                args: [false]
            })
        }else{
            writeContract({
                address: CONSTANT_POKE.POKEMONAUCTION_CONTRACT,
                abi: CONSTANT_POKE.ABI_POKE_MARKET,
                functionName: 'emergencyPause',
                chainId: CONSTANT_POKE.HARDHAT_ID,
                enabled: !!address, 
                // args: [address]
            })
        }
    }

    async function confirmAdmin(e){
        e.preventDefault();
        setConfirmLoadingAdmin(true)
        if(ethers.isAddress(adminAddr)){
            writeContract({
                address: CONSTANT_POKE.POKEMONAUCTION_CONTRACT,
                abi: CONSTANT_POKE.ABI_POKE_MARKET,
                functionName: 'setAdmin',
                chainId: CONSTANT_POKE.HARDHAT_ID,
                enabled: !!address, 
                args: [adminAddr]
            })
        }else{
            handleCancelAdmin()
        }
    }

    function handleCancel(){
        setConfirmLoading(false)
    }

    function handleCancelAdmin(){
        setConfirmLoadingAdmin(false)
    }

    useEffect(()=>{
        if(isConfirmed&& !error){
            setConfirmLoading(false)
            openNotification(true, "success", "Operation Success")
            window.location.reload()
        }
        if(error){
            setConfirmLoading(false)
            openNotification(false, "error", error.message)
            window.location.reload()
        }
    }, [isPending, error, isConfirmed])

    function openNotification(success, type, err){
        if(success){
            notification["success"]({
              message: err,
              placement:"bottomRight",
              duration:5
            });
          }else{
            notification["error"]({
              message: err,
              placement:"bottomRight",
              duration:5
            });
          }
      };

      function updateAddr(e){
        setAdminAddr(e.target.value)
      }

    return(
        <>
            {isAdmin?(
                <div style={{backgroundColor:"white"}}>
                    <Title level={3} style={{marginLeft:"5vw"}}>Admin Actions</Title>
                    <Divider>
                        <Title level={5} style={{marginLeft:"5vw"}}>
                            Basic Actions
                        </Title>
                    </Divider>
                    <Descriptions 
                        bordered title="" 
                        layout="vertical"
                        style={{
                            width:"96vw",
                            margin:"0 auto"
                        }}
                    >
                        <Descriptions.Item span={1} label="Current system status">
                            {!isPaused?
                            <Badge status="processing" text="In operations" />:
                            <Badge status="default" text="Paused" />}
                        </Descriptions.Item>
                        <Descriptions.Item span={2} label="Actions">
                            
                            <Popconfirm
                                title={ !isPaused?"STOP":"RESUME"}
                                description={!isPaused?"Are you sure to pause the system ?":"Are you sure to resume operations ?"}
                                okText="Yes"
                                cancelText="No"
                                onConfirm={confirmPayment}
                                okButtonProps={{
                                    loading: confirmLoading,
                                }}
                                onCancel={handleCancel}
                            >
                                <Button 
                                    color={!isPaused?"danger":"cyan" }
                                    variant="solid" 
                                    disabled={!address}
                                    // open={open}
                                >
                                    {!isPaused?"Emergency Stop":"Resume Operation"}
                                </Button>
                            </Popconfirm>
                        </Descriptions.Item>
                        <Descriptions.Item span={"filled"} label="Add New Admin">
                            <Row style={{width:"100%"}} gutter={[16,16]}>
                                <Col span={10}>
                                    <Space.Compact
                                    style={{
                                        width: '100%',
                                    }}
                                    >
                                        <Input
                                            placeholder="Enter your username"
                                            prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                                            suffix={
                                                <Tooltip title="Extra information">
                                                <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
                                                </Tooltip>
                                            }
                                            value={adminAddr}
                                            onChange={item=>updateAddr(item)}
                                        />
                                        <Popconfirm
                                            title={"Add Admin"}
                                            description={"Are you sure to make "+ adminAddr +" as admin?"}
                                            okText="Yes"
                                            cancelText="No"
                                            onConfirm={confirmAdmin}
                                            okButtonProps={{
                                                loading: confirmLoadingAdmin,
                                            }}
                                            onCancel={handleCancelAdmin}
                                        >
                                            <Button 
                                                color="primary"
                                                variant="solid" 
                                                disabled={!ethers.isAddress(adminAddr)}
                                            >
                                                Add Admin
                                            </Button>
                                        </Popconfirm>
                                    </Space.Compact>
                                </Col>
                                <Col>
                                    {!ethers.isAddress(adminAddr)?<Alert message="Please Input Valid Address" type="error" />:""}                       
                                </Col>
                            </Row>

                        </Descriptions.Item>
                    </Descriptions>
                    <br></br>
                    <Divider>
                        <Title level={5} style={{marginLeft:"5vw"}}>
                            Event Logs
                        </Title>
                    </Divider>
                    <Collapse
                        size="large"
                        bordered={true}
                        className="detail-collapse"
                        defaultActiveKey={['1']}
                        // expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
                        style={{
                            width:"96vw",
                            margin:"0 auto"
                        }}
                        items={[
                            {
                                key: '1',
                                label: 'All Token Price History',
                                children: <TradeHistory />,
                                // style: panelStyleRight
                            },
                            {
                                key: '2',
                                label: 'Trade Open History',
                                children: <TradeListing />,
                                // style: panelStyleRight
                            },
                            {
                                key: '3',
                                label: 'All Other Logs',
                                children: <TradeEventAll />,
                                // style: panelStyleRight
                            }
                        ]}
                    />
                    <Divider></Divider>
                    <br></br>
                </div>
            ):""}
        </>
    )

}