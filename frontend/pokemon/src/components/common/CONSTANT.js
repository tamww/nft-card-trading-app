import ABI_PokemonCard from "../ABI/ABI_PokemonCard.json"
import ABI_PokemonMarketplace from "../ABI/ABI_PokemonMarketplace.json"
import { hardhat } from 'wagmi/chains';

const POKEMONCARD_CONTRACT = import.meta.env.VITE_POKEMONCARD_CONTRACT
const POKEMONAUCTION_CONTRACT = import.meta.env.VITE_POKEMONAUCTION_CONTRACT
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
    tokenTraitCID: ""
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
    ONE_ETHER
    
}