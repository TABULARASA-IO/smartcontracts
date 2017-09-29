pragma solidity ^0.4.11;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import './Token.sol';
import './BitcoinProcessor.sol';

contract Crowdsale is BitcoinProcessor, Ownable {
    using SafeMath for uint256;

    uint256 public startTime;
    uint256 public endTime;

    uint256 public coinsPerEth;
    uint256 public coinsPerBtc;

    uint256 public btcRaised;
    uint256 public weiRaised;

    uint256 public btcCap;
    uint256 public weiCap;

    address public wallet;

    Token public token;

    event TokenPurchase(address beneficiary, address account, uint256 weiAmount, uint256 tokensAmount);

    function Crowdsale(uint256 _startTime, uint256 _endTime, uint256 _weiCap, uint256 _btcCap, address _wallet, address _token, address _relay) BitcoinProcessor(_relay) {
        require(_startTime >= now);
        require(_endTime >= _startTime);
        require(_weiCap > 0);
        require(_btcCap > 0);
        require(_wallet != 0x0);
        require(_token != 0x0);
        require(_relay != 0x0);

        startTime = _startTime;
        endTime = _endTime;
        weiCap = _weiCap;
        btcCap = _btcCap;
        wallet = _wallet;
        token = Token(_token);
    }

    function updateCoinsPerEth(uint256 _coins) public onlyOwner {
        coinsPerEth = _coins;
    }

    function updateCoinsPerBtc(uint256 _coins) public onlyOwner {
        coinsPerBtc = _coins;
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

    // @override BitcoinProcessor.buyTokensBtc()
    function buyTokensBtc(address beneficiary, uint256 btcAmount) internal {
        require(validBtcPurchase(beneficiary, btcAmount));

        uint256 coinsAmount = btcAmount.mul(getBtcRate());
        btcRaised = btcRaised.add(btcAmount);

        address account = issueCoins(beneficiary, coinsAmount);

        TokenPurchase(beneficiary, account, btcAmount, coinsAmount);
    }

    function getEthRate() public constant returns(uint256) {
        return coinsPerEth * 10**uint256(token.decimals());
    }

    function getBtcRate() public constant returns(uint256) {
        return coinsPerBtc * 10**uint256(token.decimals());
    }

    function validEthPurchase() internal constant returns (bool) {
        bool withinPeriod = now >= startTime && now <= endTime;
        bool nonZeroPurchase = msg.value != 0;
        bool withinCap = weiRaised.add(msg.value) <= weiCap;
        return withinPeriod && nonZeroPurchase && withinCap;
    }

    function validBtcPurchase(address beneficiary, uint256 amount) internal constant returns (bool) {
        bool withinPeriod = now >= startTime && now <= endTime;
        bool withinCap = btcRaised.add(amount) <= btcCap;
        return withinPeriod && withinCap;
    }

    // don't receive direct payments
    function() payable {
        throw;
    }

    // virtual template method
    function issueCoins(address beneficiary, uint256 amount) internal returns(address);
}