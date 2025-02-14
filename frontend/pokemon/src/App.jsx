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

import {
  Mainnet,
  Hardhat,
  Localhost,
  MetaMask,
  WagmiWeb3ConfigProvider,
  WalletConnect,
} from '@ant-design/web3-wagmi';
import { QueryClient } from '@tanstack/react-query';
import { createConfig, http } from 'wagmi';
import { mainnet, hardhat } from 'wagmi/chains';
import { walletConnect, injected } from 'wagmi/connectors';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      experimental_prefetchInRender: true,
    },
  },
});

const config = createConfig({
    chains: [
        mainnet, 
        // goerli, 
        hardhat],
      transports: {
        // [mainnet.id]: http(),
        // [goerli.id]: http(),
        [hardhat.id]: http("http://127.0.0.1:8545/"),
      },
      connectors: [
        injected({
          target: "metaMask",
        }),
        walletConnect({
          projectId: "c07c0051c2055890eade3556618e38a6",
          showQrModal: false,
        }),
      ],
});
    
const contractInfo = [
    //   {
    //     id: 1,
    //     name: "Ethereum",
    //     contractAddress: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    //   },
    //   {
    //     id: 5,
    //     name: "Goerli",
    //     contractAddress: "0x418325c3979b7f8a17678ec2463a74355bdbe72c",
    //   },
     {
        id: hardhat.id,
        name: "Hardhat",
        contractAddress: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512", // 这里需要替换为你本地部署后获得的地址
    },
];

const { Content, Footer } = Layout;

// console.log(hardhat.id)

function App() {
  // const [count, setCount] = useState(0)
    // {/* <WagmiProvider config={config}> */}
    // {/* <QueryClientProvider client={queryClient}>  */}
    
    // {/* </QueryClientProvider>  */}
    // {/* </WagmiProvider> */}
  return (

    <WagmiWeb3ConfigProvider
      eip6963={{
        autoAddInjectedWallets: true,
      }}
      ens
      config={config}
      chains={[Mainnet, Hardhat]}
      wallets={[
        MetaMask(),
        WalletConnect()
      ]}
      queryClient={queryClient}
    > 
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
              PokeAuction ©{new Date().getFullYear()} Created by Jacky TAM, Zhen YANG
            </Footer>
            <FloatButton.BackTop visibilityHeight={0}/>
          </Layout>
          
        </BrowserRouter>
      </AntdApp>
    </WagmiWeb3ConfigProvider>


  )
}

export default App
