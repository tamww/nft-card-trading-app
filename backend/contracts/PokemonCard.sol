// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./ERC721URIStorage.sol";
// import "hardhat/console.sol";

contract PokemonCard is ERC721URIStorage, Ownable, ReentrancyGuard, AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

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
        uint256 startTime;
        uint256 endTime;
        uint256 duration;
        uint256 startPrice;
        uint256 endPrice;
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
    mapping(address => uint256) public userTokenCount;
    address private auctionAddr;
    address public immutable predefinedOwner;
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
    constructor(string memory baseURIS, address _predefinedOwner) 
        ERC721("PokemonCard", "PKMN")   // initialize ERC721
        Ownable(_predefinedOwner)             // owner address
    {        
        _grantRole(DEFAULT_ADMIN_ROLE, _predefinedOwner); // default admin role
        _grantRole(ADMIN_ROLE, _predefinedOwner);         // set custom ADMIN_ROLE
        predefinedOwner = _predefinedOwner;
        require(_predefinedOwner != address(0), "Invalid owner address");
        
        // Verify ownership initialization
        require(owner() == _predefinedOwner, "Ownership setup failed");
        setApprovalForAll(_predefinedOwner, true);
        setBaseURI(baseURIS);
        // https://maroon-tricky-firefly-471.mypinata.cloud/ipfs/
        // tokenCounter = 0;
        tokenBurned = 0;
        _defaultCoin();
    }

    function _defaultCoin() internal onlyRole(ADMIN_ROLE)  {
        // 1.jpg
        mint("bafkreidav26rjxft3o23zdpgaqskh3prpuqbqiwps56eacfzej7lnrhgje",
            "bafybeigywuua7rqcqitqahb3shvnogyau25pnu7pq3luq3gpmeprybiqye");
        // 2.jpg
        mint("bafkreiezoni2wcimis3sroijaghzswfo57cefvjei5m4qmupbnoqe5f3gy",
            "bafybeic7b6dyjuvjvvb6v2lkwny2a6penuus2fhhviyksai32fhcomld2e"); 
        // 3.jpg
        mint("bafkreidtoxzzfjriz5gt7trfe6m7pcmhyqu5fjorvvlxyldoelni2yaxg4",
            "bafybeifikmiue25spqy4sbvb3fh56xz4eicto5236heyhwrpgfayzfm5dm");
        // 4.jpg
        mint("bafkreiey3ybv4ifeaxf2tmn3u3nowxezn4mzfxfdohc2hvh5n5d5fwwwgm",
            "bafybeia3pphj277spnl5jhdy4oa6bzkfsctpc5xrxoaz2fzjyqx6tmju2e"); 
        // 5.jpg
        mint("bafkreihdzkn6zgq3hpsqcojkmx5jcpq33tfltbgrvbcsjlrq26leizjtue",
            "bafybeigfztaqqutt2dgj2e76xmvoljpyvnh4immv7yyjtw3zfofj3xdphi");
        // 6.jpg
        mint("bafkreihhem5jcvwwuw267lvfejl6xmhvm4f5vvzpic75vtxnntheda2uoe",
            "bafybeih243c34x72v3jxlz56vysp52ujv6yba2uneifcjdpyltany2mk2y"); 
    }

    //******************************************************//
    //                      Mint                            //
    //******************************************************//
    function mint(string memory traitCID, string memory imageCID) public marketIsOpen nonReentrant returns (uint256){
        require(_tokenIdCounter.current() - tokenBurned <= MAX_ELEMENTS, "Mint: Exceed capacity!");
        uint256 coinID = _safeMintFun(_msgSender(), _tokenIdCounter.current(), traitCID, imageCID);
        return coinID;
    }

    /// @notice safe mint
    function _safeMintFun(
        address to,
        uint256 id, 
        string memory traitCID, 
        string memory imageCID
    ) private returns (uint256) {
        _validateCID(traitCID);
        _validateCID(imageCID);

        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        
        _safeMint(to, tokenId);
        pokemonMetadata[tokenId] = Card(
            tokenId,
            _msgSender(),
            string(abi.encodePacked(baseTokenURI, traitCID)),
            string(abi.encodePacked(baseTokenURI, imageCID)),
            false,
            SaleType.Minted,
            0,
            0,
            0,
            0,
            0
        );

        // _setTokenURI(tokenId, string(abi.encodePacked("ipfs://", ipfsCID)));
        burnedCoin[tokenId] = false;
        userTokenCount[msg.sender]++;

        emit MintPokeToken(id);

        return tokenId;
    }

    /// @notice verify CID
    function _validateCID(string memory cid) private pure {
        bytes memory cidBytes = bytes(cid);
        uint256 len;
        uint256 i = 0;
        uint256 bytelength = bytes(cidBytes).length;

        for (len = 0; i < bytelength; len++) {
            bytes1 b = bytes(cid)[i];
            if (b < 0x80) {
                i += 1;
            } else if (b < 0xE0) {
                i += 2;
            } else if (b < 0xF0) {
                i += 3;
            } else if (b < 0xF8) {
                i += 4;
            } else if (b < 0xFC) {
                i += 5;
            } else {
                i += 6;
            }
        }
        // console.log(len);
        require(len == 59, "Invalid CIDv1 length");
        // require(bytes4(cidBytes[0:4]) == bytes4("bafy"), "Invalid CIDv1 prefix");
    }

    //******************************************************//
    //                    Burn                              //
    //******************************************************//
    function burn(uint256 _tokenId, address callerAddr) external virtual nonReentrant {
        require(_isApprovedOrOwner(callerAddr, _tokenId), "Not owner nor approved");
        tokenBurned++;
        _burn(_tokenId);
        burnedCoin[_tokenId] = true;
        pokemonMetadata[_tokenId].cardStatus = SaleType.Burned;
        pokemonMetadata[_tokenId].owner = address(0);
        emit BurnPokeToken(_tokenId);
    }

    function changeOwnership(address originalOwner, address newOwner, uint256 _tokenID) external marketIsOpen nonReentrant{
        require(_msgSender() == auctionAddr, "invalid owner");
        transferFrom(originalOwner, newOwner, _tokenID);
        if(newOwner!=address(auctionAddr)&&originalOwner!=address(auctionAddr)){
            userTokenCount[originalOwner]--;
            userTokenCount[newOwner]++;
        }
        // pokemonMetadata[_tokenID].owner = newOwner;
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
        for (uint256 i = 1; i <= _tokenIdCounter.current(); i++) {
            if(withoutBurn && burnedCoin[i] && pokemonMetadata[i].cardStatus==SaleType.Burned){
                continue;
            }
            tokensId[key] = pokemonMetadata[i];
            key++;
        }

        return tokensId;
    }

    function walletOfUserItem(address _user, bool withoutBurn) external view returns (Card[] memory) {
        Card[] memory tokensId = new Card[](userTokenCount[_user]);
        uint256 key = 0;
        for (uint256 i = 1; i <=  MAX_ELEMENTS; i++) {
            if(burnedCoin[i] && withoutBurn && pokemonMetadata[i].cardStatus==SaleType.Burned) {
                continue;
            }
            if(pokemonMetadata[i].owner == _user){
                tokensId[key] = pokemonMetadata[i];
                key++;
                if(key == userTokenCount[_user]){break;}
            }
        }
        // console.log(tokensId);
        return tokensId;
    }

    function walletOfUser(address _user) external view returns (uint256[] memory) {
        uint256 tokenCount = userTokenCount[_user];
        uint256[] memory tokensId = new uint256[](tokenCount);

        if(tokenCount == 0){
            return tokensId;
        }

        uint256 key = 0;
        for (uint256 i = 1; i <= MAX_ELEMENTS; i++) {
            if(pokemonMetadata[i].owner == _user){
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

    function isAdmin(address account) public view returns (bool) {
        return hasRole(DEFAULT_ADMIN_ROLE, account);
    }
    //******************************************************//
    //                    Setter                            //
    //******************************************************//
    function setPause(bool _toggle) public onlyRole(ADMIN_ROLE) {
        paused = _toggle;
    }

    function setPauseTrigger(bool _toggle) external {
        require(_msgSender() == auctionAddr, "invalid caller");
        paused = _toggle;
    }

    function setBaseURI(string memory baseURIs) public onlyRole(ADMIN_ROLE) {
        baseTokenURI = baseURIs;
    }

    function setAuctionAddr(address _auctionAddr) public onlyRole(ADMIN_ROLE){
        auctionAddr = _auctionAddr;
        setAdmin(auctionAddr);
    }

    function setAdmin(address _newAdmin) public onlyRole(ADMIN_ROLE) {
        setApprovalForAll(_newAdmin, true);
        _grantRole(DEFAULT_ADMIN_ROLE, _newAdmin); // default admin role
        _grantRole(ADMIN_ROLE, _newAdmin);         // set custom ADMIN_ROLE
    }

    function setSalesStatus(
        address _owner,
        uint256 tokenId, 
        bool _isOnSale, 
        uint256 _cardStatus,
        uint256 startTime,
        uint256 endTime,
        uint256 duration,
        uint256 startPrice,
        uint256 endPrice
    ) external marketIsOpen nonReentrant{
        require(_msgSender() == auctionAddr, "invalid caller");
        pokemonMetadata[tokenId].isOnSale = _isOnSale;
        pokemonMetadata[tokenId].cardStatus = SaleType(_cardStatus);
        pokemonMetadata[tokenId].owner = _owner;

        pokemonMetadata[tokenId].startTime = startTime;
        pokemonMetadata[tokenId].endTime = endTime;
        pokemonMetadata[tokenId].duration = duration;
        pokemonMetadata[tokenId].startPrice = startPrice;
        pokemonMetadata[tokenId].endPrice = endPrice;

    }

    function supportsInterface(bytes4 interfaceId) 
        public view override(AccessControl, ERC721URIStorage) 
        returns (bool) 
    {
        return super.supportsInterface(interfaceId);
    }
}

