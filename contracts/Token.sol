pragma solidity ^0.4.11;

import 'zeppelin-solidity/contracts/token/MintableToken.sol';
import 'zeppelin-solidity/contracts/ECRecovery.sol';

contract Token is MintableToken {
  string public constant name = "GameLeapToken";
  string public constant symbol = "GLT";
  uint8 public constant decimals = 18;

  mapping (address => uint256) public frozenBalances;
  mapping (address => uint256) public supply;

  mapping (address => bool) public KYC;
  mapping (address => bool) public AML;

  bool public transfersEnabled = false;
  bool public mintingFinished = false;

  address public confirmingOracle;

  uint256 public limitBeforeAML;

  event LogAddress(address _address);
  event LogBytes32(bytes32 _bytes32);

  modifier onlyConfirmingOracle() {
    require(msg.sender == confirmingOracle);
    _;
  }

  modifier whenTransfersEnabled() {
    require(transfersEnabled == true);
    _;
  }

  modifier onlyWhenConfirmed(address investor) {
    require(checkKYC(investor) == true);
    require(supplyBy(investor) < limitBeforeAML || checkAML(investor) == true);
    _;
  }

  modifier whenInvestorSigned(address investor, bytes signature) {
    LogBytes32(sha3(investor));
    require(ECRecovery.recover(sha3(investor), signature) == confirmingOracle);
    _;
  }

  modifier onlySigned(address investor, bytes signature) {
    bytes memory prefix = "\x19Ethereum Signed Message:\n32";
    bytes32 hash = keccak256(prefix, sha3(investor));
    require(ECRecovery.recover(hash, signature) == confirmingOracle);
    _;
  }

  function Token(address _oracle, uint256 _aml) {
    confirmingOracle = _oracle;
    limitBeforeAML = _aml;
  }

  function mint(address _to, uint256 _amount) onlyOwner canMint returns(bool) {
    totalSupply = totalSupply.add(_amount);
    supply[_to] = supply[_to].add(_amount);
    frozenBalances[_to] = frozenBalances[_to].add(_amount);
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

  function addKYC(address investor) onlyConfirmingOracle {
    KYC[investor] = true;
  }

  function addAML(address investor) onlyConfirmingOracle {
    AML[investor] = true;
  }

  function checkKYC(address investor) constant returns (bool exist) {
    return KYC[investor];
  }

  function checkAML(address investor) constant returns (bool exist) {
    return AML[investor];
  }

  function supplyBy(address investor) constant returns (uint256 amount) {
    return supply[investor];
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