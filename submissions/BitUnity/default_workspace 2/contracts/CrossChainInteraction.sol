// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ChainInteraction {
    // Varlık transferi yapısı
    struct AssetTransfer {
        uint256 id;
        address fromChain;
        address toChain;
        address toUser;
        string assetName;
        uint256 amount;
        bool completed;
    }

    // Varlık transferleri
    AssetTransfer[] public assetTransfers;

    // Transfer tamamlandığında tetiklenen olay
    event AssetTransferCompleted(uint256 indexed transferId, address indexed fromChain, address indexed toChain, address toUser, string assetName, uint256 amount);

    // Varlık transferi başlatma
    function initiateAssetTransfer(address _toChain, address _toUser, string memory _assetName, uint256 _amount) external {
        uint256 transferId = assetTransfers.length + 1;

        AssetTransfer memory newTransfer = AssetTransfer({
            id: transferId,
            fromChain: msg.sender,
            toChain: _toChain,
            toUser: _toUser,
            assetName: _assetName,
            amount: _amount,
            completed: false
        });

        assetTransfers.push(newTransfer);
    }

    // Varlık transferini tamamlama
    function completeAssetTransfer(uint256 _transferId) external {
        require(_transferId > 0 && _transferId <= assetTransfers.length, "Invalid transfer ID");
        AssetTransfer storage transfer = assetTransfers[_transferId - 1];

        // Sadece transferin hedef zinciri transferi tamamlayabilir
        require(msg.sender == transfer.toChain, "Only target chain can complete the transfer");
        // Transfer daha önce tamamlanmamış olmalı
        require(!transfer.completed, "Transfer already completed");

        // Transferi tamamla
        transfer.completed = true;

        // Olayı tetikle
        emit AssetTransferCompleted(_transferId, transfer.fromChain, transfer.toChain, transfer.toUser, transfer.assetName, transfer.amount);
    }

    // Kullanıcının başlattığı varlık transferlerini listeleme
    function getUserAssetTransfers() external view returns (AssetTransfer[] memory) {
        // Kullanıcının başlattığı varlık transferlerini filtreleme
        uint256 userTransferCount = 0;
        for (uint256 i = 0; i < assetTransfers.length; i++) {
            if (assetTransfers[i].fromChain == msg.sender) {
                userTransferCount++;
            }
        }

        // Kullanıcının başlattığı varlık transferlerini alma
        AssetTransfer[] memory userAssetTransfers = new AssetTransfer[](userTransferCount);
        uint256 index = 0;
        for (uint256 i = 0; i < assetTransfers.length; i++) {
            if (assetTransfers[i].fromChain == msg.sender) {
                userAssetTransfers[index] = assetTransfers[i];
                index++;
            }
        }

        return userAssetTransfers;
    }
}
