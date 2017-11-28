pragma solidity ^0.4.11;

import './Tokensale.sol';

contract LeapTokensale is Tokensale {
    function LeapTokensale(
        uint256 _startTime,
        address _token,
        address _placeholder,
        address _wallet,
        address _bounty,
        address _team,
        address _ecosystem,
        address _reserve
    ) Tokensale(
        _startTime,
        _token,
        _placeholder,
        _wallet
        ) {

        bounty = _bounty;
        team = _team;
        ecosystem = _ecosystem;
        reserve = _reserve;
    }

    function hardcap() public constant returns (uint256) {
        return 261500000e18;
    }
    function duration() public constant returns (uint256) {
        return 14 days;
    }
    function releaseDuration() public constant returns (uint256) {
        return 7 days;
    }

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
        uint256 totalCoins = 1000000000e18;
        uint256 contributorsCoins = token.totalSupply();

        uint256 contributorsBasePointsCalculated = contributorsCoins.mul(10000).div(totalCoins);

        if(contributorsBasePointsCalculated < contributorsBasePoints) {
            reserveBasePoints = reserveBasePoints.add(contributorsBasePoints).sub(contributorsBasePointsCalculated);
        }

        uint256 toBounty = calculatePortion(totalCoins, bountyBasePoints);
        uint256 toTeam = calculatePortion(totalCoins, teamBasePoints);
        uint256 toEcosystem = calculatePortion(totalCoins, ecosystemBasePoints);
        uint256 toReserve = calculatePortion(totalCoins, reserveBasePoints);

        token.mint(bounty, toBounty);
        token.mint(team, toTeam);
        token.mint(ecosystem, toEcosystem);
        token.mint(reserve, toReserve);

        super.finalization();
    }

    function calculatePortion(uint256 coins, uint256 basePoints) internal returns (uint256) {
        return coins.mul(basePoints).div(10000);
    }

    function forwardFunds(uint256 amount) internal {
        wallet.transfer(amount);
    }

    function rate() public constant returns (uint256) {
        if(leapRaised < 36000000e18) {
            return 3600;
        } else if(leapRaised < 82000000e18) {
            return 3450;
        } else if(leapRaised < 137000000e18) {
            return 3300;
        } else if(leapRaised < 201500000e18) {
            return 3225;
        } else {
            return 3000;
        }
    }
}