import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Menu, Col, Row,
    Typography, Button, Alert
} from 'antd';
import "./navigation.css";
import EtherConnectorW from '../etherConnect/walletConnect';
import Marquee from 'react-fast-marquee';
import {
    useAccount,
    useReadContract    
  } from 'wagmi'
import * as CONSTANT_POKE from "../common/CONSTANT.js"
import UserContext from '../Context/UserContext.js';
const { Text } = Typography;

const navList = [
    {
        key:"0",
        label:"Home",
        path:"/main"
    },
    {
        key:"1",
        label:"Trade",
        path:"/main/trade"
    },
    {
        key:"2",
        label:"Auction",
        path:"/main/auction"
    },
    {
        key:"3",
        label:"Create Order",
        path:"/main/create"
    },
    {
        key:"4",
        label:"My Card",
        path:"/main/myCard"
    },
    {
        key:"5",
        label:"Admin",
        path:"/main/admin"
    },
]


export default function Navigation (){
    const { address } = useAccount(); // Ensure address is available
    const [navItem, setNavItem] = useState(navList)
    const { data: pausedEvent, isError, isLoading } = useReadContract({
        address: CONSTANT_POKE.POKEMONCARD_CONTRACT,
        abi: CONSTANT_POKE.ABI_POKE_CARD,
        chainId: CONSTANT_POKE.HARDHAT_ID,
        functionName: "paused",
        watch:true
    });
    const { data: isAdmin, isErrorAdmin, isLoadingAdmin } = useReadContract({
        address: CONSTANT_POKE.POKEMONCARD_CONTRACT,
        abi: CONSTANT_POKE.ABI_POKE_CARD,
        chainId: CONSTANT_POKE.HARDHAT_ID,
        functionName: "isAdmin",
        watch:true,
        args:[address]
      });
    
    useEffect(()=>{
        console.log(isAdmin)
        // if(!isAdmin){
        //     setNavItem(navList.filter(x=>x.label!="Admin"))
        // }
    }, [isAdmin])
    useEffect(()=>{
        if(window.location.pathname !== "/main"){
            var _item = navItem.slice(1).filter(x=> window.location.pathname.startsWith(x.path))[0]
            // console.log(_item)
            if(_item){
                setMenuKey([_item.key])
            }else{
                setMenuKey([])
            }
            
        }else{
            setMenuKey(['0'])
        }

    },[window.location.pathname])

    const [menuKey, setMenuKey] = useState(['0'])
    const navigate = useNavigate();
    function menuItem(item){
        var _item = navItem.filter(x=> x.key == item.selectedKeys[0])[0]
        // console.log(_item)
        setMenuKey(item.selectedKeys)
        // console.log(_item.path)
        navigate(_item.path)
    }



    return (
        <div>
        <Row className="navigation-row">
            <Col span={1} className="navigation-col">
                <div className="demo-logo" />
            </Col>
            <Col span={6} className="navigation-col">
                <Text className="navigation-title"> PokeAuction</Text>
            </Col>
            <Col span={10} className="navigation-col">
                <Menu
                    theme="light"
                    mode="horizontal"
                    defaultSelectedKeys={['0']}
                    items={navItem}
                    className="navigation-menu"
                    selectedKeys={menuKey}
                    onSelect={item=>{menuItem(item)}}
                />
            </Col>
            <Col span={5} className="navigation-col">
                {/* <EtherConnector enable={false}/> */}
                <EtherConnectorW/>
            </Col>
        </Row>
 
        <Row >
            {!address?<Alert
                banner
                type="info"
                message={
                <Marquee pauseOnHover gradient={false}>
                    Please connect your wallet to enjoy full functions.
                </Marquee>
                }
                closable={true}
                style={{width:"100vw"}}
            />:""}
        </Row>
        <Row>
            {pausedEvent?<Alert
                banner
                type="warning"
                message={
                <Marquee pauseOnHover gradient={false}>
                    The Admin has susupend the market operation. We will keep you updated once resume operation.
                </Marquee>
                }
                closable={true}
                style={{width:"100vw"}}

            />:""}
        </Row>
        </div>
    )
}