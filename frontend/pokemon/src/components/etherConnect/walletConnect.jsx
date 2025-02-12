import { ConnectButton, Connector } from '@ant-design/web3';

export default function EtherConnectorW() {

    return (

      <Connector
        modalProps={{
          mode: 'simple',
        }}
      >
        <ConnectButton />
      </Connector>

  );
};
