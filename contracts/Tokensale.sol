pragma solidity ^0.4.11;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import './LEAP.sol';
import './TokenHolder.sol';
import './BitcoinProxy.sol';
import './LeapTokensalePlaceholder.sol';

// owner should finalize tokensale and sign verified transactions
contract Tokensale is Ownable {
    using SafeMath for uint256;

    address public wallet;

    MintableToken public token;
    BitcoinProxy public proxy;
    LeapTokensalePlaceholder public placeholder;

    uint256 public startTime;
    uint256 public endTime;

    uint256 public leapRaised;
    mapping(address => uint256) public weiRaisedBy;
    mapping(address => uint256) public satoshiRaisedBy;

    uint256 public constant duration = 14 days;
    uint256 public constant hardcap = 10000000e18; // 10M leap coins with 18 decimals
    uint256 public constant releaseDuration = 7 days;

    bool public isFinalized = false;

    mapping(address => address) public lockedAccounts;

    event TokenPurchaseETH(address beneficiary, address account, uint256 weiAmount, uint256 coinsAmount);
    event TokenPurchaseBTC(address beneficiary, address account, uint256 weiAmount, uint256 coinsAmount);
    event Finalized();

    modifier notFinalized() {
        require(!isFinalized);
        _;
    }

    modifier onlyFromBitcoinProxy() {
        require(msg.sender == address(proxy));
        _;
    }

    function Tokensale(
        uint256 _startTime,
        address _token,
        address _proxy,
        address _placeholder,
        address _wallet
    ) {
        require(_startTime >= now);

        startTime = _startTime;
        endTime = startTime + duration;
        token = LEAP(_token);
        proxy = BitcoinProxy(_proxy);
        placeholder = LeapTokensalePlaceholder(_placeholder);
        wallet = _wallet;
    }

    function buyCoinsETH() public payable {
        address beneficiary = msg.sender;
        uint256 weiAmount = msg.value;

        uint256 coinsAmount = ethCalculateCoinsAmount(weiAmount);

        require(validPayment(msg.sender, coinsAmount));

        address account = issueCoins(beneficiary, coinsAmount);

        leapRaised = leapRaised.add(coinsAmount);

        weiRaisedBy[beneficiary] = weiRaisedBy[beneficiary].add(weiAmount);

        TokenPurchaseETH(beneficiary, account, weiAmount, coinsAmount);

        forwardFunds();
    }

    function buyCoinsBTC(address beneficiary, uint256 btcAmount)
        onlyFromBitcoinProxy {

        uint256 coinsAmount = btcCalculateCoinsAmount(btcAmount);

        require(validPayment(beneficiary, coinsAmount));

        address account = issueCoins(beneficiary, coinsAmount);

        leapRaised = leapRaised.add(coinsAmount);

        satoshiRaisedBy[beneficiary] = satoshiRaisedBy[beneficiary].add(btcAmount);

        TokenPurchaseBTC(beneficiary, account, btcAmount, coinsAmount);
    }

    function forwardFunds() internal {
        wallet.transfer(msg.value);
    }

    function btcCalculateCoinsAmount(uint256 paymentAmount) public constant returns (uint256) {
        uint256 currentRate = 10000000;
        uint256 amount = paymentAmount * currentRate;
        return amount;
    }

    function ethCalculateCoinsAmount(uint256 paymentAmount) public constant returns (uint256) {
        uint256 currentRate = 1000000;
        uint256 amount = paymentAmount * currentRate;
        return amount;
    }

    function issueCoins(address beneficiary, uint256 amount)
        internal
        returns(address) {

        if(lockedAccounts[beneficiary] == 0x0) {
            lockedAccounts[beneficiary] = address(
                new TokenHolder(
                    token,
                    owner,
                    beneficiary,
                    startTime,
                    endTime + releaseDuration
                )
            );
        }

        address lockedAccount = lockedAccounts[beneficiary];
        token.mint(lockedAccount, amount);
        return lockedAccount;
    }

    function validPayment(address beneficiary, uint256 amount) public constant returns(bool) {
        bool withinPeriod = now >= startTime && now <= endTime;
        bool withinCap = leapRaised.add(amount) <= hardcap;
        bool accountExists = beneficiary != 0x0;

        return withinPeriod && withinCap && accountExists;
    }

    function hasEnded() public constant returns(bool) {
        return leapRaised >= hardcap || now >= endTime;
    }

    function finalize() public notFinalized
        onlyOwner {
        require(hasEnded());

        finalization();

        Finalized();

        isFinalized = true;
    }

    function finalization() internal {
        token.transferOwnership(placeholder);
    }
}