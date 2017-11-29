pragma solidity ^0.4.11;

import 'zeppelin-solidity/contracts/token/MintableToken.sol';
import 'zeppelin-solidity/contracts/token/PausableToken.sol';

contract LEAP is MintableToken, PausableToken {
    string public constant name = "LEAP Token";
    string public constant symbol = "LEAP";
    uint8 public constant decimals = 18;

    function mintAll(address[] investors, uint256[] amounts) public {
        for(uint256 i = 0; i < investors.length; i++) {
            mint(investors[i], amounts[i]);
        }
    }
}
