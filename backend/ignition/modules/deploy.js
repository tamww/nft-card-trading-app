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

    const pokemonCardFactory = await ethers.getContractAt('PokemonCard', pokemonCard)
    await pokemonCardFactory.setAuctionAddr(pokeAuction)

    console.log("set admin to 0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199")
    await pokemonCardFactory.setAdmin("0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199")
    const pokeAuctionFactory = await ethers.getContractAt('PokemonMarketplace', pokeAuction)
    await pokeAuctionFactory.setAdmin("0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199")
    await pokeAuctionFactory.listItem(1,1,1000,1,5);
    await pokeAuctionFactory.listItem(2,2,1000,1000,5);

    console.log(">> Deployment done")
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });