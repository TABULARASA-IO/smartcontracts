pragma solidity ^0.4.11;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/crowdsale/CappedCrowdsale.sol';
import './Token.sol';
import './TokenHolder.sol';
import './TokenHolderFactory.sol';

contract ICO {
    using SafeMath for uint256;

    Token public token;
    TokenHolderFactory public factory;

    uint256 public startTime;
    uint256 public endTime;

    address public wallet;

    uint256 public rate;

    uint256 public weiRaised;

    uint256 public cap;

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
      uint256 _firstHourBonus)
    {
        require(_startTime >= now);
        require(_endTime >= _startTime);
        require(_rate > 0);
        require(_wallet != 0x0);
        require(_cap > 0);

        startTime = _startTime;
        endTime = _endTime;
        rate = _rate;
        wallet = _wallet;
        cap = _cap;
        stageBonus = _stageBonus;
        firstHourBonus = _firstHourBonus;
    }

    function() payable {
        buyTokens(msg.sender);
    }

    function setToken(address _token) public {
        token = Token(_token);
    }

    function setTokenHolderFactory(address _factory) public {
        factory = TokenHolderFactory(_factory);
    }

    function buyTokens(address beneficiary) payable {
      require(beneficiary != 0x0);
      require(validPurchase());

      uint256 weiAmount = msg.value;

      uint256 tokens = weiAmount.mul(rate);

      tokens = tokens.add(stageBonus);

      if(block.timestamp - startTime < 1 hours)
        tokens = tokens.add(firstHourBonus);

      weiRaised = weiRaised.add(weiAmount);

      TokenHolder lockedAccount = 
        TokenHolder(factory.createTokenHolder(beneficiary));

      token.mint(lockedAccount, tokens);
      TokenPurchase(msg.sender, beneficiary, lockedAccount, weiAmount, tokens);

      forwardFunds();
    }

    function forwardFunds() internal {
        wallet.transfer(msg.value);
    }

    function validPurchase() internal constant returns (bool) {
        bool withinPeriod = now >= startTime && now <= endTime;
        bool nonZeroPurchase = msg.value != 0;
        bool withinCap = weiRaised.add(msg.value) <= cap;
        return withinPeriod && nonZeroPurchase && withinCap;
    }

    function hasEnded() public constant returns (bool) {
        bool capReached = weiRaised >= cap;
        return now > endTime || capReached;
    }
}