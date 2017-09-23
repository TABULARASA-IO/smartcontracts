pragma solidity ^0.4.11;

import './Token.sol';
import 'zeppelin-solidity/contracts/ECRecovery.sol';

contract TokenHolder {
    Token public token;

    address public beneficiary;
    address public signer;

    uint256 public releaseAfter;
    uint256 public releaseBefore;

    modifier checkTime() {
        require(now >= releaseAfter);
        require(now <= releaseBefore);
        _;
    }

    modifier checkSignature(bytes signature) {
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        bytes32 hash = keccak256(prefix, sha3(address(this)));
        require(ECRecovery.recover(hash, signature) == signer);
        _;
    }

    modifier checkSender(address _sender) {
        require(beneficiary == _sender);
        _;
    }

    modifier checkBalance() {
        require(token.balanceOf(this) > 0);
        _;
    }

    function TokenHolder(address _token, address _signer, address _beneficiary, uint256 _releaseAfter, uint256 _releaseBefore) {
        require(_token != 0x0);
        require(_beneficiary != 0x0);
        require(_signer != 0x0);
        require(_releaseAfter > now);
        require(_releaseBefore > _releaseAfter);

        token = Token(_token);
        beneficiary = _beneficiary;
        signer = _signer;
        releaseAfter = _releaseAfter;
        releaseBefore = _releaseBefore;
    }

    function release(bytes signature)
        checkTime
        checkBalance
        checkSender(msg.sender)
        checkSignature(signature)
    {
        token.transfer(beneficiary, token.balanceOf(this));
    }

    function() payable {
        throw;
    }
}