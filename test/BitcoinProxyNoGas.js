const BitcoinProxy = artifacts.require('BitcoinProxyNoGas');
const Tokensale = artifacts.require('TokensaleFake');
const Token = artifacts.require('LEAP');

const {setTime, latestTime, expect, expectThrow} = require('./utils');

contract("BitcoinProxyNoGas", function([deployer, investor, hacker, placeholder, wallet]) {
	const btcWallet = "0xe1b67c3a7f8977fac55a15dbdb19c7a175676d73";
	const satoshiAmount = 12345678;
	const txBytes = "0x0100000001a58cbbcbad45625f5ed1f20458f393fe1d1507e254265f09d9746232da4800240000000000ffffffff024e61bc00000000001976a914e1b67c3a7f8977fac55a15dbdb19c7a175676d7388ac3041ab00000000001976a91438923a989763397163a08d5498d903a0b86b9ac988ac00000000";
	const txHash = web3.sha3(txBytes);
	const expectedBalance = satoshiAmount * 5000 * new web3.BigNumber(10).pow(11);

	beforeEach(async function() {
		this.token = await Token.new();

		this.tokensale = await Tokensale.new(
			latestTime() + 3600,
			this.token.address,
			placeholder,
			wallet
		);

		this.proxy = await BitcoinProxy.new(deployer, this.tokensale.address);

		await this.tokensale.setBitcoinProxy(this.proxy.address);
		await this.token.transferOwnership(this.tokensale.address);

		await setTime(latestTime() + 3600);
	});

	it("should be initialized correctly", async function() {
		expect(await this.proxy.btcrelay()).to.be.equal(deployer);
		expect(await this.proxy.owner()).to.be.bignumber.equal(deployer);
	});

	it("should bind btc wallet to ethereum address", async function() {
		await this.proxy.setWalletForInvestor(investor, btcWallet);
		expect(await this.proxy.wallets(btcWallet)).to.be.equal(investor);
	});

	it("should fail to set wallet by hacker", async function() {
		await expectThrow(this.proxy.setWalletForInvestor(investor, btcWallet, {from: hacker}));
	});

	it("should process transaction correctly", async function() {
		await this.proxy.setWalletForInvestor(investor, btcWallet);
		const tx = await this.proxy.processTransaction(txBytes, txHash);

		expect(await this.tokensale.balanceOf(investor)).to.be.bignumber.equal(expectedBalance);
	});

	it("should fail to process the same transaction twice", async function() {
		await this.proxy.setWalletForInvestor(investor, btcWallet);
		await this.proxy.processTransaction(txBytes, txHash);
		await expectThrow(this.proxy.processTransaction(txBytes, txHash));
	});

	it("should fail to process transaction by hacker", async function() {
		await this.proxy.setWalletForInvestor(investor, btcWallet);
		await expectThrow(this.proxy.processTransaction(txBytes, txHash, {from: hacker}));
	});

	it("should fail to process transaction for foreign wallet", async function() {
		await expectThrow(this.proxy.processTransaction(txBytes, txHash));
	});
});