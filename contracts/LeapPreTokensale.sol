pragma solidity ^0.4.11;

import './Tokensale.sol';

contract LeapPreTokensale is Tokensale {
    function LeapPreTokensale(
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
        _wallet
    ) {}

    uint256 public constant duration = 14 days;
    uint256 public constant hardcap = 86000000e18;

}
