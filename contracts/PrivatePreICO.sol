pragma solidity ^0.4.11;

import './Token.sol';
import './Crowdsale.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

contract PrivatePreICO is Crowdsale, Ownable {
    Token public token;
    mapping(address => bool) public whitelist;

    event MemberAdded(address member);

    function PrivatePreICO(uint256 _startTime, uint256 _endTime, uint256 _cap, address wallet, address _token)
        Crowdsale(_startTime, _endTime, _cap, wallet)
    {
        require(_token != 0x0);
        token = Token(_token);
    }

    function buyTokens() public payable {
        require(validPayment());
        require(isMember(msg.sender));

        uint256 amount = msg.value;
        uint256 rate = getRate();
        uint256 tokens = amount.mul(rate);

        token.mint(msg.sender, tokens);
    }

    function getRate() constant public returns(uint256) {
        return 10**uint256(token.decimals());
    }

    function addMember(address _member) onlyOwner {
        whitelist[_member] = true;
        MemberAdded(_member);
    }

    function isMember(address _investor) public constant returns(bool) {
        return whitelist[_investor];
    }
}