pragma solidity ^0.4.11;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import './LEAP.sol';
import './TokenHolder.sol';
import './BitcoinProxy.sol';
import './LeapTokensalePlaceholder.sol';

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

    uint256 public btcMultiplierBasePoints = 10000;

    bool public isFinalized = false;

    struct Contribution {
        address beneficiary;
        uint256 amount;
        bool isContribution;
    }

    mapping(address => Contribution) public lockedAccounts;
    address[] public accountsIndex;

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
        require(msg.sender == address(proxy));
        _;
    }

    function hardcap() public constant returns (uint256);
    function duration() public constant returns (uint256);
    function releaseDuration() public constant returns (uint256);
    function rate() public constant returns (uint256);
    function forwardFunds(uint256 amount) internal;

    function btcRate() public constant returns (uint256) {
        return rate().mul(btcMultiplierBasePoints).div(1000);
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
        endTime = startTime + duration();
        token = LEAP(_token);
        proxy = BitcoinProxy(_proxy);
        placeholder = LeapTokensalePlaceholder(_placeholder);
        wallet = _wallet;
    }

    function updateBitcoinMultiplier(uint256 _rate) public onlyOwner {
        btcMultiplierBasePoints = _rate;
        BitcoinRateChanged(_rate);
    }

    function buyCoinsETH() public payable {
        address beneficiary = msg.sender;

        require(validPayment(beneficiary));

        require(!isContract(msg.sender));

        uint256 weiAmount = msg.value;
        uint256 leftForSale = hardcap().sub(leapRaised);

        if(weiAmount > 0) {
            if(leftForSale > 0) {
                uint256 coinsAmount = weiAmount.mul(rate());

                if(coinsAmount > leftForSale) {
                    coinsAmount = leftForSale;
                    weiAmount = leftForSale.div(rate());
                }

                leapRaised = leapRaised.add(coinsAmount);

                address account = issueCoins(beneficiary, coinsAmount);

                weiRaisedBy[beneficiary] = weiRaisedBy[beneficiary].add(weiAmount);

                TokenPurchaseETH(beneficiary, account, weiAmount, coinsAmount);

                forwardFunds(weiAmount);
            } else {
                weiAmount = 0;
            }
        }

        uint256 charge = msg.value.sub(weiAmount);
        if(charge > 0) {
            msg.sender.transfer(charge);

            ETHCharge(charge, msg.sender);
        }
    }

    function isContract(address _addr) constant internal returns (bool) {
        if (_addr == 0) return false;
        uint256 size;
        assembly {
        size := extcodesize(_addr)
        }
        return (size > 0);
    }

    function buyCoinsBTC(address beneficiary, uint256 btcAmount)
    onlyFromBitcoinProxy {

        require(validPayment(beneficiary));

        uint256 leftForSale = hardcap().sub(leapRaised);

        uint256 btcAmountPaid = btcAmount;

        if(btcAmountPaid > 0) {
            if(leftForSale > 0) {
                uint256 coinsAmount = btcAmount.mul(btcRate());

                if(coinsAmount > leftForSale) {
                    coinsAmount = leftForSale;
                    btcAmountPaid = leftForSale.div(btcRate());
                }

                leapRaised = leapRaised.add(coinsAmount);

                address account = issueCoins(beneficiary, coinsAmount);

                satoshiRaisedBy[beneficiary] = satoshiRaisedBy[beneficiary].add(btcAmount);

                TokenPurchaseBTC(beneficiary, account, btcAmount, coinsAmount);
            } else {
                btcAmountPaid = 0;
            }
        }

        uint256 charge = btcAmount.sub(btcAmountPaid);
        if(charge > 0) {
            BitcoinCharge(charge, beneficiary);
        }
    }

    function issueCoins(address beneficiary, uint256 amount) internal returns(address) {
        if(lockedAccounts[beneficiary].isContribution == false) {
            accountsIndex.push(beneficiary);
        }

        lockedAccounts[beneficiary].isContribution = true;
        lockedAccounts[beneficiary].amount= lockedAccounts[beneficiary].amount.add(amount);

        return beneficiary;
    }

    function balanceOf(address beneficiary) public constant returns (uint256) {
        return lockedAccounts[beneficiary].amount;
    }

    function releaseCoins() public onlyOwner {
        for(uint256 i = 0; i < accountsIndex.length; i++) {
            address beneficiary = accountsIndex[i];
            uint256 balance = lockedAccounts[beneficiary].amount;

            if(balance > 0) {
                lockedAccounts[beneficiary].amount = 0;
                token.mint(beneficiary, balance);
            }
        }
    }

    function refund(address beneficiary) public payable onlyOwner {
        require(msg.value >= weiRaisedBy[beneficiary]);

        lockedAccounts[beneficiary].amount = 0;

        beneficiary.transfer(msg.value);
    }

    function finalize() public notFinalized onlyOwner {
        require(hasEnded());

        finalization();

        Finalized();

        isFinalized = true;
    }

    function finalization() internal {
        token.transferOwnership(placeholder);
    }

    function hasEnded() public constant returns (bool) {
        return (leapRaised >= hardcap() - rate()) || (now >= endTime);
    }

    function validPayment(address beneficiary) public constant returns (bool) {
        bool withinPeriod = now >= startTime && now <= endTime;
        bool withinCap = leapRaised <= hardcap() - rate();
        bool accountExists = beneficiary != 0x0;

        return withinPeriod && withinCap && accountExists;
    }

    function getContributorsCount() public constant returns (uint256) {
        return accountsIndex.length;
    }
}