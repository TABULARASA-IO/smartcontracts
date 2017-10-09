pragma solidity ^0.4.11;

contract TokensaleFake {
    address public lastBeneficiary;
    uint256 public lastBtcAmount;

    address proxy;

    function TokensaleFake(address _proxy) {
        proxy = _proxy;
    }

    function buyCoinsBTC(address beneficiary, uint256 btcAmount) public {
        require(proxy == msg.sender);

        lastBeneficiary = beneficiary;
        lastBtcAmount = btcAmount;
    }
}
