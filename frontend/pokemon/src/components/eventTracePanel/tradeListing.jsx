import React, { useEffect, useState } from 'react';
import { Table, Tag } from 'antd';
import { 
    createPublicClient, 
    http, 
    getContract 
  } from 'viem';
import { mainnet, hardhat } from 'wagmi/chains';
import * as CONSTANT_POKE from "../common/CONSTANT.js"
import {ethers} from "ethers"

// --- Configuration ---
const contractAddress = CONSTANT_POKE.POKEMONAUCTION_CONTRACT;
const contractAbi = CONSTANT_POKE.ABI_POKE_MARKET
const eventName = 'TradeStarted';

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


export default function TradeListing({incomeId}) {
    const [data, setData] = useState([]);

    useEffect(() => {
      async function fetchEvents() {
        const logs = await client.getContractEvents({
            address: contractAddress,
            abi: contractAbi,
            eventName: eventName, 
            fromBlock:0n
        })
        // console.log(logs)

        var objList = logs.map(item=>{
            var obj = {}
            obj['hash'] = item.transactionHash
            obj['blockNumber'] = parseInt(item.blockNumber)
            obj['tokenId'] = parseInt(item.args.tokenId)
            obj['duration'] = parseInt(item['args']['duration'])
            obj['endPrice'] = ethers.formatEther(item['args']['endPrice'])
            obj['endTime'] = parseInt(item['args']['endTime'])
            obj['cardType'] =  item['args']['cardType']
            obj['startTime'] = parseInt(item['args']['startTime'])
            obj['startPrice'] = ethers.formatEther(item['args']['startPrice'])
            obj['seller'] = item['args']['seller']
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
  
    // Define table columns. Adjust based on your event's structure.
    const columns = [
      {
        title: 'Token',
        dataIndex: 'tokenId',
        key: 'tokenId',
        render: item=><a href={'/main/card/'+item}>{item}</a>,
        sorter: {
          compare: (a, b) => a.tokenId - b.tokenId,
          multiple: 1,
        },
      },
      {
        title: 'Trade Type',
        dataIndex: 'cardType',
        key: 'cardType',
        render: (item, index)=>(
          <Tag key={'tag_trait'+index} bordered={false} color={(CONSTANT_POKE.SALE_TYPE_COLOR)[item]?(CONSTANT_POKE.SALE_TYPE_COLOR)[item]:"blue"}>
          {(CONSTANT_POKE.SALE_TYPE)[item]}
          </Tag>
        ),
        
      },
      {
        title: 'Seller',
        dataIndex: 'seller',
        key: 'seller',
        render:item=><a>{item.toString()}</a>
      },
      {
        title: 'Open',
        dataIndex: 'startPrice',
        key: 'startPrice',
        sorter: {
          compare: (a, b) => a.startPrice - b.startPrice,
          multiple: 2,
        },
      },
      {
        title: 'Close',
        dataIndex: 'endPrice',
        key: 'endPrice',
        sorter: {
          compare: (a, b) => a.endPrice - b.endPrice,
          multiple: 3,
        },
      },
      {
        title: 'Starting Date',
        dataIndex: 'startTime',
        key: 'startTime',
        sorter: {
          compare: (a, b) => a.startTime - b.startTime,
          multiple: 4,
        },
        render: item=>(new Date(item * 1000)).toLocaleString("en-GB", { timeZone: "UTC" }),
      },
      {
        title: 'Ending Date',
        dataIndex: 'endTime',
        key: 'endTime',
        sorter: {
          compare: (a, b) => a.endTime - b.endTime,
          multiple: 5,
        },
        render: item=>(new Date(item * 1000)).toLocaleString("en-GB", { timeZone: "UTC" }),
      }
    ];
  
    return (
      <div style={{ padding: 20, width:"100%", backgroundColor:"white" }}>

        <Table 
          dataSource={data} 
          columns={columns} 
          pagination={{ pageSize: 10 }} 
          style={{width:incomeId!=undefined?"50vw":"100vw"}} 
          scroll={{ y: 55 * 10 }}
        />
        
      </div>
    );
};

