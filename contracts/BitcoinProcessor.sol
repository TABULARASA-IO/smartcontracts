pragma solidity ^0.4.11;

contract BitcoinProcessor {
    uint256 public lastTxHash;
    uint256 public ethBlock;
    bytes public lastTx;

    address public btcRelay;
    bytes20 btcWallet;

    mapping(address => uint256) public promises;
    mapping(uint256 => address) public hashes;

    function BitcoinProcessor(address _trustedBTCRelay) {
        btcRelay = _trustedBTCRelay;
    }

    function processTransaction(bytes txBytes, uint256 txHash) onlyRelay returns(int256) {
        address beneficiary = hashes[txHash];
        uint256 btcAmount = promises[beneficiary];

        require(beneficiary != 0x0);
        require(btcAmount != 0);

        bool sent = true;
        //bool sent = BTC.checkValueSent(txBytes, btcWallet, btcAmount);

        if(sent) {
            buyTokensBtc(beneficiary, btcAmount);
            delete promises[beneficiary];
            return 0;
        } else {
            return 1;
        }
    }

    function promise(uint256 amount) has_no_promises public {
        promises[msg.sender] = amount;
    }

    function claim(uint256 hash) has_promise public {
        hashes[hash] = msg.sender;
    }

    function undoPromise() public {
        promises[msg.sender] = 0;
    }

    modifier has_no_promises () {
        require(promises[msg.sender] == 0);
        _;
    }

    modifier has_promise () {
        require(promises[msg.sender] > 0);
        _;
    }

    modifier onlyRelay() {
        require(msg.sender == btcRelay);
        _;
    }

    // virtual template method
    function buyTokensBtc(address beneficiary, uint256 btcAmount) internal;
}