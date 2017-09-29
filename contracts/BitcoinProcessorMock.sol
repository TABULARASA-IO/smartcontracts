pragma solidity ^0.4.11;

import './BitcoinProcessor.sol';

contract BitcoinProcessorMock is BitcoinProcessor {
    address public lastBeneficiary;
    uint256 public lastBtcAmount;

    function BitcoinProcessorMock(address _trustedBTCRelay) BitcoinProcessor(_trustedBTCRelay) {
    }

    function buyTokensBtc(address beneficiary, uint256 btcAmount) internal {
        lastBeneficiary = beneficiary;
        lastBtcAmount = btcAmount;
    }
}