pragma solidity ^0.4.11;

import './LeapPreTokensale.sol';

// Just for testing purpose
// We have only 100 ETH on truffle accounts and wanna to reach the hardcap

contract LeapPreTokensaleFake is LeapPreTokensale {
    uint divider = 10000;

    function LeapPreTokensaleFake (
        uint256 _startTime,
        address _token,
        address _proxy,
        address _placeholder,
        address _wallet, address _secondWallet
    ) LeapPreTokensale (
        _startTime,
        _token,
        _proxy,
        _placeholder,
        _wallet, _secondWallet) {
    }

    function hardcap() public constant returns (uint256) {
        return super.hardcap() / divider;
    }

    function rate() public constant returns (uint256) {
        if(leapRaised < 15000000e18 / divider) {
            return 4500;
        } else if(leapRaised < 44000000e18 / divider) {
            return 4350;
        } else {
            return 4200;
        }
    }
}
