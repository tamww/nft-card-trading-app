// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract PokemonNFT is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    // 定义宝可梦属性
    struct PokemonMetadata {
        string name;
        string imageURL;
        string description;
        string attribute; // 如 Grass, Fire 等
    }

    // 存储每个 tokenId 对应的元数据
    mapping(uint256 => PokemonMetadata) private _tokenMetadata;

    constructor() ERC721("PokemonCards", "POKE") {}

    // 仅合约所有者可铸造
    function safeMint(
        address to,
        string memory name,
        string memory imageURL,
        string memory description,
        string memory attribute
    ) external onlyOwner {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _tokenMetadata[tokenId] = PokemonMetadata(name, imageURL, description, attribute);
    }

    // 获取元数据
    function getMetadata(uint256 tokenId) public view returns (
        string memory name,
        string memory imageURL,
        string memory description,
        string memory attribute
    ) {
        require(_exists(tokenId), "Token does not exist");
        PokemonMetadata memory data = _tokenMetadata[tokenId];
        return (data.name, data.imageURL, data.description, data.attribute);
    }

    // 支持 ERC721 的 tokenURI
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        // 返回 JSON 格式的元数据（需前端解析）
        return string(abi.encodePacked(
            "data:application/json;utf8,", 
            '{"name": "', _tokenMetadata[tokenId].name, 
            '", "image": "', _tokenMetadata[tokenId].imageURL, 
            '", "description": "', _tokenMetadata[tokenId].description, 
            '", "attribute": "', _tokenMetadata[tokenId].attribute, '"}'
        ));
    }
}
