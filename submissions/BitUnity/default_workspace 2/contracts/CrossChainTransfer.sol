// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CrossChainTransfer {
    // Varlık transferi yapısı
    struct Transfer {
        uint256 id;
        address from;
        address to;
        string assetName;
        bool completed;
    }

    // Varlık transferleri
    Transfer[] public transfers;

    // Transfer tamamlandığında tetiklenen olay
    event TransferCompleted(uint256 indexed transferId, address indexed from, address indexed to, string assetName);

    // Varlık transferi başlatma
    function initiateTransfer(address _to, string memory _assetName) external {
        uint256 transferId = transfers.length + 1;

        Transfer memory newTransfer = Transfer({
            id: transferId,
            from: msg.sender,
            to: _to,
            assetName: _assetName,
            completed: false
        });

        transfers.push(newTransfer);
    }

    // Varlık transferini tamamlama
    function completeTransfer(uint256 _transferId) external {
        require(_transferId > 0 && _transferId <= transfers.length, "Invalid transfer ID");
        Transfer storage transfer = transfers[_transferId - 1];

        // Sadece varlık sahibi transferi tamamlayabilir
        require(msg.sender == transfer.from, "Only asset owner can complete the transfer");
        // Transfer daha önce tamamlanmamış olmalı
        require(!transfer.completed, "Transfer already completed");

        // Transferi tamamla
        transfer.completed = true;

        // Olayı tetikle
        emit TransferCompleted(_transferId, transfer.from, transfer.to, transfer.assetName);
    }

    // Kullanıcının başlattığı varlık transferlerini listeleme
    function getUserTransfers() external view returns (Transfer[] memory) {
        // Kullanıcının varlık sahibi olduğu transferleri filtreleme
        uint256 userTransferCount = 0;
        for (uint256 i = 0; i < transfers.length; i++) {
            if (transfers[i].from == msg.sender) {
                userTransferCount++;
            }
        }

        // Kullanıcının varlık transferlerini alma
        Transfer[] memory userTransfers = new Transfer[](userTransferCount);
        uint256 index = 0;
        for (uint256 i = 0; i < transfers.length; i++) {
            if (transfers[i].from == msg.sender) {
                userTransfers[index] = transfers[i];
                index++;
            }
        }

        return userTransfers;
    }
}
