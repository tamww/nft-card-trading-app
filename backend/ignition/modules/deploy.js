const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
    let pokemonCard, pokeAuction;
    console.log(">> Deployment start")
    console.log("deploy statement: npx hardhat run ./ignition/modules/deploy.js --network localhost")
    const pokeMetadataContractFactory = await ethers.getContractFactory("PokemonCard");
    const pokeMetadataContract = await pokeMetadataContractFactory.deploy("https://maroon-tricky-firefly-471.mypinata.cloud/ipfs/"); // Pass constructor params (if any)

    pokemonCard = await pokeMetadataContract.getAddress()
    console.log("PokemonCard deployed at \n ", pokemonCard);

    const pokeAuctionContractFactory = await ethers.getContractFactory("PokemonMarketplace");
    const pokeAuctionContract = await pokeAuctionContractFactory.deploy(pokemonCard); // Pass constructor params (if any)

    pokeAuction = await pokeAuctionContract.getAddress();
    console.log("PokemonMarketplace deployed at \n ", pokeAuction);
    console.log("> call setAuctionAddr fun")

    const Factory = await ethers.getContractAt('PokemonCard', pokemonCard)
    await Factory.setAuctionAddr(pokeAuction)
    console.log(">> Deployment done")
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });