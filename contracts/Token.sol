pragma solidity ^0.4.11;

import 'zeppelin-solidity/contracts/token/MintableToken.sol';

contract Token is MintableToken {
  string public constant name = "GameLeapToken";
  string public constant symbol = "GLT";
  uint8 public constant decimals = 18;

  mapping (address => uint256) frozenBalances;
  mapping (address => uint256) supply;

  mapping (address => bool) KYC;
  mapping (address => bool) AML;

  bool transfersEnabled = false;
  bool mintingFinished = false;

  address confirmingOracle;

  uint256 limitBeforeAML;

  modifier onlyConfirmingOracle() {
    require(msg.sender == confirmingOracle);
    _;
  }

  modifier onlyWhenTransfersEnabled() {
    require(transfersEnabled == true);
    _;
  }

  function () payable {
    throw;
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

  function enableTransfers() onlyOwner {
    transfersEnabled = true;
  }

  function disableTransfers() onlyOwner {
    transfersEnabled = false;
  }

  function confirmTokens() {
    if(!checkKYC(msg.sender)) {
        throw;
    }

    if(checkSupply(msg.sender) > limitBeforeAML) {
        if(!checkAML(msg.sender)) {
            throw;
        }
    }

    frozenBalances[msg.sender] = balances[msg.sender];
    balances[msg.sender] = 0;
  }

  function checkSupply(address investor) {
    return supply[investor];
  }

  function confirmKYC(address investor) onlyConfirmingOracle {
    KYC[investor] = true;
  }

  function confirmAML(address investor) onlyConfirmingOracle {
    AML[investor] = true;
  }

  function transfer(address _to, uint256 _value) onlyWhenTransfersEnabled returns (bool) {
    return super.transfer(_to, _value);
  }

  function transferFrom(address _from, address _to, uint256 _value) onlyWhenTransfersEnabled returns (bool) {
    return super.transferFrom(_from, _to, _value);
  }

  function approve(address _spender, uint256 _value) onlyWhenTransfersEnabled returns (bool) {
    return super.approve(_spender, _value);
  }

  function increaseApproval(address _spender, uint _addedValue) onlyWhenTransfersEnabled returns (bool success) {
    return super.increaseApproval(_spender, _addedValue);
  }

  function decreaseApproval(address _spender, uint _subtractedValue) onlyWhenTransfersEnabled returns (bool success) {
    return super.decreaseApproval(_spender, _subtractedValue);
  }

  function checkKYC(address investor) {
    return KYC[investor];
  }

  function checkAML(address investor) {
    return AML[investor];
  }
}