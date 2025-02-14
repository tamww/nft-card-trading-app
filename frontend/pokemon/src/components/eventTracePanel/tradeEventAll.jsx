import React, { useEffect, useState } from 'react';
import { List, Collapse, Typography } from 'antd';
import { 
    createPublicClient, 
    http, 
    getContract 
  } from 'viem';
import { mainnet, hardhat } from 'wagmi/chains';
import * as CONSTANT_POKE from "../common/CONSTANT.js"
import {ethers} from "ethers"
import { ProList } from '@ant-design/pro-components';

// --- Configuration ---
const contractAddress = CONSTANT_POKE.POKEMONAUCTION_CONTRACT;
const contractAbi = CONSTANT_POKE.ABI_POKE_MARKET
const { Panel } = Collapse;
const client = createPublicClient({
    chain: hardhat,
    transport: http("http://127.0.0.1:8545/"),
  });
  
  // Create a contract instance using getContract
const contract = getContract({
    address: contractAddress,
    abi: contractAbi,
    publicClient: client,
});

const {Text} = Typography
export default function TradeEventAll({incomeId}) {
    const [data, setData] = useState([]);

    useEffect(() => {
      async function fetchEvents() {
        const logs = await client.getContractEvents({
            address: contractAddress,
            abi: contractAbi,
            eventName: 'Listings', 
            fromBlock:0n
        })
        // console.log(logs)

        var objList = logs.map(item=>{
            var obj = {}
            obj['hash'] = item.transactionHash
            obj['blockNumber'] = parseInt(item.blockNumber)
            obj['args'] = item['args']
            obj['eventName'] = item['eventName']
            return obj
        })
        if(incomeId!=undefined){
          objList = objList.filter(item=>item.tokenId==incomeId)
        }
        // console.log(objList)
        // console.log(logs)
        setData(objList)
      }
  
      fetchEvents();
    }, []);
  
    return (
      <div style={{ padding: 20, width:"100%", backgroundColor:"white" }}>

        {/* <Table 
          dataSource={data} 
          columns={columns} 
          pagination={{ pageSize: 10 }} 
          style={{width:incomeId!=undefined?"50vw":"100vw"}} 
          scroll={{ y: 55 * 10 }}
        /> */}
        <List
          pagination={{
            position:"both",
            align:'center'
          }}
          dataSource={data}
          renderItem={(item, index) => (
            <List.Item>
              <List.Item.Meta
                title={<a>{"#" + item.blockNumber + " ("+item.eventName +")"}</a>}
                description={<>
                  {Object.keys(item.args).map((obj,indexx)=>{
                    return(<div><Text>{obj+": "}</Text>
                    <Text>{item.args[obj].toString()}</Text></div>)
                    })}
                  </>}
              />
              
            </List.Item>
          )}
        />
      </div>
    );
};

