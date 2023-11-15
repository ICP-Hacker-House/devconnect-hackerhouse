// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract CrossChainAssetManagement {
    // Kullanıcıların varlıklarını saklamak için kullanılacak veri yapısı
    struct UserAssets {
        mapping(address => uint256) balances; // Kullanıcının varlık bakiyeleri
        mapping(address => bool) supportedChains; // Kullanıcının desteklenen zincirleri
    }

    // Akıllı kontrat sahibi
    address public owner;

    // Kullanıcıların varlıklarını depolamak için kullanılacak mapping
    mapping(address => UserAssets) private  userAssets;

    // Varlık transferi için olay
    event AssetTransferred(address indexed from, address indexed to, address indexed token, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the contract owner can call this function");
        _;
    }

    // Kullanıcının desteklenen zincirleri ayarlaması
    function setSupportedChain(address user, address chain) external onlyOwner {
        userAssets[user].supportedChains[chain] = true;
    }

    // Varlık transferi fonksiyonu
    function transferAsset(
        address from,
        address to,
        address token,
        uint256 amount
    ) external onlyOwner {
        require(userAssets[from].balances[token] >= amount, "Insufficient balance");

        // Transfer işlemi
        IERC20(token).transferFrom(from, to, amount);

        // Bakiye güncelleme
        userAssets[from].balances[token] -= amount;
        userAssets[to].balances[token] += amount;

        // Transfer olayını tetikleme
        emit AssetTransferred(from, to, token, amount);
    }
}
