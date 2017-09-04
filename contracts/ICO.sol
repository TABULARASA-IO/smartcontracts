pragma solidity ^0.4.11;

import 'zeppelin-solidity/contracts/crowdsale/CappedCrowdsale.sol';
import './Token.sol';

contract ICO is CappedCrowdsale {

  function ICO (
    address _wallet,
    uint256 _startTime,
    uint256 _endTime,
    uint256 _rate,
    uint256 _cap,
    uint256 _limitBeforeAML,
    address _oracle
  ) CappedCrowdsale(_cap)
  {
     require(_startTime >= now);
     require(_endTime >= _startTime);
     require(_rate > 0);
     require(_wallet != 0x0);

     token = new Token(_oracle, _limitBeforeAML);
     startTime = _startTime;
     endTime = _endTime;
     rate = _rate;
     wallet = _wallet;
  }

}
