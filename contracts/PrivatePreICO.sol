pragma solidity ^0.4.11;

import './Token.sol';
import './Crowdsale.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

contract PrivatePreICO is Crowdsale {
    Token public token;
    mapping(address => bool) public whitelist;

    event MemberAdded(address member);

    function PrivatePreICO(uint256 _startTime, uint256 _endTime, uint256 _cap, address _wallet, address _token)
        Crowdsale(_startTime, _endTime, _cap, _wallet, _token)
    {
    }

    function issueCoins(address beneficiary, uint256 amount) internal returns(address) {
        token.mint(beneficiary, amount);
        return beneficiary;
    }

    function addMember(address _member) onlyOwner {
        whitelist[_member] = true;
        MemberAdded(_member);
    }

    function isMember(address _investor) public constant returns(bool) {
        return whitelist[_investor];
    }

    // @override Crowdsale.validEthPurchase()
    function validEthPurchase() internal constant returns (bool) {
        return super.validEthPurchase() && isMember(msg.sender);
    }
}