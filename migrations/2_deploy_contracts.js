const Token = artifacts.require('LEAP');
const Tokensale = artifacts.require('Tokensale');
const TheTokensale = artifacts.require('LeapTokensale');
const Presale = artifacts.require('LeapPreTokensale');
const PrivatePresale = artifacts.require('LeapPrivatePreTokensale');
const TokenHolder = artifacts.require('TokenHolder');
const BitcoinProxy = artifacts.require('BitcoinProxy');
const ECRecovery = artifacts.require('ECRecovery');
const BTC = artifacts.require('BTC');

module.exports = function(deployer) {
	deployer.deploy(ECRecovery);
	deployer.deploy(BTC);

	deployer.link(ECRecovery, [TokenHolder, Tokensale, Presale, PrivatePresale]);;
	deployer.link(BTC, BitcoinProxy);
};