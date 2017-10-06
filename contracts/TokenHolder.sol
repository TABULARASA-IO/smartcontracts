pragma solidity ^0.4.11;

import 'zeppelin-solidity/contracts/ECRecovery.sol';
import './LEAP.sol';

contract TokenHolder {
    LEAP public token;

    address public beneficiary;
    address public signer;

    uint256 public releaseStart;
    uint256 public releaseEnd;

    function TokenHolder(
        address _token,
        address _signer,
        address _beneficiary,
        uint256 _releaseStart,
        uint256 _releaseEnd
    ) {
        token = LEAP(_token);
        beneficiary = _beneficiary;
        signer = _signer;
        releaseStart = _releaseStart;
        releaseEnd = _releaseEnd;
    }

    modifier readyForRelease() {
        require(now >= releaseStart);
        require(now <= releaseEnd);
        _;
    }

    modifier validSignature(bytes signature) {
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        bytes32 hash = keccak256(prefix, sha3(address(this)));
        require(ECRecovery.recover(hash, signature) == signer);
        _;
    }

    modifier onlyFromBeneficiary() {
        require(msg.sender == beneficiary);
        _;
    }

    modifier nonZeroBalance() {
        require(token.balanceOf(this) > 0);
        _;
    }

    function release(bytes signature)
        onlyFromBeneficiary
        readyForRelease
        nonZeroBalance
        validSignature(signature)
        public
    {
        token.transfer(beneficiary, token.balanceOf(this));
    }

    function() payable {
        revert();
    }
}