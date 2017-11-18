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
        _wallet) {
    }

    function hardcap() public constant returns (uint256) {
        return 52500000e18;
    }
    function duration() public constant returns (uint256) {
        return 7 days;
    }
    function releaseDuration() public constant returns (uint256) {
        return 7 days;
    }

    mapping (address => bool) members;

    event NewMember(address _member);

    function addMember(address _member) public onlyOwner {
        require(members[_member] == false);

        members[_member] = true;
        NewMember(_member);
    }

    function isMember(address _investor) public constant returns (bool) {
        return members[_investor];
    }

    function validPayment(address beneficiary) public constant returns (bool) {
        return super.validPayment(beneficiary) && isMember(beneficiary);
    }

    function rate() public constant returns (uint256) {
        return 5250;
    }

    function forwardFunds(uint256 amount) internal {
        wallet.transfer(amount);
    }

}