pragma solidity ^0.4.11;

import './Crowdsale.sol';
import './Token.sol';
import './TokenHolderFactory.sol';
import './TokenHolder.sol';

contract PreICO is Crowdsale {
    TokenHolderFactory public factory;
    Token public token;

    function PreICO(
        uint256 _startTime,
        uint256 _endTime,
        uint256 _cap,
        address _wallet,
        address _token,
        address _factory
    ) Crowdsale(_startTime, _endTime, _cap, _wallet) {
        token = Token(_token);
        factory = TokenHolderFactory(_factory);
    }

    function buyTokens() public payable
        withinPeriod withinCap nonZeroPurchase
    {
        uint256 weiAmount = msg.value;

        uint256 rate = getRate();

        uint256 tokensAmount = weiAmount.mul(rate);

        TokenHolder lockedAccount =
            TokenHolder(factory.createTokenHolder(msg.sender));

        token.mint(lockedAccount, tokensAmount);

        weiRaised = weiRaised.add(weiAmount);

        TokenPurchase(msg.sender, lockedAccount, weiAmount, tokensAmount);

        forwardFunds();
    }

    function getRate() constant public returns(uint256) {
        return 1 * 10**uint256(token.decimals());
    }
}