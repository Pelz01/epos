// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract EposProfiles {
    error InvalidUsername();
    error UsernameTaken();
    error WalletAlreadyClaimed();

    event UsernameClaimed(address indexed wallet, string username);

    mapping(bytes32 usernameHash => address wallet) public walletByUsernameHash;
    mapping(address wallet => string username) public usernameByWallet;

    function claimUsername(string calldata username) external {
        bytes32 usernameHash = _validateAndHash(username);

        if (walletByUsernameHash[usernameHash] != address(0)) {
            revert UsernameTaken();
        }

        if (bytes(usernameByWallet[msg.sender]).length != 0) {
            revert WalletAlreadyClaimed();
        }

        walletByUsernameHash[usernameHash] = msg.sender;
        usernameByWallet[msg.sender] = username;

        emit UsernameClaimed(msg.sender, username);
    }

    function walletOf(string calldata username) external view returns (address) {
        return walletByUsernameHash[_hashUsername(username)];
    }

    function isUsernameAvailable(string calldata username) external view returns (bool) {
        return walletByUsernameHash[_hashUsername(username)] == address(0);
    }

    function _validateAndHash(string calldata username) internal pure returns (bytes32) {
        bytes calldata usernameBytes = bytes(username);
        uint256 length = usernameBytes.length;
        if (length < 3 || length > 15) {
            revert InvalidUsername();
        }

        for (uint256 i = 0; i < length; i++) {
            bytes1 char = usernameBytes[i];
            bool isLowercase = char >= 0x61 && char <= 0x7A;
            bool isNumber = char >= 0x30 && char <= 0x39;
            bool isUnderscore = char == 0x5F;
            if (!isLowercase && !isNumber && !isUnderscore) {
                revert InvalidUsername();
            }
        }

        return _hashUsername(username);
    }

    function _hashUsername(string calldata username) internal pure returns (bytes32) {
        return keccak256(bytes(username));
    }
}
