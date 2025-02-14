
import {useEffect, useContext, useState} from "react"
import { 
    ProForm, ProFormSelect, ProFormDigit, 
    ProFormSwitch, ProCard, ProFormMoney,
    ProFormSegmented
} from '@ant-design/pro-components';
import {
    Divider, Typography, Button,
    Drawer, Space, Form,
    Spin, Result, message,
    Popconfirm 
} from "antd"
import * as CONSTANT_POKE from "../common/CONSTANT.js"
import {useReadContract, useAccount, useWriteContract, useWaitForTransactionReceipt   } from 'wagmi'
import { BitcoinCircleColorful } from '@ant-design/web3-icons';
import {ethers} from "ethers";
import UserContext from "../Context/UserContext.js"

const {Title, Text, Paragraph} = Typography

export default function DealActionPanel(prop){
    let { metaData } = prop
    const {address, isPaused, isAdmin} = useContext(UserContext);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingCreate, setLoadingCreate] = useState(false)
    const [newEndDate,setNewEndDate] = useState(new Date())
    const [showEndPrice, setShowEndPrice] = useState(true)
    const [form] = Form.useForm();
    const [ops, setOps] = useState(0)
    const { data: hash, error, isPending, writeContract } = useWriteContract();
    const { data: res, isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

    const [popYes, setPopYes] = useState(false)
    const [loadingYes, setLoadingYes] = useState(false)


    const showLoading = () => {
      setOpen(true);
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
      }, 500);
    };

    const handleFinish = async (values) => {
        // console.log('Form Values:', values);
        setLoadingCreate(true)
        setOps(1)
        writeContract({
            address: CONSTANT_POKE.POKEMONAUCTION_CONTRACT,
            abi: CONSTANT_POKE.ABI_POKE_MARKET,
            functionName: 'listItem',
            chainId: CONSTANT_POKE.HARDHAT_ID,
            enabled: !!address, 
            args: [
                metaData.tokenId, 
                values.saleType, 
                values.startPrice, 
                values.saleType==2?values.startPrice:values.endPrice, 
                values.duration 
            ]
        }) 
      };
    // console.log(metaData)

    const adjustPanel = async (values, event) =>{
        setShowEndPrice(values==1)
    }

    const formatText = async(value) =>{
        var newEndDay = new Date(Date.now() + value * (60 * 60 * 1000) )
        setNewEndDate(newEndDay)
    }

    const validateEndPrice = (_, value) => {
        const startPrice = form.getFieldValue('startPrice');
        if (value >= startPrice) {
          return Promise.reject(new Error('End Price must be less than Start Price'));
        }
        return Promise.resolve();
      };

    async function cancelSales(){
        setLoadingCreate(true)
        setOps(2)
        writeContract({
            address: CONSTANT_POKE.POKEMONAUCTION_CONTRACT,
            abi: CONSTANT_POKE.ABI_POKE_MARKET,
            functionName: 'cancelListing',
            chainId: CONSTANT_POKE.HARDHAT_ID,
            enabled: !!address, 
            args: [metaData.tokenId]
        }) 
    }

    async function withdrawNow(){
        setLoadingCreate(true)
        setOps(4)
        writeContract({
            address: CONSTANT_POKE.POKEMONAUCTION_CONTRACT,
            abi: CONSTANT_POKE.ABI_POKE_MARKET,
            functionName: 'emergencyWithdraw',
            chainId: CONSTANT_POKE.HARDHAT_ID,
            enabled: !!address, 
            args: [metaData.tokenId]
        }) 
    }

    const [messageApi, contextHolder] = message.useMessage();

    const successMessage = (mess) => {
        messageApi.open({
          type: 'success',
          content: mess,
        });
    };

    const errorMessage = (err) => {
        messageApi.open({
            type: 'error',
            content: err.shortmessage,
        });
    };

    useEffect(()=>{
        if(isConfirmed){
            setLoadingCreate(false)
            openYesCancel()
            if(metaData.cardStatus==1||metaData.cardStatus==2){
                successMessage('Trade Cancelled')
            }
            if(metaData.cardStatus==0&&ops==3){
                successMessage('NFT Burned')
            }
            if(isAdmin&&ops==4){
                successMessage('Withdraw successfully')
            }
            setTimeout(() => {
                setOpen(false);
                window.location.reload();
            },1000);
        }
        if(error){
            setLoadingCreate(false)
            openYesCancel()
            errorMessage(error)
            // console.log(error)
            setTimeout(() => {
                setOpen(false);
                window.location.reload();
            }, 1000);
        }
    },[res, isConfirmed, error])

    const openYes = () => {setPopYes(true)}
    const openYesCancel = () =>{
        setPopYes(false)
        setLoadingYes(false)
    }
    function wihtdrawCard(){
        setLoadingYes(true)
        setOps(3)
        console.log(address)
        writeContract({
            address: CONSTANT_POKE.POKEMONCARD_CONTRACT,
            abi: CONSTANT_POKE.ABI_POKE_CARD,
            functionName: 'burn',
            chainId: CONSTANT_POKE.HARDHAT_ID,
            enabled: !!address, 
            args: [metaData.tokenId, ethers.getAddress(address)]
        }) 
    }

    return (
        <div>
            <Space>
            {/* Admin Action */}
            {((metaData.cardStatus==1||metaData.cardStatus==2)&&isAdmin)?(
                <>
                    <Button color="danger" variant="solid" onClick={withdrawNow}>
                        Emergency Withdraw
                    </Button>
                    {loadingCreate?<Spin fullscreen />:""}
                </>
            ):""}
            {/* Other action */}
            {((metaData.cardStatus==1||metaData.cardStatus==2)&&metaData.owner==address&&metaData.isOnSale)?(
                <>
                    <Button color="danger" variant="dashed" onClick={cancelSales}>
                        Cancel Sales
                    </Button>
                    {loadingCreate?<Spin fullscreen />:""}
                </>
            ):""}
            {/* <Divider/> */}
            {/* Create new trade */}
            {metaData.cardStatus==0&&metaData.owner==address?(
                <>
                <Button color="cyan" variant="solid" onClick={showLoading}>
                    Sell This
                </Button>
                <Popconfirm
                    title="Remove NFT"
                    description="Are you sure to remove this card from market?"
                    open={popYes}
                    onConfirm={wihtdrawCard}
                    okButtonProps={{
                        loading: loadingYes,
                    }}
                    onCancel={openYesCancel}
                >
                    <Button color="red" variant="solid" onClick={openYes}>
                        Withdraw From Market
                    </Button>
                </Popconfirm>
                <Drawer
                    closable
                    destroyOnClose
                    title={<p>Create New Sales</p>}
                    placement="right"
                    open={open}
                    loading={loading}
                    onClose={() => setOpen(false)}
                    
                >

                    {(!loadingCreate&&error)?(
                        <>
                            <Result
                                status="error"
                                title={error.shortmessage}
                                subTitle={error.message}
                            >
                            </Result>
                        </>
                    ):(
                        (!loadingCreate&&isConfirmed)?
                            <>
                                <Result
                                    status="success"
                                    title="Sales created successfully"
                                />
                            </>
                        :(
                            !loadingCreate?(
                                <ProForm
                                // initialValues={CONSTANT_POKE.POKEAUCTION_BASE_OBJ}
                                onFinish={handleFinish}
                                form={form}
                                // onChange={adjustPanel}
                                submitter={{
                                    searchConfig: {
                                    resetText: 'Reset',
                                    submitText: 'Create Now',
                                    }}}
        
                            >
                                <ProFormSegmented
                                    name="saleType"
                                    label="Sale Type"
                                    request={async () => CONSTANT_POKE.SALE_TYPE_LIST}
                                    initialValue={1}
                                    rules={[{ required: true, message: 'At least one type is required' }]}
                                    onChange={adjustPanel}
                                />
                                <ProFormDigit
                                    name="duration"
                                    label="Duration (Days)"
                                    suffix="Hours"
                                    onChange={formatText}
                                    min={0}
                                    max={ethers.MaxUint256}
                                    rules={[{ required: true, message: 'Duration is required' }]}
                                />
                                <Text>{"End day will be: " + newEndDate.toLocaleString("en-GB", { timeZone: "UTC" })}</Text>
                                <Divider/>
                                <ProFormMoney
                                    label="Start Price"
                                    name="startPrice"
                                    initialValue={0.000}
                                    min={0}
                                    max={ethers.MaxUint256}
                                    fieldProps={{ precision: 0 }}
                                    customSymbol="ETH"
                                    rules={[{ required: true, message: 'Start Price is required' }]}
                                />
                                {showEndPrice?
                                    <ProFormMoney
                                        label="End Price"
                                        name="endPrice"
                                        initialValue={0.000}
                                        min={0}
                                        max={ethers.MaxUint256}
                                        fieldProps={{ precision: 0 }}
                                        customSymbol="ETH"
                                        rules={[
                                            { required: true, message: 'End Price is required' },
                                            { validator: validateEndPrice },
                                        ]}
                                    />
                                :""}
                                </ProForm>
                            ):(
                                <Spin style={{width:"100%"}} tip="Creating sales..." size="large">
                                <div style={{height:"20vh"}}></div>
                                </Spin>
                            )
                        )
                    )}
                </Drawer>
                </>
            ):""}
            </Space>
        </div>

    )
}