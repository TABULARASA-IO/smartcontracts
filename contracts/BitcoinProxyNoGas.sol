pragma solidity ^0.4.11;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import './BTC.sol';
import './Tokensale.sol';

contract BitcoinProxyNoGas is Ownable {
    address public btcrelay;

    Tokensale public tokensale;

    mapping(bytes20 => address) public wallets;

    mapping(uint256 => bool) processedTransactions;

    modifier onlyFromBtcRelay() {
        require(msg.sender == btcrelay);
        _;
    }

    event LogAddress(address _value);
    event LogBytes20(bytes20 _value);

    function BitcoinProxyNoGas(address _btcrelay, address _tokensale) {
        btcrelay = _btcrelay;
        tokensale = Tokensale(_tokensale);
    }

    function setWalletForInvestor(address investor, bytes20 beneficiary) onlyOwner {
        require(wallets[beneficiary] == 0);
        wallets[beneficiary] = investor;
    }

    function processTransaction(bytes txBytes, uint256 txHash)
        onlyFromBtcRelay
        returns (int256) {

        require(processedTransactions[txHash] == false);
        processedTransactions[txHash] = true;

        var (amount, beneficiary, value2, address2) = BTC.getFirstTwoOutputs(txBytes);

        address investor = wallets[beneficiary];

        require(amount > 0);

        tokensale.buyCoinsBTC(investor, amount);

        return 1;
    }
}