
## Backend
1.	First of all, you have install dependencies under directory (ucl_comp0254_as1\backend):
`npm install`
2.	To run the test cases for smart contract, just run the following
`npx hardhat test`
3.	Then you have to firstly kick start the test network in a standalone terminal with:
`npx hardhat node`
4.	There will be a list of account public keys and privates key show up, mark them down for configuring the metamask in later step
5.	After that, you need to deploy the smart contracts into the hardhat test network with:
`npx hardhat run ./ignition/modules/deploy.js --network localhost`

## Configure Wallet
1.	After hosting the backend and fronted, we will need to configure our wallet to be able to intergrate with the functions
2.	You need to install the Metamask wallet as a browser extension: https://metamask.io/
3.	Then you need to configure Metamask to connect to local hardhat testnet by following
- Open Metamask app
- Open Network Configuration Panel and open custom RPC
- Configure RPC URL with http://127.0.0.1:8545, Chain ID: 1339, Currency symbol:ETH
- Click select account and pick “add an account or hardware wallet”. Select the import account choice
- Input the private key you noted down previously when hosting the backend test network. It is recommended to use 2 or 3 accounts. The following accounts are pre-selected as admin role during deployment and recommended to include in your metamask in order to replicate some of the features
    - 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
    - 0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199
    - 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
4.	Then you can enjoy the trading nft pokemon card under http://localhost:5173/main
