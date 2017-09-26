pragma solidity ^0.4.11;

import './Crowdsale.sol';
import './Token.sol';

contract CrowdsaleMock is Crowdsale {
    function CrowdsaleMock(uint256 _startTime, uint256 _endTime, uint256 _cap, address _wallet, address _token)
        Crowdsale(_startTime, _endTime, _cap, _wallet, _token) {
        token = Token(_token);
    }

    function issueCoins(address beneficiary, uint256 amount) internal returns(address) {
        token.mint(beneficiary, amount);
        return beneficiary;
    }
}