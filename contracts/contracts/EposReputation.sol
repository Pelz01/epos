// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract EposReputation {
    error NotRequestsContract();
    error RequestsContractAlreadySet();

    event RequestsContractSet(address indexed requestsContract);
    event ReputationRecorded(address indexed giver, address indexed receiver, uint256 amount);

    address public requestsContract;

    mapping(address giver => uint256 count) public fulfilledCountByGiver;
    mapping(address receiver => uint256 count) public receivedCountByReceiver;
    mapping(address giver => uint256 amount) public totalGivenByGiver;
    mapping(address receiver => uint256 amount) public totalReceivedByReceiver;

    modifier onlyRequestsContract() {
        if (msg.sender != requestsContract) {
            revert NotRequestsContract();
        }
        _;
    }

    function setRequestsContract(address nextRequestsContract) external {
        if (requestsContract != address(0)) {
            revert RequestsContractAlreadySet();
        }
        requestsContract = nextRequestsContract;
        emit RequestsContractSet(nextRequestsContract);
    }

    function recordFulfillment(address giver, address receiver, uint256 amount) external onlyRequestsContract {
        fulfilledCountByGiver[giver] += 1;
        receivedCountByReceiver[receiver] += 1;
        totalGivenByGiver[giver] += amount;
        totalReceivedByReceiver[receiver] += amount;

        emit ReputationRecorded(giver, receiver, amount);
    }
}
