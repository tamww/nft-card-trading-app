import React from "react";
import Routing from "../../components/router/routing.jsx"
import Navigation from "../../components/Navigation/navigation.jsx";

import { Layout, Menu } from 'antd';
const { Header, Content, Footer } = Layout;

function Mainlayout(){
    return ( 
        <Layout style={{height:"100vh"}} className = "layout">
            {/* <Header>Header</Header> */}
            
            <Layout>    
                {/* <Navbar/> */}
                <Navigation/>
                <Routing/>
            </Layout>
        </Layout>
    );
}
export default Mainlayout;