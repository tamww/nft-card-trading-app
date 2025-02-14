const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
    let pokemonCard, pokeAuction;
    const addressOwner = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
    const [account1, account2, account3, account4] = await ethers.getSigners();
    console.log("Account 1:", account1.address);
    console.log("Account 2:", account2.address);
    console.log("Account 3:", account3.address);
    console.log("Account 4:", account4.address);

    console.log(">> Deployment start")
    console.log("deploy statement: npx hardhat run ./ignition/modules/deploy.js --network localhost")
    const pokeMetadataContractFactory = await ethers.getContractFactory("PokemonCard");
    const pokeMetadataContract = await pokeMetadataContractFactory.deploy("https://maroon-tricky-firefly-471.mypinata.cloud/ipfs/", addressOwner); // Pass constructor params (if any)

    pokemonCard = await pokeMetadataContract.getAddress()
    console.log("PokemonCard deployed at \n ", pokemonCard);

    const pokeAuctionContractFactory = await ethers.getContractFactory("PokemonMarketplace");
    const pokeAuctionContract = await pokeAuctionContractFactory.deploy(pokemonCard, addressOwner); // Pass constructor params (if any)

    pokeAuction = await pokeAuctionContract.getAddress();
    console.log("PokemonMarketplace deployed at \n ", pokeAuction);
    console.log("> call setAuctionAddr fun")

    const pokemonCardFactory = await ethers.getContractAt('PokemonCard', pokemonCard)
    await pokemonCardFactory.setAuctionAddr(pokeAuction)

    console.log("set admin to 0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199")
    await pokemonCardFactory.setAdmin("0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199")
    await pokemonCardFactory.setAdmin("0x70997970C51812dc3A010C7d01b50e0d17dc79C8")

    const pokeAuctionFactory = await ethers.getContractAt('PokemonMarketplace', pokeAuction)
    await pokeAuctionFactory.setAdmin("0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199")
    await pokeAuctionFactory.setAdmin("0x70997970C51812dc3A010C7d01b50e0d17dc79C8")
    // list items
    await pokeAuctionFactory.listItem(1,1,1000,1,5);
    await pokeAuctionFactory.listItem(2,2,20,20,5);
    await pokeAuctionFactory.listItem(3,2,10,10,5);
    await pokeAuctionFactory.listItem(4,1,100,1,24);

    // create price history for token 1
    const tx = await pokeAuctionFactory.connect(account3).executePurchase(3, { 
        value: ethers.parseEther("20")
      });
    await tx.wait();


    const tx3 = await pokeAuctionFactory.connect(account4).executePurchase(2, { 
        value: ethers.parseEther("30")
      });
    await tx3.wait();

    // const tx4 = await pokeAuctionFactory.connect(account4).listItem(2,2,20,20,5);
    // await tx4.wait();

    // const tx2 = await pokeAuctionFactory.connect(account3).listItem(3,2,20,20,5);
    // await tx2.wait();

    // const tx5 = await pokeAuctionFactory.connect(account3).executePurchase(2, { 
    //     value: ethers.parseEther("30")
    //   });
    // await tx5.wait();

    const tx6 = await pokeAuctionFactory.connect(account3).safeWithdraw();
    await tx6.wait();
    // await pokeAuctionFactory.executePurchase([2], {value:"2000"});
    
    console.log(">> Deployment done")
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });