pragma solidity ^0.4.11;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import './Token.sol';

contract Crowdsale {
    using SafeMath for uint256;

    uint256 public startTime;
    uint256 public endTime;
    uint256 public rate;
    uint256 public weiRaised;
    uint256 public cap;

    address public wallet;

    event TokenPurchase(address beneficiary, address lockedAccount, uint256 weiAmount, uint256 tokensAmount);

    function Crowdsale(uint256 _startTime, uint256 _endTime, uint256 _cap, address _wallet) {
        require(_startTime >= now);
        require(_endTime >= _startTime);
        require(_cap > 0);
        require(_wallet != 0x0);

        startTime = _startTime;
        endTime = _endTime;
        cap = _cap;
        wallet = _wallet;
    }

    function forwardFunds() internal {
        wallet.transfer(msg.value);
    }

    modifier withinPeriod() {
        require(now >= startTime && now <= endTime);
        _;
    }

    modifier withinCap() {
        require(weiRaised.add(msg.value) <= cap);
        _;
    }

    modifier nonZeroPurchase() {
        require(msg.value != 0);
        _;
    }

    function buyTokens() public payable;

    function() payable {
        throw;
    }
}