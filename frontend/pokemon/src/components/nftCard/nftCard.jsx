import { useState } from 'react'
import { 
    CryptoPrice, NFTImage
} from '@ant-design/web3'
import { EditOutlined, HeartFilled, HeartOutlined } from '@ant-design/icons';
import {
    theme, message, Card,
    Button, ConfigProvider
} from 'antd'

import { createStyles } from 'antd-style';
import { useNavigate } from 'react-router-dom';
import { BitcoinCircleColorful } from '@ant-design/web3-icons';
import './nftCard.css'

const { darkAlgorithm, defaultAlgorithm } = theme;
const { Meta } = Card;

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


export default function NCard(prop){
    let{ item, dark } = prop;
    
    // console.log(item)
    // console.log(dark)
    // console.log(dark?darkAlgorithm:defaultAlgorithm)
    var algo = defaultAlgorithm
    if(dark){
        algo = darkAlgorithm
    }

    const [cardText, setCardText] = useState("Add to Cart")
    const [inCart, setInCart] = useState(false)
    const navigate = useNavigate();
    const messagekey = 'updatable';
    const { styles } = useStyle()
    function addToCart(){
        
        if(!inCart){
            setTimeout(() => {
                message.success({ content: 'Added to Cart', messagekey, duration: 2 });
              }, 500);
        }else{
            setTimeout(() => {
                message.success({ content: 'Removed from Cart', messagekey, duration: 2 });
                }, 500);
        }
        setInCart(!inCart)
    }

    function showCardDetail(){
        navigate("/main/card/123")
    }

    return(
    <ConfigProvider 
    button={{
        className: styles.linearGradientButton,
      }}
    >
        <Card
            hoverable
            className="nftCard"
            // title={item.name}
            // style={{ width: 240 }}
            
            cover={
                <NFTImage
                    width={300}
                    src="https://mdn.alipayobjects.com/huamei_mutawc/afts/img/A*9jfLS41kn00AAAAAAAAAAAAADlrGAQ/original"
                />
            }
            actions=
                {inCart?(
                    [
                        <Button key="setting" color="primary" variant="text">Buy Now</Button>,
                        // {inCart?("s"):('s')}
                        <HeartFilled style={{ color: 'hotpink' }} onClick={()=>addToCart()} key="addCart"/>
                    ]
                ):(
                    [
                        <Button key="setting" color="primary" variant="text">Buy Now</Button>,
                        // {inCart?("s"):('s')}
                        <HeartOutlined onClick={()=>addToCart()} key="addCart"/>
                    ]
                )}
        >
            <Meta
                onClick={()=>showCardDetail()}
                // avatar={<Avatar src="https://api.dicebear.com/7.x/miniavs/svg?seed=8" />}
                title={item.name}
                description={<CryptoPrice icon={<BitcoinCircleColorful />} value={BigInt(item.price)} />}
            />
        </Card>
    </ConfigProvider>
        // <Card className='nftCard' hoverable bordered>
        //     <NFTImage
                
        //         width={300}
        //     />

        // </Card>
        // <ProCard >
        // <div
        //     onClick={()=>{showCardDetail()}}
        //     className='nftCard'
        // >
        //     <ConfigProvider theme={{ algorithm:algo }}>
        //         <NFTCard
                    
        //             type="pithy"
        //             // name={item.name}
        //             // tokenId={item.tokenId}
        //             price={{value: item.value}}
        //             // like={{
        //             // totalLikes: 1600,
        //             // }}
        //             // description={item.description}
        //             showAction
        //             actionText={cardText}
        //             onActionClick={()=>{addToCart()}}
        //             // footer={item.footer}
        //             image={item.image}
        //             // style={{margin:"10px"}}
        //         >
                    
        //         </NFTCard>
        //     </ConfigProvider>
        // </div>


    )
}