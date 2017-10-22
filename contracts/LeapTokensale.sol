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
    uint256 public constant hardcap = 861500000e18;

    address public bounty;
    address public team;
    address public ecosystem;
    address public reserve;

    uint256 public contributorsBasePoints = 4000;
    uint256 public bountyBasePoints = 1000;
    uint256 public teamBasePoints = 1500;
    uint256 public ecosystemBasePoints = 1500;
    uint256 public reserveBasePoints = 2000;

    function finalization() internal {
        uint256 totalCoins = token.totalSupply().mul(10000).div(contributorsBasePoints);

        uint256 toBounty = calculatePortion(totalCoins, bountyBasePoints);
        uint256 toTeam = calculatePortion(totalCoins, teamBasePoints);
        uint256 toEcosystem = calculatePortion(totalCoins, ecosystemBasePoints);
        uint256 toReserve = calculatePortion(totalCoins, reserveBasePoints);

        token.mint(bounty, toBounty);
        token.mint(team, toTeam);
        token.mint(ecosystem, toEcosystem);
        token.mint(reserve, toReserve);
    }

    function calculatePortion(uint256 coins, uint256 basePoints) internal returns (uint256) {
        return coins.mul(basePoints).div(10000);
    }
}