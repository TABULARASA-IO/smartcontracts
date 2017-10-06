pragma solidity ^0.4.11;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import './LEAP.sol';

contract LeapTokensalePlaceholder is Ownable {
    LEAP public token;

    function LeapTokensalePlaceholder(address _token){
        token = LEAP(_token);
    }

    function changeTokenController(address newOwner) onlyOwner {
        token.transferOwnership(newOwner);
        selfdestruct(newOwner);
    }
}
