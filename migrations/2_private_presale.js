const Token = artifacts.require("LEAP");
const Placeholder = artifacts.require("LeapTokensalePlaceholder");
const PrivatePresale = artifacts.require("LeapPrivatePreTokensale");
const BitcoinProxy = artifacts.require("BitcoinProxyNoGas");
const BTC = artifacts.require("BTC");

module.exports = function(deployer, network, accounts) {
	if(network === 'development') return;

	let token, placeholder, tokensale, proxy, btcLibrary;

	const startTime = 1512084141118; // 01.12.17 02:22
	const kownWallet = 0x123;
	const leapWallet = 0x456;

	const mainnetBtcRelay = '0x41f274c0023f83391de4e0733c609df5a124c3d4';
	const ropstenBtcRelay = '0x5770345100a27b15f5b40bec86a701f888e8c601';
	const btcRelay = network === 'mainnet' ? mainnetBtcRelay : ropstenBtcRelay;

	deployer.then(function() {
		return deployer.deploy(BTC);
	}).then(function(instance) {
		btcLibrary = instance;
		return deployer.link(BTC, BitcoinProxy);
	}).then(function() {
		return Token.new();
	}).then(function(instance) {
		token = instance;
		return Placeholder.new(token.address);
	}).then(function(instance) {
		placeholder = instance;
		return PrivatePresale.new(startTime, token.address, placeholder.address, kownWallet, leapWallet);
	}).then(function(instance) {
		tokensale = instance;
		return BitcoinProxy.new(btcRelay, tokensale.address);
	}).then(function(instance) {
		proxy = instance;
		return tokensale.setBitcoinProxy(proxy.address);
	}).then(function() {
		return token.pause();
	}).then(function() {
		return token.transferOwnership(tokensale.address);
	})
}