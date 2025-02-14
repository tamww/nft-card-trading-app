import React, { useEffect, useState } from 'react';
import { Table } from 'antd';
import { 
    createPublicClient, 
    http, 
    getContract 
  } from 'viem';
import { mainnet, hardhat } from 'wagmi/chains';
import * as CONSTANT_POKE from "../common/CONSTANT.js"
import {ethers} from "ethers"
import { Line } from '@ant-design/charts';

// --- Configuration ---
const contractAddress = CONSTANT_POKE.POKEMONAUCTION_CONTRACT;
const contractAbi = CONSTANT_POKE.ABI_POKE_MARKET
const eventName = 'TokenSold';

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


export default function TradeHistory({incomeId}) {
    const [data, setData] = useState([]);
    const [dataGraph, setDataGraph] = useState([])

    useEffect(() => {
      async function fetchEvents() {
        const logs = await client.getContractEvents({
            address: contractAddress,
            abi: contractAbi,
            eventName: 'TokenSold', 
            fromBlock:0n
        })
        var priceData = []
        var objList = logs.map(item=>{
            var obj = {}
            obj['hash'] = item.transactionHash
            obj['blockNumber'] = parseInt(item.blockNumber)
            obj['cardType'] = item['args']['cardType']
            obj['newOwner'] = item['args']['newOwner']
            obj['originalOwner'] = item['args']['originalOwner']
            obj['price'] =  ethers.formatEther(item['args']['price'])
            obj['time'] = parseInt(item['args']['time'])
            obj['tokenId'] = parseInt(item['args']['tokenId'])
            var priceObj = {
              time: (new Date((obj['time']) * 1000)).toLocaleString("en-GB", { timeZone: "UTC" }), // convert seconds to milliseconds
              price: parseInt(obj['price']), // Convert to number if necessary
            }
            if((incomeId!=undefined&&obj['tokenId']==incomeId)||incomeId==undefined){

              priceData.push(priceObj)
            }

            return obj
        })
        if(incomeId!=undefined){
          objList = objList.filter(item=>item.tokenId==incomeId)
        }
        // console.log(objList)
        priceData.sort((a, b) => a.time - b.time);
        // console.log(logs)
        setData(objList)
        setDataGraph(priceData)
      }
  
      fetchEvents();
    }, []);
  
    const config = {
        data: dataGraph,
        xField: 'time',
        yField: 'price',
        point: {
          shapeField: 'square',
          sizeField: 4,
        },
        xAxis: {
          type: 'timeCat',
          tickCount: 10,
        },
        yAxis: {
          label: {
            formatter: (v) => parseInt(v),
          },
        },
        // tooltip: {
        //   formatter: (datum) => ({
        //     name: 'Price',
        //     value: datum.price,
        //   }),
        // },
        connectNulls: {
          connect: true,
          connectStroke: '#aaa',
        },
        smooth: true,
        height: 400,
      };

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
        title: 'From',
        dataIndex: 'originalOwner',
        key: 'originalOwner',
      },
      {
        title: 'To',
        dataIndex: 'newOwner',
        key: 'newOwner',
      },
      {
        title: 'Price',
        dataIndex: 'price',
        key: 'price',
        sorter: {
          compare: (a, b) => a.price - b.price,
          multiple: 2,
        },
      },
      {
        title: 'Timestamp',
        dataIndex: 'time',
        key: 'time',
        sorter: {
          compare: (a, b) => a.time - b.time,
          multiple: 3,
        },
        render: item=>(new Date(item * 1000)).toLocaleString("en-GB", { timeZone: "UTC" }),
      }
    ];
  
    return (
      <div style={{ padding: 20, width:"100%", backgroundColor:"white" }}>
        {incomeId!=undefined&&dataGraph.length>0?(
          <><Line {...config} /><br/></>
          ):""}
        
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

