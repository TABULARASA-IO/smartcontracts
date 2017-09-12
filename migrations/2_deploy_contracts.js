const Token = artifacts.require('Token');
const Crowdsale = artifacts.require('ICO');
const ECRecovery = artifacts.require('ECRecovery');
const TokenHolder = artifacts.require('TokenHolder');
const TokenHolderFactory = artifacts.require('TokenHolderFactory');

module.exports = function(deployer) {
	deployer.deploy(ECRecovery);
	deployer.link(ECRecovery, [Token, TokenHolder, TokenHolderFactory]);
};