pragma solidity ^0.4.11;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import './LEAP.sol';
import './BitcoinProxy.sol';
import './LeapTokensalePlaceholder.sol';

contract Tokensale is Ownable {
    using SafeMath for uint256;

    address public wallet;
    address public proxy;
    LEAP public token;
    LeapTokensalePlaceholder public placeholder;

    uint256 public startTime;
    uint256 public endTime;

    uint256 public leapRaised;

    uint256 public btcMultiplierBasePoints = 10000;

    bool public isFinalized = false;

    struct Contribution {
        address beneficiary;
        uint256 amount;
        uint256 weiRaised;
        uint256 satoshiRaised;
        bool isContribution;
    }

    mapping(address => Contribution) public lockedAccounts;

    event TokenPurchaseETH(address beneficiary, address account, uint256 weiAmount, uint256 coinsAmount);
    event TokenPurchaseBTC(address beneficiary, address account, uint256 weiAmount, uint256 coinsAmount);
    event Finalized();
    event BitcoinRateChanged(uint256 rate);
    event BitcoinCharge(uint256 amount, address beneficiary);
    event ETHCharge(uint256 amount, address beneficiary);

    modifier notFinalized() {
        require(!isFinalized);
        _;
    }

    modifier onlyFromBitcoinProxy() {
        require(msg.sender == proxy);
        _;
    }

    /**
    *   @dev Should be overriden to set cap of current tokensale
    *   @return Maximum amount of tokens to buy
    */
    function hardcap() public constant returns (uint256);

    /**
    *   @dev Should be overriden to set duration of current tokensale
    *   @return Duration period between start time and end time
    *   When investors are able to buy tokens
    */
    function duration() public constant returns (uint256);

    /**
    *   @dev Should be overriden to implement price logic
    *   @return How much coins investor will receive for 1 Wei
    */
    function rate() public constant returns (uint256);

    /**
    *   @notice We do not store ETH in tokensale smart contract
    *   @dev Should be overriden to implement specific to tokensale
    *   logic of distribution of every ETH payment
    *   @param amount The amount of ETH we receive from transaction
    *   Amount may be less than msg.value because of charge
    */
    function forwardFunds(uint256 amount) internal;

    function Tokensale(
        uint256 _startTime,
        address _token,
        address _placeholder,
        address _wallet
    ) {
        require(_startTime >= now);

        startTime = _startTime;
        endTime = startTime + duration();
        token = LEAP(_token);
        placeholder = LeapTokensalePlaceholder(_placeholder);
        wallet = _wallet;
    }

    /**
    *   @notice We are able to change bitcoin proxy address at any moment
    *   in the case of vulnerability found in relay implementation
    *   @param _relay Address of updated proxy smart contract
    */
    function setBitcoinProxy(address _relay) onlyOwner {
        proxy = _relay;
    }

    /**
    *   @notice If 1 ETH = 1 BTC then investor should receive
    *   10^10 more coins for 1 Satoshi than for 1 Wei
    *   Because ETH has 18 decimals and BTC has 8 decimals
    *   @return How much coins investor will receive for 1 Satoshi
    */
    function btcRate() public constant returns (uint256) {
        return rate().mul(btcMultiplierBasePoints).div(1000).mul(1e10);
    }

    /**
    *   @notice When rate = 10000 then you will receive the same amount
    *   of tokens for 1 BTC and for 1 ETH
    *   When rate = 100000 then you will receive the 10x more tokens
    *   for 1 BTC than for 1 ETH
    *   @param _rate ETH/BTC
    */
    function updateBitcoinMultiplier(uint256 _rate) public onlyOwner {
        btcMultiplierBasePoints = _rate;
        BitcoinRateChanged(_rate);
    }

    /**
    * @notice Fallback function can be used to buy tokens
    * It means you can just send ether to smart contract
    */
    function () payable {
        buyCoinsETH();
    }

    /**
    *   @notice We provide the opportunity to buy LEAP tokens using ETH payment.
    *   Investor should send ETH from his personal wallet he has private key for.
    *   Investor should NOT send ETH from exchange address
    *   Investor should not send ETH from other smart contract
    *   We will return the charge to the same address when investor send
    *   transaction that exceed hard cap
    */
    function buyCoinsETH() public payable {
        address beneficiary = msg.sender;

        require(!isContract(msg.sender));

        require(validPayment(beneficiary));
        require(msg.value > 0);

        uint256 weiAmount = msg.value;
        uint256 leftForSale = hardcap().sub(leapRaised);

        uint256 coinsAmount = weiAmount.mul(rate());

        if(coinsAmount > leftForSale) {
            coinsAmount = leftForSale;
            weiAmount = leftForSale.div(rate());
        }

        leapRaised = leapRaised.add(coinsAmount);

        address account = issueCoins(beneficiary, coinsAmount);

        lockedAccounts[account].weiRaised = lockedAccounts[account].weiRaised.add(weiAmount);

        TokenPurchaseETH(beneficiary, account, weiAmount, coinsAmount);

        forwardFunds(weiAmount);

        uint256 charge = msg.value.sub(weiAmount);

        if(charge > 0) {
            msg.sender.transfer(charge);

            ETHCharge(charge, msg.sender);
        }
    }

    /**
    *   @notice We provide the oppurtunity to buy LEAP tokens using BTC payment.
    *   When payment was confirmed and investor have provided
    *   ETH wallet to receive to tokens trusted proxy will call this method.
    *   This method will be called later than investor sent BTC
    *   therefore rate may be changed or tokensale may be ended
    *   and transaction will be rejected
    *   @param beneficiary The address that will receive the tokens
    *   @param btcAmount The amount of satoshi investor sent in transaction
    *
    */
    function buyCoinsBTC(address beneficiary, uint256 btcAmount)
    onlyFromBitcoinProxy {

        require(validPayment(beneficiary));

        uint256 leftForSale = hardcap().sub(leapRaised);

        uint256 btcAmountPaid = btcAmount;

        require(btcAmountPaid > 0);

        uint256 coinsAmount = btcAmount.mul(btcRate());

        if(coinsAmount > leftForSale) {
            coinsAmount = leftForSale;
            btcAmountPaid = leftForSale.div(btcRate());
        }

        leapRaised = leapRaised.add(coinsAmount);

        address account = issueCoins(beneficiary, coinsAmount);

        lockedAccounts[account].satoshiRaised = lockedAccounts[account].satoshiRaised.add(btcAmountPaid);

        TokenPurchaseBTC(beneficiary, account, btcAmountPaid, coinsAmount);

        uint256 charge = btcAmount.sub(btcAmountPaid);
        if(charge > 0) {
            BitcoinCharge(charge, beneficiary);
        }
    }

    /** @dev Issue coins for buy transaction
     *  @param beneficiary The address that will receive the minted tokens.
     *  @param amount The amount of tokens to mint.
     *  @return The address have actually receive the tokens.
    */
    function issueCoins(address beneficiary, uint256 amount) internal returns(address) {
        lockedAccounts[beneficiary].isContribution = true;
        lockedAccounts[beneficiary].amount = lockedAccounts[beneficiary].amount.add(amount);

        token.mint(beneficiary, amount);

        return beneficiary;
    }

    /** @notice Investor should process KYC.
    *   If investor didn't pass KYC
    *   we will send his payment back and burn his tokens
    *   @param beneficiary The address of investor should be refunded
    */
    function refund(address beneficiary) public payable onlyOwner {
        require(msg.value == lockedAccounts[beneficiary].weiRaised);

        lockedAccounts[beneficiary].amount = 0;
        lockedAccounts[beneficiary].weiRaised = 0;
        lockedAccounts[beneficiary].satoshiRaised = 0;

        token.refund(beneficiary);

        beneficiary.transfer(msg.value);
    }

    /** @dev Internal function to determine if an address is a contract
    *   @param _addr The address being queried
    *   @return True if `_addr` is a contract
    */
    function isContract(address _addr) constant internal returns (bool) {
        if (_addr == 0) return false;
        uint256 size;
        assembly {
        size := extcodesize(_addr)
        }
        return (size > 0);
    }

    // @return How much tokens investor get during specific tokensale
    function balanceOf(address beneficiary) public constant returns (uint256) {
        return lockedAccounts[beneficiary].amount;
    }

    // @notice allows owner to finalize tokensale once tokensale is ended
    function finalize() public notFinalized onlyOwner {
        require(hasEnded());

        finalization();

        Finalized();

        isFinalized = true;
    }

    /**
    * @dev Should be overriden to add specific finalization logic.
    * The overriding function should call super.finalization()
    * to ensure the transfer of token ownership.
    */
    function finalization() internal {
        token.transferOwnership(placeholder);
    }

    /**
    * @notice Tokensale will be ended when time is over or hardcap reached
    * Also tokensale will be considered ended when we have less available
    * tokens than investor can buy for 1 satoshi.
    * @return true if tokensale has ended
    */
    function hasEnded() public constant returns (bool) {
        return (leapRaised >= hardcap() - rate()) || (now >= endTime);
    }

    /**
    *   @notice Investor can send transaction within period of tokensale
    *   and until hard cap is not reached
    *   @param beneficiary The address that will receive tokens should exists.
    *   @return true if the transaction can issue coins
    */
    function validPayment(address beneficiary) public constant returns (bool) {
        bool withinPeriod = now >= startTime && now <= endTime;
        bool withinCap = leapRaised <= hardcap() - rate();
        bool accountExists = beneficiary != 0x0;

        return withinPeriod && withinCap && accountExists;
    }
}