import { useState, useEffect } from 'react'
import { 
    NFTImage
} from '@ant-design/web3'
import { HeartFilled, HeartOutlined } from '@ant-design/icons';
import {
    theme, message, Card,
    Button, ConfigProvider, Tag
} from 'antd'

import { createStyles } from 'antd-style';
import { useNavigate } from 'react-router-dom';
import { BitcoinCircleColorful } from '@ant-design/web3-icons';
import {get_trait} from "../API/APIUtil.js"
import * as CONSTANT_POKE from "../common/CONSTANT.js"
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
    let{ item, dark, viewOnly } = prop;
    
    // console.log(item)
    // console.log(dark)
    // console.log(dark?darkAlgorithm:defaultAlgorithm)
    var algo = defaultAlgorithm
    if(dark){
        algo = darkAlgorithm
    }

    const [cardText, setCardText] = useState("Add to Cart")
    const [inCart, setInCart] = useState(false)
    const [trait, setTrait] = useState({
        name: "",
        description: "",
        image: "",
        attributes: []
    })

    const navigate = useNavigate();
    const messagekey = 'updatable';
    const { styles } = useStyle()

    useEffect(()=>{
        api_getTrait(item.tokenTraitCID)
      }, [])
    // api_getTrait(item.tokenTraitCID)
    function api_getTrait(url){
        get_trait(url).then(function(res){
          if(res.status >= 200 && res.status <300 ){
            setTrait(res.data)
          }
        })
      }

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

    function showCardDetail(id){
        navigate("/main/card/"+id, )
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
                    src={item.tokenImageCID}
                />
            }
            actions=
                {!viewOnly?(inCart?(
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
                )):<></>}
        >
            <Meta
                onClick={()=>showCardDetail(parseInt(item.tokenId))}
                // avatar={<Avatar src="https://api.dicebear.com/7.x/miniavs/svg?seed=8" />}
                title={trait.name}
                description={<div style={{ width: "250px", display: "flex", flexWrap: "wrap" }}>
                  {trait.attributes?(
                      trait.attributes[0]?
                      trait.attributes[0].value.map((item, index)=>{
                          return(
                              <Tag key={'tag_trait'+index} bordered={false} color={(CONSTANT_POKE.TYPE_COLOR)[item]?(CONSTANT_POKE.TYPE_COLOR)[item]:"blue"}>
                              {item}
                              </Tag>
                          )
                      })
                      :(
                          <Tag bordered={false} color="blue">{" No Valid Type "}</Tag>
                      )):""}</div>}
            />
        </Card>
        
    </ConfigProvider>
    )
}