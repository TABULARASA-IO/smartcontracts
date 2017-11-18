pragma solidity ^0.4.11;

import './LeapTokensale.sol';

// Just for testing purpose
// We have only 100 ETH on truffle accounts and wanna to reach the hardcap

contract LeapTokensaleFake is LeapTokensale {
    uint divider = 10000;

    function LeapTokensaleFake (
    uint256 _startTime,
    address _token,
    address _proxy,
    address _placeholder,
    address _wallet,
    address _bounty,
    address _team,
    address _ecosystem,
    address _reserve
    ) LeapTokensale (
        _startTime,
        _token,
        _proxy,
        _placeholder,
        _wallet,
        _bounty,
        _team,
        _ecosystem,
        _reserve) {
    }

    function hardcap() public constant returns (uint256) {
        return super.hardcap() / divider;
    }

    function rate() public constant returns (uint256) {
        if(leapRaised < 36000000e18 / divider) {
            return 3600;
        } else if(leapRaised < 82000000e18 / divider) {
            return 3450;
        } else if(leapRaised < 137000000e18 / divider) {
            return 3300;
        } else if(leapRaised < 201500000e18 / divider) {
            return 3225;
        } else {
            return 3000;
        }
    }
}
