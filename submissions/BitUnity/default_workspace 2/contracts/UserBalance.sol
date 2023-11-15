// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract UserBalance {
    // Kullanıcı bakiye yapısı
    struct Balance {
        uint256 amount;
    }

    // Kullanıcı bakiyeleri
    mapping(address => Balance) private userBalances;

    // Bakiye eklemesi
    event BalanceAdded(address indexed user, uint256 amount);

    // Bakiye çıkarması
    event BalanceSubtracted(address indexed user, uint256 amount);

    // Kullanıcının bakiyesini alma
    function getUserBalance() external view returns (uint256) {
        return userBalances[msg.sender].amount;
    }

    // Bakiye eklemesi yapma
    function addBalance(uint256 _amount) external {
        require(_amount > 0, "Amount must be greater than 0");

        userBalances[msg.sender].amount += _amount;

        // Olayı tetikle
        emit BalanceAdded(msg.sender, _amount);
    }

    // Bakiye çıkarması yapma
    function subtractBalance(uint256 _amount) external {
        require(_amount > 0, "Amount must be greater than 0");
        require(userBalances[msg.sender].amount >= _amount, "Insufficient balance");

        userBalances[msg.sender].amount -= _amount;

        // Olayı tetikle
        emit BalanceSubtracted(msg.sender, _amount);
    }
}
