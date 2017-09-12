pragma solidity ^0.4.11;

import 'zeppelin-solidity/contracts/token/MintableToken.sol';
import 'zeppelin-solidity/contracts/ECRecovery.sol';

contract Token is MintableToken {
  string public constant name = "GameLeapToken";
  string public constant symbol = "GLT";
  uint8 public constant decimals = 18;

  mapping (address => uint256) public frozenBalances;

  bool public transfersEnabled = false;
  bool public mintingFinished = false;

  address public confirmingOracle;

  modifier onlyConfirmingOracle() {
    require(msg.sender == confirmingOracle);
    _;
  }

  modifier whenTransfersEnabled() {
    require(transfersEnabled == true);
    _;
  }

  modifier onlySigned(address investor, bytes signature) {
    bytes memory prefix = "\x19Ethereum Signed Message:\n32";
    bytes32 hash = keccak256(prefix, sha3(investor));
    require(ECRecovery.recover(hash, signature) == confirmingOracle);
    _;
  }

  function Token(address _oracle) {
    confirmingOracle = _oracle;
  }

  function mint(address _to, uint256 _amount) onlyOwner canMint returns(bool) {
    totalSupply = totalSupply.add(_amount);
    balances[_to] = balances[_to].add(_amount);
    Mint(_to, _amount);
    Transfer(0x0, _to, _amount);
    return true;
  }

  function frozenBalanceOf(address investor) constant returns (uint256 balance) {
    return frozenBalances[investor];
  }

  function enableTransfers() onlyOwner {
    transfersEnabled = true;
  }

  function disableTransfers() onlyOwner {
    transfersEnabled = false;
  }

  function activateTokens(bytes signature) onlySigned(msg.sender, signature) public returns(bool) {
    balances[msg.sender] = balances[msg.sender].add(frozenBalances[msg.sender]);
    frozenBalances[msg.sender] = 0;
  }

  function transfer(address _to, uint256 _value) whenTransfersEnabled returns (bool) {
    return super.transfer(_to, _value);
  }

  function transferFrom(address _from, address _to, uint256 _value) whenTransfersEnabled returns (bool) {
    return super.transferFrom(_from, _to, _value);
  }
}