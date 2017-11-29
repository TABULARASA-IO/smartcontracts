pragma solidity ^0.4.11;

import 'zeppelin-solidity/contracts/token/MintableToken.sol';
import 'zeppelin-solidity/contracts/token/PausableToken.sol';

contract LEAP is MintableToken, PausableToken {
    string public constant name = "LEAP Token";
    string public constant symbol = "LEAP";
    uint8 public constant decimals = 18;

    event Refunded(address investor, uint256 amount);

    function refund(address investor) public onlyOwner canMint returns(bool) {
        require(investor != 0);

        uint256 amount = balances[investor];

        balances[investor] = 0;

        totalSupply = totalSupply.sub(amount);

        Refunded(investor, amount);

        return true;
    }
}