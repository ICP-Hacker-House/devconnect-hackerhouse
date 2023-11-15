// SPDX-License-Identifier: MIT 
pragma solidity >=0.4.25 <0.9.0;

contract WhaleScore {

    struct OracleData {
        uint256 creditScore;
        uint256 lastUpdatedTimestamp;
        uint256 lastUpdatedBlock;
    }

    address[] internal queue;
    mapping(address => OracleData) scoreData;
    address oracle;

    constructor() {
        oracle = msg.sender;
    }

    function add_request() public payable {
        require(msg.value > 500 gwei, "Not enough ETH sent; check price");

        queue.push(msg.sender);
    }

    function apply_request(OracleData calldata data, address user, uint256 index) public {
        require(msg.sender == oracle, "Only oracle can apply credit score");
        scoreData[user] = data;
        remove_from_queue(index);
    }

    function get_queue() public view returns (address[] memory) {
        return queue;
    }

    function get_user_data(address user) public view returns (OracleData memory) {
        return scoreData[user];
    }

    function get_score(address user) public view returns (uint256) {
        return scoreData[user].creditScore;
    }

    function get_last_updated_timestamp(address user) public view returns (uint256) {
        return scoreData[user].lastUpdatedTimestamp;
    }

    function get_last_updated_block(address user) public view returns (uint256) {
        return scoreData[user].lastUpdatedBlock;
    }

    function get_oracle() public view returns (address) {
        return oracle;
    }

    // For array removal
    function remove_from_queue(uint index) private {
        require(index >= queue.length, "Index should be less or equal");

        for(uint i = index; i < queue.length-1; i++) {
            queue[i] = queue[i+1];
        }

        queue.pop();
    }
}
