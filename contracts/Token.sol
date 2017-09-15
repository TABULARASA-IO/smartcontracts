pragma solidity ^0.4.11;

import 'zeppelin-solidity/contracts/token/MintableToken.sol';
import 'zeppelin-solidity/contracts/token/PausableToken.sol';

contract Token is MintableToken, PausableToken {
  string public constant name = "GameLeapToken";
  string public constant symbol = "LEAP";
  uint8 public constant decimals = 18;
}