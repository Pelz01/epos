// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./EposProfiles.sol";
import "./EposReputation.sol";

interface IERC20 {
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

contract EposRequests {
    error UsernameNotClaimed();
    error AmountMustBePositive();
    error RequestNotFound();
    error RequestAlreadyFulfilled();
    error CannotFulfillOwnRequest();
    error TokenTransferFailed();

    enum RequestStatus {
        Open,
        Fulfilled
    }

    struct PaymentRequest {
        address recipient;
        address token;
        uint256 amount;
        uint64 createdAt;
        uint64 fulfilledAt;
        RequestStatus status;
        string username;
        string reason;
    }

    event RequestCreated(
        uint256 indexed requestId,
        address indexed recipient,
        address indexed token,
        uint256 amount,
        string username,
        string reason
    );
    event RequestFulfilled(uint256 indexed requestId, address indexed giver, address indexed recipient, uint256 amount);

    EposProfiles public immutable profiles;
    EposReputation public immutable reputation;

    uint256 public nextRequestId = 1;
    mapping(uint256 requestId => PaymentRequest request) public requests;

    constructor(address profilesAddress, address reputationAddress) {
        profiles = EposProfiles(profilesAddress);
        reputation = EposReputation(reputationAddress);
    }

    function createRequest(address token, uint256 amount, string calldata reason) external returns (uint256 requestId) {
        string memory username = profiles.usernameByWallet(msg.sender);
        if (bytes(username).length == 0) {
            revert UsernameNotClaimed();
        }
        if (amount == 0) {
            revert AmountMustBePositive();
        }

        requestId = nextRequestId++;
        requests[requestId] = PaymentRequest({
            recipient: msg.sender,
            token: token,
            amount: amount,
            createdAt: uint64(block.timestamp),
            fulfilledAt: 0,
            status: RequestStatus.Open,
            username: username,
            reason: reason
        });

        emit RequestCreated(requestId, msg.sender, token, amount, username, reason);
    }

    function fulfillRequest(uint256 requestId) external {
        PaymentRequest storage request = requests[requestId];
        if (request.recipient == address(0)) {
            revert RequestNotFound();
        }
        if (request.status != RequestStatus.Open) {
            revert RequestAlreadyFulfilled();
        }
        if (request.recipient == msg.sender) {
            revert CannotFulfillOwnRequest();
        }

        request.status = RequestStatus.Fulfilled;
        request.fulfilledAt = uint64(block.timestamp);

        bool transferred = IERC20(request.token).transferFrom(msg.sender, request.recipient, request.amount);
        if (!transferred) {
            revert TokenTransferFailed();
        }

        reputation.recordFulfillment(msg.sender, request.recipient, request.amount);

        emit RequestFulfilled(requestId, msg.sender, request.recipient, request.amount);
    }
}
