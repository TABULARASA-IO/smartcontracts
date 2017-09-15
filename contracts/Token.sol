pragma solidity ^0.4.11;

import 'zeppelin-solidity/contracts/token/MintableToken.sol';

contract Token is MintableToken {
  string public constant name = "GameLeapToken";
  string public constant symbol = "GLT";
  uint8 public constant decimals = 18;

  bool public transfersEnabled = false;

  modifier whenTransfersEnabled() {
    require(transfersEnabled == true);
    _;
  }

  function enableTransfers() onlyOwner {
    transfersEnabled = true;
  }

  function disableTransfers() onlyOwner {
    transfersEnabled = false;
  }

  function transfer(address _to, uint256 _value) whenTransfersEnabled returns (bool) {
    return super.transfer(_to, _value);
  }

  function transferFrom(address _from, address _to, uint256 _value) whenTransfersEnabled returns (bool) {
    return super.transferFrom(_from, _to, _value);
  }
}