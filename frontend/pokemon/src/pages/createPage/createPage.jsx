import "./createPage.css"
import {
    Button, Typography,
    notification, message, Divider,
    Result, Spin,Alert 
} from "antd"
import { useState, useRef, useContext } from 'react'
import {
    useAccount,
    useWriteContract, useWaitForTransactionReceipt    
  } from 'wagmi'
import * as CONSTANT_POKE from "../../components/common/CONSTANT.js"
import { PinataSDK } from "pinata-web3"
import {
  ProCard, ProFormText,
  ProFormTextArea, StepsForm,
  ProFormUploadButton, ProFormDigit,
  ProFormSelect, ProFormRate, ProFormList
} from '@ant-design/pro-components';
import { useNavigate } from 'react-router-dom';
import UserContext from "../../components/Context/UserContext.js"; 

const waitTime = (time = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};


const {Title, Paragraph, Text} = Typography

const pinata = new PinataSDK({
    pinataJwt: `${CONSTANT_POKE.PINATA_JWT}`,
    pinataGateway: `${CONSTANT_POKE.VITE_GATEWAY}`
  })

export default function CreatePage(){
    const navigate = useNavigate();
    const {address, isPaused, isAdmin} = useContext(UserContext);
    function openNotification(success, type, err){
        if(success){
            notification["success"]({
                message: err,
                placement:"bottomRight",
                duration:5
            });
        }else{
            notification["error"]({
                message: err,
                placement:"bottomRight",
                duration:5
            });
        }
    };


    const [loading, setLoading] = useState(false)
    const { data: hash, error, isPending, writeContract } = useWriteContract();
    const { data: res, isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });
    const [current, setCurrent] = useState(0)
    async function createNFT(e){
        // e.preventDefault()
        // console.log(imageCID)
        // console.log(traitCID)
        if(e==2 && imageCID!=null && traitCID != null){
            setLoading(true)
            writeContract({
                address: CONSTANT_POKE.POKEMONCARD_CONTRACT,
                abi: CONSTANT_POKE.ABI_POKE_CARD,
                functionName: 'mint',
                chainId: CONSTANT_POKE.HARDHAT_ID,
                enabled: !!address, 
                args: [traitCID, imageCID]
            })
        }
        
    }



    // upload data to ipfs
    const formRef = useRef();
    const [selectedFile, setSelectedFile] = useState();
    const [imageCID, setImageCID] = useState();
    const [traitCID, setTraitCID] = useState();

    const fileInputRef = useRef(null);
    const changeHandler = (event) => {
        // console.log(event)
        setSelectedFile(event.fileList?.[0].originFileObj);
    };
    
    async function pinJSONToIPFS(jsonData) {
        // console.log(jsonData)
        try {
          const data = JSON.stringify({      
                pinataContent: jsonData,
                pinataMetadata: {
                    name: jsonData.name+".json"
                },
                pinataOptions:{
                    cidVersion:1
                }
        })
          const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
            method: "POST",
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${CONSTANT_POKE.PINATA_JWT}`,
            },
            body: data,
          });
          const resData = await res.json();
        //   console.log(resData);
          setTraitCID(resData.IpfsHash)
          return true
        } catch (error) {
        //   console.log(error);
          return false
        }
    };
      
    const handleSubmission = async (item) => {
      try {
        // console.log(item)
        if(item != null){
            const upload2 = await pinata.pinJSONToIPFS(item)
            setTraitCID(upload2.IpfsHash)
            // console.log(upload2)
            openNotification(true, "", "Upload Success at " + upload2.Timestamp)
        }else{
            const upload = await pinata.upload.file(selectedFile)
            setImageCID(upload.IpfsHash)
            // console.log(upload)
            openNotification(true, "", "Upload Success at " + upload.Timestamp)
        }
      } catch (error) {
        openNotification(false, "", error)
      }
    };

    // configure attribute by upload json
    const handleUploadJSON = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
          try {
            const json = JSON.parse(evt.target.result);
            formRef.current?.setFieldsValue(json);
            message.success('Form auto-filled from JSON!');
            openNotification(true, "", 'Form auto-filled from JSON!')

          } catch (err) {
            message.error('Invalid JSON file!');
          }
        };
        reader.readAsText(file);
    };

 
    function backHome(vv){
        if(!vv){
            navigate("/main/myCard")
        }else{
            navigate("/main" )
        }
    }

    return(
        <div style={{marginTop:"20px"}}>
            <Title level={4} style={{marginLeft:"10vw"}}>Create your own Pokemon Card to trade</Title>

            <ProCard>
                <StepsForm
                    stepsProps={{
                        direction: 'vertical',
                    }}
                    formRef={formRef}
                    onFinish={async () => {
                        await waitTime(1000);
                        message.success('Complete Submission');
                    }}
                    formProps={{
                        validateMessages: {
                            required: 'Required Filed',
                        },
                    }}
                    submitter={{
                        render: (props) => {
                          if (props.step === 0) {
                            return (
                                <div>
                              <Button type="primary" disabled={!address||isPaused} onClick={() => props.onSubmit?.()}>
                                Configure Attributes {'>'}
                              </Button>
                              <br/>
                              <br/>
                              {!address?
                              <Alert
                                message="Warning"
                                description="Wallet connection is needed to create NFT. "
                                type="warning"
                                showIcon
                                // closable
                                />:""}
                                {isPaused?
                                <Alert
                                    message="Warning"
                                    description="Admin has suspended the platform operation"
                                    type="warning"
                                    showIcon
                                    // closable
                                />:""}
                              </div>
                            );
                          }
              
                          if (props.step === 1) {
                            return [
                              <Button
                                type="primary"
                                key="goToTree"
                                onClick={() => props.onSubmit?.()}
                                disabled={!address}
                              >
                                Mint Token
                              </Button>,
                            ];
                          }
                          return [];
                        },
                      }}
                    onCurrentChange={num=>createNFT(num)}
                >
                     {/* Step 1: Upload Image */}
                    <StepsForm.StepForm
                        name="base"
                        title="Create NFT"
                        stepProps={{
                            description: 'Upload your pokemon card',
                        }}
                        onFinish={async () => {
                            // console.log(formRef.current?.getFieldsValue());
                            await handleSubmission();
                            if(!address){
                                return false
                            }
                            return true;
                        }}
                        
                    >
                        <ProCard
                            title="Configure Image"
                            bordered
                            headerBordered
                            collapsible
                            style={{
                            marginBlockEnd: 16,
                            minWidth: 800,
                            maxWidth: '100%',
                            }}
                        >
                            <ProFormUploadButton
                                title="Click to select image file"
                                name="upload"
                                label="Upload"
                                max={1}
                                fieldProps={{
                                  name: 'file',
                                }}
                                onChange={changeHandler}
                                rules={[{ required: true, message: 'Image is required' }]}
                            />
                        </ProCard>          
                    </StepsForm.StepForm>

                     {/* Step 2: Basic Info */}
                    <StepsForm.StepForm 
                        title="Basic Info"
                        name="basicInfo"
                        stepProps={{
                            description: 'Configure your pokemon card',
                        }}
                        onFinish={async () => {
                            const value = formRef.current?.getFieldsValue()
                            const res = await pinJSONToIPFS(value);
                            return res;
                        }}
                    >
                        <Button onClick={() => fileInputRef.current?.click()}>
                            Upload JSON to auto fill all attributes
                        </Button>
                        {/* Hidden file input for JSON upload */}
                        <input
                            type="file"
                            accept=".json"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleUploadJSON}
                        />
                        <Divider></Divider>
                        <ProCard
                            title="Basic Info"
                            bordered
                            headerBordered
                            collapsible
                            style={{
                            marginBlockEnd: 16,
                            minWidth: 800,
                            maxWidth: '100%',
                            }}
                        >
                            <ProFormText
                                name="name"
                                label="Name"
                                placeholder="Enter NFT name"
                                rules={[{ required: true, message: 'Name is required' }]}
                            />
                            <ProFormTextArea
                                name="description"
                                label="Description"
                                placeholder="Enter NFT description"
                                rules={[{ required: true, message: 'Description is required' }]}
                            />
                        </ProCard>

                        <ProCard
                            title="Attributes"
                            bordered
                            headerBordered
                            collapsible
                            style={{
                            marginBlockEnd: 16,
                            minWidth: 800,
                            maxWidth: '100%',
                            }}
                        >
                            {/* Attribute 1: Type */}
                            <ProFormText name={['attributes', 0, 'trait_type']} initialValue="Type" hidden />
                            <ProFormSelect
                                name={['attributes', 0, 'value']}
                                label="Type"
                                options={Object.keys(CONSTANT_POKE.TYPE_MAP).map((type) => ({ label: type, value: type }))}
                                placeholder="Select one or more types"
                                mode="multiple" // Enable multiple selection
                                rules={[{ required: true, message: 'At least one type is required' }]}
                            />

                            {/* Attribute 2: EvoluationStage */}
                            <ProFormText name={['attributes', 1, 'trait_type']} initialValue="EvoluationStage" hidden />
                            <ProFormDigit
                                name={['attributes', 1, 'value']}
                                label="Evolution Stage"
                                placeholder="Enter evolution stage"
                                min={1}
                                max={3}
                                rules={[{ required: true, message: 'Evolution Stage is required' }]}
                            />

                            {/* Attribute 3: EvoluationFrom */}
                            <ProFormText name={['attributes', 2, 'trait_type']} initialValue="EvoluationFrom" hidden />
                            <ProFormText
                                name={['attributes', 2, 'value']}
                                label="Evolution From"
                                placeholder="Enter evolution from"
                                rules={[{ required: true, message: 'Evolution From is required' }]}
                            />

                            {/* Attribute 4: HP */}
                            <ProFormText name={['attributes', 3, 'trait_type']} initialValue="HP" hidden />
                            <ProFormDigit
                                name={['attributes', 3, 'value']}
                                label="HP"
                                placeholder="Enter HP"
                                min={0}
                                max={999}
                                rules={[{ required: true, message: 'HP is required' }]}
                            />

                            {/* Attribute 5: CardNumber */}
                            <ProFormText name={['attributes', 4, 'trait_type']} initialValue="CardNumber" hidden />
                            <ProFormText
                                name={['attributes', 4, 'value']}
                                label="Card Number"
                                placeholder="Enter card number"
                                rules={[{ required: true, message: 'Card Number is required' }]}
                            />
                            {/* Attribute 6: Rarity */}
                            <ProFormText name={['attributes', 5, 'trait_type']} initialValue="Rarity" hidden />
                            <ProFormRate
                                name={['attributes', 5, 'value']}
                                label="Rarity"
                                fieldProps={{
                                    count: 5, // Number of stars
                                    allowHalf: false, // Allow half-star ratings
                                }}
                                rules={[{ required: true, message: 'Rarity is required' }]}
                            />
                            {/* Attribute 7: Attack (list of objects) */}
                            <ProFormText name={['attributes', 6, 'trait_type']} initialValue="Attack" hidden />
                            <ProFormList
                                name={['attributes', 6, 'value']}
                                label="Attack"
                                initialValue={[{ Name: '', Points: '', Effect: '' }]}
                                copyIconProps={false}
                                creatorButtonProps={{ creatorButtonText: 'Add Attack' }}
                            >
                                <ProFormText name="Name" label="Attack Name" placeholder="Enter attack name" />
                                <ProFormText name="Points" label="Points" placeholder="Enter points" />
                                <ProFormText name="Effect" label="Effect" placeholder="Enter effect" />
                            </ProFormList>
                        </ProCard>
                    </StepsForm.StepForm>

                     {/* Step 3: Mint Coin */}
                    <StepsForm.StepForm
                        name="Mint"
                        title="Mint Token"
                        stepProps={{
                            description: 'Token Creation',
                        }}
                        submitter={false}
                        
                    >
                        {(!isConfirmed || loading)&&!res?(
                        <div style={{width:"60vw"}}>
                            {/* <Button type="primary" key="console" value={2} onClick={e=>createNFT(e)}>
                                           Back Home
                            </Button> */}
                            <Spin style={{width:"100%"}} tip="Creating nft token..." size="large">
                            <div style={{height:"60vh"}}></div>
                            
                            </Spin>
                        </div>
                        ):(
                            !error?(
                                <Result
                                    status="success"
                                    title="NFT created successfully"
                                    extra={
                                        [
                                            <Button type="primary" onClick={()=>backHome(true)}>
                                                Back Home
                                            </Button>,
                                            <Button key="buy" onClick={()=>backHome(false)}>
                                                View My Card
                                            </Button>,
                                        ]
                                    }
                                />
                            ):(
                                <Result
                                    status="error"
                                    title={error.shortmessage}
                                    subTitle={error.message}
                                    extra={
                                        [
                                          <Button type="primary" key="console" onClick={()=>backHome(true)}>
                                           Back Home
                                          </Button>
                                        ]
                                    }
                                >
                                </Result>
                            )
                        )} 
                    </StepsForm.StepForm>
                </StepsForm>
            </ProCard>
        </div>
    )
}