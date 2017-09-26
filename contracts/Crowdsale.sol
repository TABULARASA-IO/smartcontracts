pragma solidity ^0.4.11;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import './Token.sol';
import './BitcoinProcessor.sol';

contract Crowdsale is Ownable {
    using SafeMath for uint256;

    uint256 public startTime;
    uint256 public endTime;

    uint256 public coinsPerEth;

    uint256 public weiRaised;

    uint256 public weiCap;

    address public wallet;

    Token public token;

    event TokenPurchase(address beneficiary, address account, uint256 weiAmount, uint256 tokensAmount);

    function Crowdsale(uint256 _startTime, uint256 _endTime, uint256 _weiCap, address _wallet, address _token) {
        require(_startTime >= now);
        require(_endTime >= _startTime);
        require(_weiCap > 0);
        require(_wallet != 0x0);
        require(_token != 0x0);

        startTime = _startTime;
        endTime = _endTime;
        weiCap = _weiCap;
        wallet = _wallet;
        token = Token(_token);
    }

    function updateCoinsPerEth(uint256 _coins) public onlyOwner {
        coinsPerEth = _coins;
    }

    function forwardFunds() internal {
        wallet.transfer(msg.value);
    }

    function buyTokens() public payable {
        buyTokensEth();
    }

    function buyTokensEth() internal {
        require(validEthPurchase());

        uint256 weiAmount = msg.value;
        uint256 rate = getEthRate();
        uint256 coinsAmount = weiAmount.mul(rate);
        weiRaised = weiRaised.add(weiAmount);

        address account = issueCoins(msg.sender, coinsAmount);

        forwardFunds();

        TokenPurchase(msg.sender, account, weiAmount, coinsAmount);
    }

    function getEthRate() public constant returns(uint256) {
        return coinsPerEth * 10**uint256(token.decimals());
    }

    function validEthPurchase() internal constant returns (bool) {
        bool withinPeriod = now >= startTime && now <= endTime;
        bool nonZeroPurchase = msg.value != 0;
        bool withinCap = weiRaised.add(msg.value) <= weiCap;
        return withinPeriod && nonZeroPurchase && withinCap;
    }

    // don't receive direct payments
    function() payable {
        throw;
    }

    // virtual template method
    function issueCoins(address beneficiary, uint256 amount) internal returns(address);
}