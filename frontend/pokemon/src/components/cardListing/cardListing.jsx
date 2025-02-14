import {useEffect, useState} from 'react'
import { 
    ProCard,ProForm, ProFormText, ProFormSelect, 
    ProFormDigit, ProFormDigitRange
} from '@ant-design/pro-components';
import NCard from "../nftCard/nftCard.jsx";
import {useReadContract,useAccount  } from 'wagmi'
import {
    Divider, Radio, Pagination,
    Button, ConfigProvider, Typography
} from "antd"
import { ReloadOutlined } from '@ant-design/icons';
import { createStyles } from 'antd-style';
import {ethers} from "ethers"
import * as CONSTANT_POKE from "../common/CONSTANT.js"

import "./cardListing.css"

const useStyle = createStyles(({ prefixCls, css }) => ({
    linearGradientButton: css`
      &.${prefixCls}-btn-primary:not([disabled]):not(.${prefixCls}-btn-dangerous) {
        > span {
          position: relative;
        }
  
        &::before {
          content: '';
          background: linear-gradient(135deg, #6253e1, #04befe);
          position: absolute;
          inset: -1px;
          opacity: 1;
          transition: all 0.3s;
          border-radius: inherit;
        }
  
        &:hover::before {
          opacity: 0;
        }
      }
    `,
  }));

const {Title, Text} = Typography

export default function CardListing({userCard, auction, trade}){
    const { address } = useAccount(); // Ensure address is available
    // console.log(POKEMONCARD_CONTRACT)

    const { data: _data, isError, isLoading } = useReadContract(
        // userCard?(
        //     {
        //         address: CONSTANT_POKE.POKEMONCARD_CONTRACT,
        //         abi: CONSTANT_POKE.ABI_POKE_CARD,
        //         chainId: CONSTANT_POKE.HARDHAT_ID,
        //         functionName:"walletOfUserItem", 
        //         enabled: !!address, 
        //         args:[address,true],
        //         // watch:true,
        //     }
        // ):(
            {
                address: CONSTANT_POKE.POKEMONCARD_CONTRACT,
                abi: CONSTANT_POKE.ABI_POKE_CARD,
                chainId: CONSTANT_POKE.HARDHAT_ID,
                functionName: "getAllCards", 
                enabled: !!address, 
                args:[true]
                // watch:true,
            }
    // )
    );
    const [data, setData] = useState([]);
    // Filter state including filtering and sort options.
    const [filters, setFilters] = useState(CONSTANT_POKE.FILTER_OBJ);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 20;

    useEffect(() => {
        if (_data) {
            console.log("Contract data:", _data);
            setData(_data);
        } else {
            setData([]);
        }
        console.log(_data)
    }, [_data]);

    // Update filters when form values change, reset to page 1
    const handleFilterChange = (changedValues, allValues) => {
        setFilters(allValues)
        setCurrentPage(1)
    };

    const resetFilters = () => {
        const reset = CONSTANT_POKE.FILTER_OBJ
        setFilters(reset)
    };

    // Filter the data based on criteria.
    const filteredData = data.filter((item) => {
        // Filter by type
        var typeCheck = true;
        if(trade){
            typeCheck = item.cardStatus === 2
        }else if(auction){
            typeCheck = item.cardStatus === 1
        }else{
            typeCheck = filters.cardStatus != null? item.cardStatus === parseInt(filters.cardStatus) : true;
        }
        // Filter by on sale status.
        var isOnSalecheck = filters.isOnSale != null ? item.isOnSale === filters.isOnSale: true

        // Filter by price range based on startPrice
        let matchesStartPrice = true;
        if (filters.startPriceRange && Array.isArray(filters.startPriceRange)) {
          const [minStart, maxStart] = filters.startPriceRange;
          var sPrice = parseInt(item.startPrice) / CONSTANT_POKE.ONE_ETHER
          matchesStartPrice =
            (minStart != null ? sPrice >= minStart : true) &&
            (maxStart != null ? sPrice <= maxStart : true);
        }

        // Filter by endPrice range.
        let matchesEndPrice = true;
        if (filters.endPriceRange && Array.isArray(filters.endPriceRange)) {
          const [minEnd, maxEnd] = filters.endPriceRange;
          var ePrice = parseInt(item.startPrice) / CONSTANT_POKE.ONE_ETHER
          matchesEndPrice =
            (minEnd != null ? ePrice >= minEnd : true) &&
            (maxEnd != null ? ePrice <= maxEnd : true);
        }
        // console.log(typeCheck)
        // console.log(isOnSalecheck)
        // console.log(matchesStartPrice)
        // console.log(matchesEndPrice)
        if(userCard){
            return item.owner == address && typeCheck && isOnSalecheck && matchesStartPrice && matchesEndPrice;
        }
        return  typeCheck && isOnSalecheck && matchesStartPrice && matchesEndPrice;
    });

    // Sort the filtered data based on selected field and order.
    const sortedData = [...filteredData].sort((a, b) => {
        if (filters.sortField == null){ 
            return 0
        }

        const field = filters.sortField
        const aVal = a[field]
        const bVal = b[field]

        if (aVal < bVal) {
            return filters.sortOrder === 'asc' ? -1 : 1
        }
        if (aVal > bVal) {
            return filters.sortOrder === 'asc' ? 1 : -1
        }
        return 0;
    });

    const totalItems = sortedData.length;
    const paginatedData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    const { styles } = useStyle();

    return(
        <div 
            style={{
                width:userCard?"96vw":"98vw", 
                margin:"0 auto",
                
                // display:"flex"
                marginTop:"20px"
            }}
        >
            <Divider>
                <Title level={3} style={{marginLeft:"5vw"}}>
                {auction?"Only cards with dutch auction are selected here":""}
                {trade?"Only cards with fixed price are selected here":""}
                </Title>
            </Divider>
            <ProCard 
                split="vertical" 
                style={{
                    // backgroundColor:'red'
                    backgroundColor:'transparent',
                }}
                gutter={[8, 8]}
            >
{/* left ant-pro-card-body*/}
                <ProCard 
                    hoverable 
                    colSpan="25%"
                    style={{
                        backgroundColor: "rgba(235, 236, 248, 0.533)",
                        backdropFilter:"blur(30px)",
                        borderRadius:"5px"
                    }}
                    // boxShadow
                >
                    <ProForm
                        layout="vertical"
                        onValuesChange={handleFilterChange}
                        submitter={false}
                        initialValues={filters}
                    >
                        <div style={{ marginBottom: 16 }}>
                        <ConfigProvider
                            button={{
                                className: styles.linearGradientButton,
                            }}
                        >
                            <Button 
                                type="primary" 
                                size="large" 
                                icon={<ReloadOutlined />} 
                                onClick={resetFilters}
                            >
                                Reset Filters
                            </Button>
                        </ConfigProvider>
                        </div>
                        <Divider 
                            variant="dotted"
                            orientation="left"
                        >
                            General Filter
                        </Divider>
                        {auction||trade?"":(
                            <ProFormSelect
                                name="cardStatus"
                                label="Sales Type"
                                placeholder="Select sales type"
                                options={Object.keys(CONSTANT_POKE.SALE_TYPE).map(item=>{
                                    return{
                                        label:CONSTANT_POKE.SALE_TYPE[item],
                                        value:item
                                    }
                                })}
                                allowClear
                            />
                        )}

                        <ProFormSelect
                            name="isOnSale"
                            label="On Sale"
                            placeholder="On sale?"
                            options={[
                                { label: 'Yes', value: true },
                                { label: 'No', value: false },
                            ]}
                            allowClear
                        />
                        <Divider 
                            variant="dotted"
                            style={{
                                borderColor: '#7cb305',
                            }}
                            orientation="left"
                        >
                            Filter By Price Range
                        </Divider>
                        <ProFormSelect
                            name="priceField"
                            label="Price Field"
                            placeholder="Choose price field"
                            options={[
                                { label: 'Start Price', value: 'startPrice' },
                                { label: 'End Price', value: 'endPrice' },
                            ]}
                            allowClear
                        />
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <ProFormDigitRange
                                name="startPriceRange"
                                label="Start Price Range"
                                placeholder={['Min', 'Max']}
                                min={0}
                                max={ethers.MaxUint256}
                                // allowClear
                            />
                            <ProFormDigitRange
                                name="endPriceRange"
                                label="End Price Range"
                                placeholder={['Min', 'Max']}
                                min={0}
                                max={ethers.MaxUint256}
                                // allowClear
                            />
                        </div>
                        <Divider 
                            variant="dotted"
                            style={{
                                borderColor: '#7cb305',
                            }}
                            orientation="left"
                        >
                            Sort By Field
                        </Divider>
                        <ProFormSelect
                            name="sortField"
                            label="Sort By"
                            placeholder="Select sort field"
                            options={[
                                { label: 'Start Time', value: 'startTime' },
                                { label: 'End Time', value: 'endTime' },
                                { label: 'Start Price', value: 'startPrice' },
                                { label: 'End Price', value: 'endPrice' },
                            ]}
                            allowClear
                        />
                        
                        <div style={{ marginTop: 8 }}>
                            <label style={{ marginBottom: 4, display: 'block' }}>Sort Order</label>
                            <Radio.Group
                                value={filters.sortOrder}
                                onChange={(e) =>
                                setFilters((prev) => ({ ...prev, sortOrder: e.target.value }))
                                }
                            >
                                <Radio.Button value="asc">Ascending</Radio.Button>
                                <Radio.Button value="desc">Descending</Radio.Button>
                            </Radio.Group>
                        </div>

                    </ProForm>
                </ProCard>
{/* right ant-pro-card-body*/}
                <ProCard>
                    
                    <div 
                        className="listing-card"
                    >
                        {paginatedData.map((element, index)=>{
                            return(
                                <NCard
                                    key={'nftCard_'+index}
                                    item={element}
                                    dark={false}
                                    viewOnly={userCard}
                                />
                            )
                        })}
                    </div>
                    <div style={{ textAlign: 'center', marginTop: 16 }}>
                        <Pagination
                        current={currentPage}
                        pageSize={pageSize}
                        total={totalItems}
                        onChange={(page) => setCurrentPage(page)}
                        />
                    </div>
                </ProCard>
            </ProCard>
        </div>
    )
}