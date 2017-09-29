pragma solidity ^0.4.11;

import './BitcoinProcessor.sol';

contract MockBTCRelay {
    function relayTx(   bytes rawTransaction,
                        int256 transactionIndex,
                        int256[] merkleSiblings,
                        int256 blockHash,
                        int256 contractAddress ) public returns(int256)
    {
        uint256 txHash = 0x123; // todo: double sha256-hash rawTransation, revert bytes and verify merkle proof
        BitcoinProcessor processor = BitcoinProcessor(contractAddress);
        return processor.processTransaction(rawTransaction, txHash);
    }
}