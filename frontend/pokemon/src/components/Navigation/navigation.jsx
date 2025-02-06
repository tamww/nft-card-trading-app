import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Menu, Col, Row,
    Typography, Button
} from 'antd';
import EtherConnector from '../etherConnect/etherConnect';
import "./navigation.css";


const { Text } = Typography;

const navItem = [
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
        path:"/main/createOrder"
    },
    {
        key:"4",
        label:"My Card",
        path:"/main/myCard"
    }
]


export default function Navigation (){
    useEffect(()=>{
        if(window.location.pathname !== "/main"){
            var _item = navItem.slice(1).filter(x=> window.location.pathname.startsWith(x.path))[0]
            console.log(_item)
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
        <Row className="navigation-row">
            <Col span={1} className="navigation-col">
                <div className="demo-logo" />
            </Col>
            <Col span={9} className="navigation-col">
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
            <Col span={3} className="navigation-col">
                {/* <EtherConnector/> */}
                <Button>Connect to Wallet</Button>
            </Col>
        </Row>
    )
}