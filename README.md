# LEAP Token

- [Whitepaper](https://docs.google.com/document/d/1ugmy5CxX4ek-QRGdh8aeiQWD5LNFrbOXaBGXeg9Sn98/edit?usp=sharing)

## Contracts

- [LEAP.sol](/contracts/LEAP.sol): Main contract for the token.
- [LeapTokensalePlaceholder.sol](/contracts/LeapTokensalePlaceholder.sol): Placeholder for token owner between ICO stages.
- **REMOVED** [TokenHolder.sol](/contracts/TokenHolder.sol): Contract where tokens belonging to specific investor will be held before KYC/AML verification. This contract will release this tokens for specific beneficiary after KYC/AML verification.
    **We made a decision to avoid burdening investors with tricky unlocking logic after KYC confirmation.
    Instead we will give you tokens just after payment. But we will burn your tokens if you will not follow KYC.**
- [Tokensale.sol](/contracts/Tokensale.sol): Basic tokensale implementation.
- [LeapTokensale.sol](/contracts/LeapTokensale.sol): Contract for the main tokensale.
- [LeapPreTokensale.sol](/contracts/LeapPreTokensale.sol): Contract for the Pre-Tokensale.
- [LeapPrivatePreTokensale.sol](/contracts/SNT.sol): Contract for the Private Pre-Tokensale.
- [BitcoinProxy.sol](/contracts/BitcoinProxy.sol): Proxy transferring bitcoin transactions from relay to tokensale.
- [BitcoinProxyNoGas.sol](/contracts/BitcoinProxyNoGas.sol): Proxy transferring bitcoin transactions from relay to tokensale.
    **We made a decision to avoid burdening investors with bitcoin transaction hashes.
    Instead we will process your transaction and pay for gas by ourselves. You are welcome to make bitcoin transaction to your personal unique wallet even if you haven't ETH on your ethereum wallet.** 
- [BTC.sol](/contracts/BTC.sol): Library for bitcoin transactions verification.
- [MultiSigWallet.sol](/contracts/MultiSigWallet.sol): Multisig contract for funding wallet.
- [BitcoinRelayFake.sol](/contracts/BitcoinRelayFake.sol): Contract for testing bitcoin relay. BTCRelay network should be used in production instead.
- [TokensaleFake.sol](/contracts/TokensaleFake.sol): Contract for testing basic tokensale implementation. Should not be used in production.

## Reviewers and audits.

Code for the LEAP Token and the offering is being reviewed by: