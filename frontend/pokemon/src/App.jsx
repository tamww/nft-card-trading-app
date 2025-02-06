// import React, { useState } from 'react'
import './App.css'
import {
  App as AntdApp, Layout, FloatButton
} from 'antd';
// /*import layout after login */
// import Mainlayout from './pages/mainLayout/mainLayout'
import Navigation from './components/Navigation/navigation';
import Routing from './components/router/routing';
import { BrowserRouter } from 'react-router-dom';

const { Content, Footer } = Layout;

function App() {
  // const [count, setCount] = useState(0)

  return (
    <AntdApp>
      <BrowserRouter>
        <Layout style={{ }} className = "layout">
          <div
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 1,
              width: '100%',
              display: 'flex',
              // alignItems: 'center',
              justifyContent:"center",
              height:"40px",
              // backgroundColor:"black"
            }}
          >
            <Navigation/>
          </div>

          <Content
            style={{
              // padding: '40px 0',
              // marginTop:"10px"
              // paddingTop:"30px"
            }}
          >
            <div
              style={{
                // padding: 5,
                minHeight: 500,
                maxWidth:"100vw",
                overFlow:"hidden"
              }}
            >
              <Routing/>
            </div>
          </Content>

          <Footer
            style={{
              textAlign: 'center',
            }}
          >
            Ant Design ©{new Date().getFullYear()} Created by Ant UED
          </Footer>
          <FloatButton.BackTop visibilityHeight={0}/>
        </Layout>
        
      </BrowserRouter>
    </AntdApp>
  )
}

export default App
