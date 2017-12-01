pragma solidity ^0.4.11;

import './Tokensale.sol';

contract LeapPrivatePreTokensale is Tokensale {
    address secondWallet;

    function LeapPrivatePreTokensale(
        uint256 _startTime,
        address _token,
        address _placeholder,
        address _wallet, address _secondWallet
    ) Tokensale(
        _startTime,
        _token,
        _placeholder,
        _wallet) {

        secondWallet = _secondWallet;
    }

    function hardcap() public constant returns (uint256) {
        return 52500000e18;
    }

    function duration() public constant returns (uint256) {
        return 7 days;
    }

    function rate() public constant returns (uint256) {
        return 5250;
    }

    function forwardFunds(uint256 amount) internal {
        uint256 halfOfPayment = amount.div(2);

        wallet.transfer(halfOfPayment);
        secondWallet.transfer(amount - halfOfPayment);
    }
}