const Token = artifacts.require('LEAP');
const Tokensale = artifacts.require('Tokensale');
const LeapTokensale = artifacts.require('LeapTokensale');
const LeapPreTokensale = artifacts.require('LeapPreTokensale');
const LeapPrivatePreTokensale = artifacts.require('LeapPrivatePreTokensale');
const TokenHolder = artifacts.require('TokenHolder');
const BitcoinProxy = artifacts.require('BitcoinProxy');
const ECRecovery = artifacts.require('ECRecovery');
const BTC = artifacts.require('BTC');
const TokensaleFake = artifacts.require('TokensaleFake');
const LeapPrivatePreTokensaleFake = artifacts.require('LeapPrivatePreTokensaleFake');
const LeapPreTokensaleFake = artifacts.require('LeapPreTokensaleFake');
const LeapTokensaleFake = artifacts.require('LeapTokensaleFake');

module.exports = function(deployer) {
	deployer.deploy(ECRecovery);
	deployer.deploy(BTC);

	deployer.link(ECRecovery, [TokenHolder,  LeapPreTokensale, LeapPrivatePreTokensale, LeapTokensale, TokensaleFake, LeapPrivatePreTokensaleFake, LeapPreTokensaleFake, LeapTokensaleFake]);
	deployer.link(BTC, BitcoinProxy);
};