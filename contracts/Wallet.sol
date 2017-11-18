pragma solidity ^0.4.11;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';

contract Wallet {
    using SafeMath for uint256;

    event FundsWithdrawn(address beneficiary, uint256 amount);

    mapping(address => uint) departments;

    uint256 public total;

    function Wallet(address[] wallets, uint[] percentages) {
        require(wallets.length == percentages.length);

        for(uint i = 0; i < wallets.length; i++) {
            departments[wallets[i]] = percentages[i];
        }
    }

    function withdraw() external {
        address department = msg.sender;

        uint256 percentage = departments[department];
        assert(percentage > 0);

        uint256 amount = total.mul(percentage).div(100);
        require(amount > 0);

        departments[department] = 0;

        assert(department.send(amount));

        FundsWithdrawn(department, amount);
    }

    function() payable {
        total += msg.value;
    }
}