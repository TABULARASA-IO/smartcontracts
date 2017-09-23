pragma solidity ^0.4.11;

import './TokenHolder.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

contract TokenHolderFactory is Ownable {
    mapping(address => address) public lockedAccounts;

    address public signer;
    address public token;

    uint256 releaseAfter;
    uint256 releaseBefore;

    event TokenHolderCreated(address beneficiary, address account);

    function TokenHolderFactory(address _token, address _signer, uint256 _releaseAfter, uint256 _releaseBefore) {
        require(_signer != 0x0);
        require(_token != 0x0);
        require(_releaseAfter > now);

        signer = _signer;
        token = _token;
        releaseAfter = _releaseAfter;
        releaseBefore = _releaseBefore;
    }

    function createTokenHolder(address _beneficiary) onlyOwner
        public returns(address)
    {
        require(_beneficiary != 0x0);

        if(lockedAccounts[_beneficiary] != 0) {
            return lockedAccounts[_beneficiary];
        }

        TokenHolder account = new TokenHolder(
            token,
            signer,
            _beneficiary,
            releaseAfter,
            releaseBefore
        );
        lockedAccounts[_beneficiary] = account;

        TokenHolderCreated(_beneficiary, account);

        return account;
    }

    function getTokenHolder(address _beneficiary) public constant returns(address) {
        return lockedAccounts[_beneficiary];
    }
}