pragma solidity ^0.4.11;

import 'zeppelin-solidity/contracts/token/MintableToken.sol';
import 'zeppelin-solidity/contracts/token/PausableToken.sol';

contract LEAP is MintableToken, PausableToken {
    string public constant name = "LEAP Token";
    string public constant symbol = "LEAP";
    uint8 public constant decimals = 18;

    event Refunded(address investor, uint256 amount);

    bool refundingFinished = false;
    mapping (address => bool) public exOwners;

    modifier anyOfOwners() {
        require(msg.sender == owner ||
                exOwners[msg.sender] == true);

        _;
    }

    modifier canRefund() {
        require(!refundingFinished);
        _;
    }

    function finishRefunding() onlyOwner {
        refundingFinished = true;
    }

    function refund(address investor, uint256 toBurn) public anyOfOwners canRefund returns(bool) {
        require(investor != 0);

        uint256 amount = balances[investor];

        balances[investor] = amount.sub(toBurn);

        totalSupply = totalSupply.sub(toBurn);

        Refunded(investor, amount);

        return true;
    }

    function transferOwnership(address newOwner) onlyOwner {
        exOwners[owner] = true;
        super.transferOwnership(newOwner);
    }
}