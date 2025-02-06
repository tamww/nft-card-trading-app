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
import { Typography, message } from 'antd';

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

export default function EtherConnector() {
  return (
    <EthersWeb3ConfigProvider
      walletConnect={{ projectId: "" }}
      wallets={[MetaMask(), OkxWallet()]}
    >
      <Connector>
        <ConnectButton 
            icon={<WalletColorful />}
            // onConnectClick={(wallet) => {
            //     message.info(`Connect with ${wallet?.name || 'More'}`);
            // }}
            // quickConnect
        />
      </Connector>
      <AddressPreviewer />
    </EthersWeb3ConfigProvider>
  );
};
