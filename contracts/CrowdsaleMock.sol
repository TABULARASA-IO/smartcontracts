pragma solidity ^0.4.11;

import './Crowdsale.sol';

contract CrowdsaleMock is Crowdsale {
    function CrowdsaleMock(uint256 _startTime, uint256 _endTime, uint256 _cap, address _wallet)
        Crowdsale(_startTime, _endTime, _cap, _wallet) {}

    function buyTokens() public payable {
        require(validPayment());
        weiRaised = weiRaised.add(msg.value);
    }
}