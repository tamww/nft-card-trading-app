import React, { Component } from 'react';
import { 
    Breadcrumb, Layout, Menu, 
    theme, Col, Row
} from 'antd';
// import EtherConnector from '../etherConnect/ether.jsx'

const { Header, Content, Footer } = Layout;
const items = new Array(3).fill(null).map((_, index) => ({
  key: String(index + 1),
  label: `nav ${index + 1}`,
}));

export default function Navigation (){
    return (
        <Row 
            gutter={[16, 16]}
            style={{
                width:'inherit',
                height:"50px",
                backgroundColor:"red"
                }}
        >
            <Col span={15}>
            <div className="demo-logo" />
            </Col>
            <Col span={6}>
                    <Menu
                        theme="light"
                        mode="horizontal"
                        defaultSelectedKeys={['2']}
                        items={items}
                        style={{
                            height:"inherit",
                            backgroundColor:"transparent",
                        }}
                    />
            </Col>
            <Col span={3}>
                {/* <EtherConnector/> */}
            </Col>

        </Row>
    //     <Header
    //     style={{
    //       position: 'sticky',
    //       top: 0,
    //       zIndex: 1,
    //       width: '100%',
    //       display: 'flex',
    //       alignItems: 'center',
    //     }}
    //   >

    //   </Header>
    )
}