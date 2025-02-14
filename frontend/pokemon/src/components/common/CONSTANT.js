import ABI_PokemonCard from "../ABI/ABI_PokemonCard.json"
import ABI_PokemonMarketplace from "../ABI/ABI_PokemonMarketplace.json"
import { hardhat } from 'wagmi/chains';

const POKEMONCARD_CONTRACT = import.meta.env.VITE_POKEMONCARD_CONTRACT
const POKEMONAUCTION_CONTRACT = import.meta.env.VITE_POKEMONAUCTION_CONTRACT
const PINATA_PUBLIC_KEY = import.meta.env.VITE_PINATA_API_KEY
const PINATA_PRIVATE_KEY = import.meta.env.VITE_PINATA_API_SECRET
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT
const PINATA_GATEWAY = import.meta.env.VINTE_PINATA_URL
const TYPE_COLOR = {
    Bug:"error",
    Dark:"grey",
    Dragon:"gold",
    Electric:"geekblue",
    Fairy:"gold",
    Fire:"red",
    Flying:"lime",
    Ghost:"cyan",
    Grass:"success",
    Ice:"blue",
    Normal:"processing",
    Poison:"magenta",
    Psychic:"warning",
    Rock:"purple",
    Steel:"black",
    Water:"blue",
}

const TYPE_MAP = {
    Bug:"Bug",
    Dark:"Dark",
    Dragon:"Dragon",
    Electric:"Electric",
    Fairy:"Fairy",
    Fire:"Fire",
    Flying:"Flying",
    Ghost:"Ghost",
    Grass:"Grass",
    Ice:"Ice",
    Normal:"Normal",
    Poison:"Poison",
    Psychic:"Psychic",
    Rock:"Rock",
    Steel:"Steel",
    Water:"Water",
}

const ABI_POKE_CARD = ABI_PokemonCard
const ABI_POKE_MARKET = ABI_PokemonMarketplace

const TRAIT_BASE_OBJ = {
    name: "",
    description: "",
    image: "",
    attributes: []
}

const POKEMETADATA_BASE_OBJ = {
    cardStatus: 0,
    isOnSale: false,
    owner: "",
    tokenId: "",
    tokenImageCID: "",
    tokenTraitCID: "",
    startTime:0,
    endTime:0,
    duration:0,
    startPrice:0,
    endPrice:0,
}

const POKEAUCTION_BASE_OBJ = {
    seller:"",
    saleType:0,
    tokenId:0,
    startTime:0,
    endTime:0,
    duration:0,
    startPrice:0,
    endPrice:0,
    isActive:false
}

const HARDHAT_ID = hardhat.id

const ONE_ETHER = 1000000000000000000

const SALE_TYPE = {
    0:"Minted",
    1:"Dutch Auction",
    2:"Fixed Price Trade",
    3:"Burned"
}

const SALE_TYPE_LIST = [
  { label: "Dutch Auction", value: 1 },
  { label: "Fixed Price Trade", value: 2 },
]

const SALE_TYPE_OBJ = {
  1:"Dutch Auction",
  2:"Fixed Price Trade",
}

const SALE_TYPE_COLOR = {
    0:"primary",
    1:"cyan",
    2:"pink",
    3:"danger"
}

const TRAIT_FILE_OBJ = {
    name: "",
    description: "",
    image: "",
    attributes: [
      {
        trait_type: "Type",
        value:[]
      },
      {
        trait_type: "EvoluationStage",
        value: ""
      },
      {
        trait_type: "EvoluationFrom",
        value: ""
      },
      {
        trait_type: "HP",
        value: ""
      },
      {
        trait_type: "CardNumber",
        value: ""
      },
      {
        trait_type: "Rarity",
        value: ""
      },
      {
        trait_type: "Attack",
        value: [
          {
            Name: "",
            Points: "",
            Effect: ""
          },
          {
            Name: "",
            Points: "",
            Effect: ""
          }
        ]
      }
    ]
  }

const FILTER_OBJ = {
  cardStatus: null,
  isOnSale: null,
  startPriceRange: null, // [min, max]
  endPriceRange: null,   // [min, max]
  sortField: null,
  sortOrder: 'asc',
}

export {
    POKEMONCARD_CONTRACT,
    POKEMONAUCTION_CONTRACT,
    TYPE_COLOR,
    ABI_POKE_CARD,
    ABI_POKE_MARKET,
    TRAIT_BASE_OBJ,
    POKEMETADATA_BASE_OBJ,
    POKEAUCTION_BASE_OBJ,
    HARDHAT_ID,
    ONE_ETHER,
    SALE_TYPE,
    SALE_TYPE_COLOR,
    SALE_TYPE_LIST,
    PINATA_PUBLIC_KEY,
    PINATA_PRIVATE_KEY,
    PINATA_JWT,
    PINATA_GATEWAY,
    TYPE_MAP,
    TRAIT_FILE_OBJ,
    SALE_TYPE_OBJ,
    FILTER_OBJ
}