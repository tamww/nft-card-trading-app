// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract PokemonCard is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    // 正确初始化 Ownable
    constructor() 
        ERC721("PokemonCard", "PKMN")   // 初始化 ERC721
        Ownable(msg.sender)             // 传递初始所有者地址
    {}

    /// @notice 安全铸造函数
    function safeMint(
        address to,
        string memory ipfsCID
    ) external onlyOwner returns (uint256) {
        _validateCID(ipfsCID);

        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, string(abi.encodePacked("ipfs://", ipfsCID)));
        
        return tokenId;
    }

    /// @notice CID 格式验证
    function _validateCID(string memory cid) private pure {
        bytes memory cidBytes = bytes(cid);
        require(cidBytes.length == 46, "Invalid CID length");
        require(cidBytes[0] == 'Q' && cidBytes[1] == 'm', "Invalid CID prefix");
    }
}
