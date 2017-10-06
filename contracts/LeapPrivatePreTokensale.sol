pragma solidity ^0.4.11;

import './Tokensale.sol';

contract LeapPrivatePreTokensale is Tokensale {
    function LeapPrivatePreTokensale(
        uint256 _startTime,
        address _token,
        address _proxy,
        address _placeholder,
        address _wallet
    ) Tokensale(
        _startTime,
        _token,
        _proxy,
        _placeholder,
        _wallet) {}

    uint256 public constant duration = 14 days;
    uint256 public constant hardcap = 1000000e18;

    mapping (address => bool) members;

    function addMember(address _member) public onlyOwner {
        members[_member] = true;
    }

    function isMember(address _investor) public constant returns (bool) {
        return members[_investor];
    }

    function validPayment(address beneficiary, uint256 amount) public constant returns (bool) {
        return super.validPayment(beneficiary, amount) && isMember(msg.sender);
    }
}
