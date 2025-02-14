'use client';
import CardListing from "../../components/cardListing/cardListing"
import "./myCardPage.css"
import {
    Space, Collapse, Button,
    Typography, Descriptions, Popconfirm,
    notification, Alert, Badge
} from "antd"
import { useState, useContext, useEffect } from 'react'
import {
    useReadContract,useAccount,
    useWriteContract, useWaitForTransactionReceipt    
  } from 'wagmi'
import * as CONSTANT_POKE from "../../components/common/CONSTANT.js"
import UserContext from "../../components/Context/UserContext.js"
import AdminAction from "../adminPage/adminAction.jsx";

const {Title, Text, Paragraph} = Typography

export default function MyCardPage(){
    // const { address } = useAccount(); // Ensure address is available
    const {address, isPaused, isAdmin} = useContext(UserContext);
    // console.log(isAdmin)
    const [myCash, setMyCash] = useState(0)
    const [confirmLoading, setConfirmLoading] = useState(false)
    const getMyCash = useReadContract({
            address: CONSTANT_POKE.POKEMONAUCTION_CONTRACT,
            abi: CONSTANT_POKE.ABI_POKE_MARKET,
            chainId: CONSTANT_POKE.HARDHAT_ID,
            functionName: "pendingWithdraw", 
            enabled: !!address, 
            watch:true,
            args:[address],
            onError(error) {
                console.log('Error', error)
            }
    });
    useEffect(()=>{ 
        if(getMyCash.isSuccess){
            setMyCash(parseInt(getMyCash.data)/CONSTANT_POKE.ONE_ETHER)
        }
    }, [getMyCash.data, getMyCash.isSuccess])

    const { data: hash, error, isPending, writeContract } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

    async function confirmPayment(e){
        e.preventDefault();
        setConfirmLoading(true)
        writeContract({
            address: CONSTANT_POKE.POKEMONAUCTION_CONTRACT,
            abi: CONSTANT_POKE.ABI_POKE_MARKET,
            functionName: 'safeWithdraw',
            chainId: CONSTANT_POKE.HARDHAT_ID,
            enabled: !!address, 
            // args: [address]
        })
    }

    function handleCancel(){
        setConfirmLoading(false)
    }

    useEffect(()=>{
        if(isConfirmed&& !error){
            setConfirmLoading(false)
            openNotification(true, "success", "Withdraw Success")
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

    return (
        <div style={{width:"96%", backgroundColor:"white"}}>
            <Space direction="vertical" style={{width:"95%", marginTop:"20px",marginLeft:"1%"}}>
                <Title level={3}>User Info</Title>
                <Descriptions bordered title="" layout="vertical">
                    <Descriptions.Item span={3} label="Address">{address?address:"-"}</Descriptions.Item>
                    <Descriptions.Item span={1} label="Cash Pending Withdraw">{(address?myCash:"-") + " ETH"}</Descriptions.Item>
                    <Descriptions.Item span={2} label="Actions">
                        
                        <Popconfirm
                            title="Withdraw"
                            description={"Are you sure to withdraw all ETHs to this wallet \n ("+address+") ?"}
                            okText="Yes"
                            cancelText="No"
                            onConfirm={confirmPayment}
                            okButtonProps={{
                                loading: confirmLoading,
                            }}
                            onCancel={handleCancel}
                        >
                            <Button 
                                color="primary" 
                                variant="outlined" 
                                disabled={!address}
                                // open={open}
                            >
                                Withdraw all ETHs
                            </Button>
                            <br/>
                            <br/>
                            {!address?
                                <Alert
                                    message="Warning"
                                    description="Wallet connection is needed to withdraw money. "
                                    type="warning"
                                    showIcon
                                    // closable
                            />:""}
                        </Popconfirm>
                    </Descriptions.Item>
                </Descriptions>
                <br/>
                {/* {isAdmin?(
                    <AdminAction/>
                ):<br/>} */}
                <br></br>
                <Title level={3}>My Cards</Title>
                <Collapse
                    collapsible={false}
            
                    defaultActiveKey={['1']}
                    ghost
                    items={[
                        {
                        key: '1',
                        label: '',
                        children: address?<CardListing userCard={true} auction={false} trade={false}/>:(
                            
                            <Alert
                                message="Warning"
                                description={<Title level={4}>Please connect your wallet to view all your cards.</Title>}
                                type="warning"
                                showIcon
                                // closable
                            />
                        ),
                        },
                    ]}
                />
            </Space>
        </div>
    )
}