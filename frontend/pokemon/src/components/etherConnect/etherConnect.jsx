import { ConnectButton, Connector } from '@ant-design/web3';
import {
  EthersWeb3ConfigProvider,
  MetaMask,
  OkxWallet,
  useEthersProvider,
  useEthersSigner,
} from '@ant-design/web3-ethers';
import { useBlockNumber } from '@ant-design/web3-ethers/wagmi';
import { WalletColorful, WalletWhiteColorful } from '@ant-design/web3-icons';
import { 
  Typography, message, Row, 
  Col, Popover, Button  
} from 'antd';

const AddressPreviewer = () => {
  const provider = useEthersProvider(); // ethers provider
  const signer = useEthersSigner();
  const blockNumber = useBlockNumber();

  return (
    <Typography.Paragraph>
      address: {signer?.address ?? '-'} (at {Number(blockNumber.data)})
    </Typography.Paragraph>
  );
};

export default function EtherConnector(prop) {
  let{ enable } = prop;
  return (
    <div style={{width:"100%", height:"50px", alignItem:"center", display:"flex", justifyContent:"center"}}>
      <EthersWeb3ConfigProvider
        walletConnect={{ projectId: "" }}
        wallets={[MetaMask(), OkxWallet()]}
      >
        <div style={{margin:"0 auto", marginTop:"10px"}}>
          <Connector >
            <Popover content={<AddressPreviewer />}>
            {enable?
              (<ConnectButton 
                  icon={<WalletColorful />}
                  // onConnectClick={(wallet) => {
                  //     message.info(`Connect with ${wallet?.name || 'More'}`);
                  // }}
                  // quickConnect
              />)
              :
              (<Button>Connect to Wallet</Button>)
            }
            

            </Popover>

          </Connector>
        </div>
      </EthersWeb3ConfigProvider>
    </div>

  );
};
