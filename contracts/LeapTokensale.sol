pragma solidity ^0.4.11;

import './Tokensale.sol';

contract LeapTokensale is Tokensale {
    function LeapTokensale(
        uint256 _startTime,
        address _token,
        address _proxy,
        address _placeholder,
        address _wallet,
        address _bounty,
        address _team,
        address _ecosystem,
        address _reserve
    ) Tokensale(
        _startTime,
        _token,
        _proxy,
        _placeholder,
        _wallet
        ) {

        bounty = _bounty;
        team = _team;
        ecosystem = _ecosystem;
        reserve = _reserve;
    }

    uint256 public constant duration = 14 days;
    uint256 public constant hardcap = 400000000e18;

    address public bounty;
    address public team;
    address public ecosystem;
    address public reserve;

    uint256 public contributorsPercentage = 40;
    uint256 public bountyPercentage = 10;
    uint256 public teamPercentage = 15;
    uint256 public ecosystemPercentage = 15;
    uint256 public reservePercentage = 20;

    function finalization() internal {
        uint256 toContributors = percent(contributorsPercentage);

        uint256 totalCoins = token.totalSupply().mul(percent(100)).div(toContributors);

        uint256 toBounty = totalCoins.mul(bountyPercentage).div(percent(100));
        uint256 toTeam = totalCoins.mul(teamPercentage).div(percent(100));
        uint256 toEcosystem = totalCoins.mul(ecosystemPercentage).div(percent(100));
        uint256 toReserve = totalCoins.mul(reservePercentage).div(percent(100));

        token.mint(bounty, toBounty);
        token.mint(team, toTeam);
        token.mint(ecosystem, toEcosystem);
        token.mint(reserve, toReserve);
    }

    function percent(uint256 p) internal returns (uint256) {
        return p.mul(10**16);
    }
}