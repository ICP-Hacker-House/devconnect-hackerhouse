// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AssetManagement {
    // Varlık yapısı
    struct Asset {
        uint256 id;
        string name;
    }

    // Kullanıcı varlıkları
    mapping(address => Asset[]) private userAssets;

    // Varlık eklemek için olay
    event AssetAdded(address indexed user, uint256 indexed assetId, string assetName);

    // Varlık eklemesi
    function addAsset(string memory _assetName) external {
        uint256 assetId = userAssets[msg.sender].length + 1;

        Asset memory newAsset = Asset({
            id: assetId,
            name: _assetName
        });

        userAssets[msg.sender].push(newAsset);

        // Olayı tetikle
        emit AssetAdded(msg.sender, assetId, _assetName);
    }

    // Kullanıcının varlıklarını listelemesi
    function getUserAssets() external view returns (Asset[] memory) {
        return userAssets[msg.sender];
    }
}
