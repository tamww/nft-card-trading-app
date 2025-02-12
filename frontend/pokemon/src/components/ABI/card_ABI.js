import ABI_PokemonCard from "./ABI_PokemonCard.json"
import {useReadContract,useAccount  } from 'wagmi'
import { hardhat } from 'wagmi/chains';

const PokemonCardContract = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
const CHAIN_ID = hardhat.id

function card_getTotalSupply(_address){
    const { data: data, isError, isLoading } = useReadContract({
      address: PokemonCardContract,
      abi: ABI_PokemonCard,
      chainId: CHAIN_ID,
      functionName: "getTotalSupply", // ✅ Correct function usage
      enabled: !!_address, // ✅ Only fetch if user is connected
      // args:[true]
    });
  
    return data
}

function card_getAllCards(_address, withoutBurn){
    const { data: data, isError, isLoading } = useReadContract({
      address: PokemonCardContract,
      abi: ABI_PokemonCard,
      chainId: CHAIN_ID,
      functionName: "getAllCards", // ✅ Correct function usage
      enabled: !!_address, // ✅ Only fetch if user is connected
      args:[withoutBurn]
    });
  
    return data
}

export {
  PokemonCardContract
  };