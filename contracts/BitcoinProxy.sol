pragma solidity ^0.4.11;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import './BTC.sol';
import './Tokensale.sol';

contract BitcoinProxy is Ownable {
    Tokensale public tokensale;

    address public btcRelay;
    bytes20 btcWallet;

    // investor should promise to pay X Satoshi before the payment
    mapping(address => uint256) public promises;

    // investor should claim fulfilled transaction with hash
    mapping(uint256 => address) public claimed;

    mapping(uint256 => bool) public processed;

    function BitcoinProxy(address _btcRelay, bytes20 _btcWallet, address _tokensale) {
        btcRelay = _btcRelay;
        btcWallet = _btcWallet;
        tokensale = Tokensale(_tokensale);
    }

    function processTransaction(bytes txBytes, uint256 txHash)
        onlyFromRelay
        notProcessed(txHash)
        returns(int256) {

        address beneficiary = claimed[txHash];
        uint256 satoshiAmount = promises[beneficiary];

        bool sent = BTC.checkValueSent(txBytes, btcWallet, satoshiAmount);

        if(sent) {
            processed[txHash] = true;
            delete promises[beneficiary];
            tokensale.buyCoinsBTC(beneficiary, satoshiAmount);
            return 1;
        } else {
            return 0;
        }
    }

    function promise(uint256 amount) public {
        require(promises[msg.sender] == 0);

        promises[msg.sender] = amount;
    }

    function claim(uint256 hash) public {
        require(promises[msg.sender] != 0);
        require(claimed[hash] == 0x0);

        claimed[hash] = msg.sender;
    }

    modifier onlyFromRelay() {
        require(msg.sender == btcRelay);
        _;
    }

    modifier notProcessed(uint256 txHash) {
        require(processed[txHash] == false);
        _;
    }
}