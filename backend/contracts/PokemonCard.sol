// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
// import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./ERC721URIStorage.sol";

contract PokemonCard is ERC721URIStorage, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    enum SaleType{
        Minted, Dutch, FixedPrice, Burned
    }

    struct Card{
        uint256 tokenId;
        address owner;
        string tokenTraitCID;
        string tokenImageCID;
        bool isOnSale;
        SaleType cardStatus;
    }

    //******************************************************//
    //                      Event                           //
    //******************************************************//
    event MintPokeToken(uint256 indexed id);
    event BurnPokeToken(uint256 indexed id);

    //******************************************************//
    //               Constant and Variables                 //
    //******************************************************//
    uint256 public constant MAX_ELEMENTS = 20000;
    bool public paused = false;
    string public baseTokenURI;
    // uint256 public tokenCounter = 0;
    uint256 public tokenBurned = 0;
    mapping(uint256 => bool) public burnedCoin;
    mapping(uint256 => Card) public pokemonMetadata;

    address private auctionAddr;
    
    //******************************************************//
    //                      Modifier                        //
    //******************************************************//
    modifier marketIsOpen {
        require(!paused, "Market paused.");
        _;
    }

    //******************************************************//
    //                initialization                        //
    //******************************************************//
    // constructor Ownable
    constructor(string memory baseURIS) 
        ERC721("PokemonCard", "PKMN")   // initialize ERC721
        Ownable(msg.sender)             // owner address
    {        
        setBaseURI(baseURIS);
        // https://maroon-tricky-firefly-471.mypinata.cloud/ipfs/
        // tokenCounter = 0;
        tokenBurned = 0;
        _defaultCoin();
    }

    function _defaultCoin() internal onlyOwner{
        // 1.jpg
        mint("bafkreiaimcafbmjkksvecad5e4coyms2k3vnbm63ivvaxt6j4tktsd3ei4",
            "bafybeigywuua7rqcqitqahb3shvnogyau25pnu7pq3luq3gpmeprybiqye");
        // 2.jpg
        mint("bafkreigorg444wyebk46bx3z43zhpv6ljl4hkeokkmhzdd55gzfimgmgxa",
            "bafybeic7b6dyjuvjvvb6v2lkwny2a6penuus2fhhviyksai32fhcomld2e"); 
        // 3.jpg
        mint("bafkreidtoxzzfjriz5gt7trfe6m7pcmhyqu5fjorvvlxyldoelni2yaxg4",
            "bafybeifikmiue25spqy4sbvb3fh56xz4eicto5236heyhwrpgfayzfm5dm");
        // 4.jpg
        mint("bafkreiacxiu3jpsgdet3dos6tgvtzt2c6bdlhlkqxn64udbzx4qfmej4x4",
            "bafybeia3pphj277spnl5jhdy4oa6bzkfsctpc5xrxoaz2fzjyqx6tmju2e"); 
        // 5.jpg
        mint("bafkreiftoqmyraeidouhwfzlr4nstirn47x4ocpevrkm4xpwuzy64atmli",
            "bafybeigfztaqqutt2dgj2e76xmvoljpyvnh4immv7yyjtw3zfofj3xdphi");
        // 6.jpg
        mint("bafkreiasid4s5rocuzlwpsjpbluginzliagyiuk6jybynlmokwf4jcmrra",
            "bafybeih243c34x72v3jxlz56vysp52ujv6yba2uneifcjdpyltany2mk2y"); 
    }

    //******************************************************//
    //                      Mint                            //
    //******************************************************//
    function mint(string memory traitCID, string memory imageCID) public marketIsOpen nonReentrant{
        require(_tokenIdCounter.current() - tokenBurned <= MAX_ELEMENTS, "Mint: Exceed capacity!");
        _safeMintFun(_msgSender(), _tokenIdCounter.current(), traitCID, imageCID);
    }

    /// @notice safe mint
    function _safeMintFun(
        address to,
        uint256 id, 
        string memory traitCID, 
        string memory imageCID
    ) private returns (uint256) {
        // _validateCID(traitCID);
        // _validateCID(imageCID);

        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        
        _safeMint(to, tokenId);
        pokemonMetadata[tokenId] = Card(
            tokenId,
            _msgSender(),
            string(abi.encodePacked(baseTokenURI, traitCID)),
            string(abi.encodePacked(baseTokenURI, imageCID)),
            false,
            SaleType.Minted
        );

        // _setTokenURI(tokenId, string(abi.encodePacked("ipfs://", ipfsCID)));

        burnedCoin[tokenId] = false;

        emit MintPokeToken(id);

        return tokenId;
    }

    /// @notice verify CID
    function _validateCID(string memory cid) private pure {
        bytes memory cidBytes = bytes(cid);
        require(cidBytes.length == 46, "Invalid CID length");
        require(cidBytes[0] == 'Q' && cidBytes[1] == 'm', "Invalid CID prefix");
    }

    //******************************************************//
    //                    Burn                              //
    //******************************************************//
    function burn(uint256 _tokenId, address callerAddr) external virtual {
        require(_msgSender() == auctionAddr && _isApprovedOrOwner(callerAddr, _tokenId), "Not owner nor approved");
        tokenBurned += 1;
        _burn(_tokenId);
        burnedCoin[_tokenId] = true;
        pokemonMetadata[_tokenId].cardStatus = SaleType.Burned;
        pokemonMetadata[_tokenId].owner = address(0);
        emit BurnPokeToken(_tokenId);
    }

    function changeOwnership(address originalOwner, address newOwner, uint256 _tokenID) external marketIsOpen nonReentrant{
        require(_msgSender() == auctionAddr && originalOwner == pokemonMetadata[_tokenID].owner, "invalid owner");
        _safeTransfer(originalOwner, newOwner, _tokenID);
        pokemonMetadata[_tokenID].owner = newOwner;
    }

    function verifyToken(uint256 _tokenID, address callerAddr)external view returns(bool){
        return (callerAddr == pokemonMetadata[_tokenID].owner && !burnedCoin[_tokenID]);
    }

    //******************************************************//
    //                    Getter                            //
    //******************************************************//
    function getAllCards(bool withoutBurn) external view returns (Card[] memory) {
        Card[] memory tokensId = new Card[](_tokenIdCounter.current());
        if(_tokenIdCounter.current() == 0){
            return tokensId;
        }
        uint256 key = 0;
        for (uint256 i = 1; i < _tokenIdCounter.current(); i++) {
            if(withoutBurn && burnedCoin[i]){
                continue;
            }
            tokensId[key] = pokemonMetadata[i];
            key++;
        }

        return tokensId;
    }

    function walletOfUserItem(address _user) external view returns (Card[] memory) {
        uint256 tokenCount = balanceOf(_user);
        Card[] memory tokensId = new Card[](tokenCount);

        if(tokenCount == 0){
            return tokensId;
        }

        uint256 key = 0;
        for (uint256 i = 1; i < MAX_ELEMENTS; i++) {
            if(ownerOf(i) == _user){
                tokensId[key] = pokemonMetadata[i];
                key++;
                if(key == tokenCount){break;}
            }
        }

        return tokensId;
    }

    function walletOfUser(address _user) external view returns (uint256[] memory) {
        uint256 tokenCount = balanceOf(_user);
        uint256[] memory tokensId = new uint256[](tokenCount);

        if(tokenCount == 0){
            return tokensId;
        }

        uint256 key = 0;
        for (uint256 i = 1; i < MAX_ELEMENTS; i++) {
            if(ownerOf(i) == _user){
                tokensId[key] = i;
                key++;
                if(key == tokenCount){break;}
            }
        }

        return tokensId;
    }

    function getACard(uint256 _tokenId) external view returns(Card memory){
        return pokemonMetadata[_tokenId];
    }
    
    function getTotalSupply() public view returns(uint256){
        return _tokenIdCounter.current() - tokenBurned;
    }

    function getCounter() public view returns(uint256){
        return _tokenIdCounter.current();
    }

    function checkBurned(uint256 tokenId) external view returns(bool){
        return burnedCoin[tokenId];
    }

    function getOwner(uint256 tokenId) external view returns(address){
        return pokemonMetadata[tokenId].owner;
    }        

    //******************************************************//
    //                    Setter                            //
    //******************************************************//
    function setPause(bool _toggle) public onlyOwner {
        paused = _toggle;
    }

    function setPauseTrigger(bool _toggle) external {
        require(_msgSender() == auctionAddr, "invalid caller");
        paused = _toggle;
    }

    function setBaseURI(string memory baseURIs) public onlyOwner {
        baseTokenURI = baseURIs;
    }

    function setAuctionAddr(address _auctionAddr) public onlyOwner{
        auctionAddr = _auctionAddr;
    }

    function setSalesStatus(uint256 tokenId, bool _isOnSale, uint256 _cardStatus) external marketIsOpen nonReentrant{
        require(_msgSender() == auctionAddr, "invalid caller");
        pokemonMetadata[tokenId].isOnSale = _isOnSale;
        pokemonMetadata[tokenId].cardStatus = SaleType(_cardStatus);
    }
}
