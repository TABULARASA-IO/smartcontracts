pragma solidity ^0.4.11;

import './Crowdsale.sol';
import './Token.sol';

contract CrowdsaleMock is Crowdsale {
    function CrowdsaleMock(uint256 _startTime, uint256 _endTime, uint256 _cap, uint256 _btcCap, address _wallet, address _token, address _relay)
        Crowdsale(_startTime, _endTime, _cap, _btcCap, _wallet, _token, _relay) {
    }

    function issueCoins(address beneficiary, uint256 amount) internal returns(address) {
        token.mint(beneficiary, amount);
        return beneficiary;
    }
}