pragma solidity ^0.4.11;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import './Token.sol';
import './TokenHolder.sol';
import './TokenHolderFactory.sol';
import './Crowdsale.sol';

contract ICO is Crowdsale {
    using SafeMath for uint256;

    Token public token;
    TokenHolderFactory public factory;

    uint256 public rate;

    uint256 public stageBonus;
    uint256 public firstHourBonus;

    event TokenPurchase(address purchaser, address beneficiary, address lockedAccount, uint256 value, uint256 amount);

    function ICO(
      uint256 _startTime,
      uint256 _endTime,
      uint256 _rate,
      uint256 _cap,
      address _wallet,
      uint256 _stageBonus,
      uint256 _firstHourBonus) Crowdsale(_startTime, _endTime, _cap, _wallet)
    {
        require(_rate > 0);

        rate = _rate;
        stageBonus = _stageBonus;
        firstHourBonus = _firstHourBonus;
    }

    function setToken(address _token) public {
        token = Token(_token);
    }

    function setTokenHolderFactory(address _factory) public {
        factory = TokenHolderFactory(_factory);
    }

    function buyTokens() payable {
        require(validPayment());

      uint256 weiAmount = msg.value;

      uint256 tokens = weiAmount.mul(rate);

      tokens = tokens.add(stageBonus);

      if(block.timestamp - startTime < 1 hours)
        tokens = tokens.add(firstHourBonus);

      weiRaised = weiRaised.add(weiAmount);

      TokenHolder lockedAccount = 
        TokenHolder(factory.createTokenHolder(msg.sender));

      token.mint(lockedAccount, tokens);
      TokenPurchase(msg.sender, msg.sender, lockedAccount, weiAmount, tokens);

      forwardFunds();
    }

    function forwardFunds() internal {
        wallet.transfer(msg.value);
    }
}