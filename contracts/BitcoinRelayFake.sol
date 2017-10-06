pragma solidity ^0.4.11;

import './BitcoinProxy.sol';

contract BitcoinRelayFake {
    function relayTx(
        bytes rawTransaction,
        uint256 transactionIndex,
        uint256[] merkleSiblings,
        uint256 blockHash,
        uint256 contractAddress
    )
        public returns(int256) {

        uint256 txHash = transactionIndex + blockHash + contractAddress + merkleSiblings[0]; // just for testing
        BitcoinProxy processor = BitcoinProxy(contractAddress);
        return processor.processTransaction(rawTransaction, txHash);
    }
}