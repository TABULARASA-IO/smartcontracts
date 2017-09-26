pragma solidity ^0.4.11;

import './Crowdsale.sol';
import './Token.sol';
import './TokenHolderFactory.sol';
import './TokenHolder.sol';

contract PreICO is Crowdsale {
    TokenHolderFactory public factory;

    function PreICO(
        uint256 _startTime,
        uint256 _endTime,
        uint256 _cap,
        address _wallet,
        address _token,
        address _factory
    ) Crowdsale(_startTime, _endTime, _cap, _wallet, _token) {
        factory = TokenHolderFactory(_factory);
    }

    function issueCoins(address beneficiary, uint256 amount) internal returns(address) {
        TokenHolder lockedAccount = TokenHolder(factory.createTokenHolder(beneficiary));
        token.mint(lockedAccount, amount);
        return lockedAccount;
    }
}