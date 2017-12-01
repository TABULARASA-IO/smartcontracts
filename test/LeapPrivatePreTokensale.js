const LeapTokensalePlaceholder = artifacts.require('LeapTokensalePlaceholder');
const Tokensale = artifacts.require('LeapPrivatePreTokensaleFake');
const Token = artifacts.require('LEAP');
const BitcoinProxy = artifacts.require('BitcoinProxy');

const utils = require('./utils');
const expect = utils.expect;
const expectThrow = utils.expectThrow;
const ether = utils.ether;
const getBalance = utils.getBalance;
const inBaseUnits = utils.inBaseUnits;

contract("LeapPrivatePreTokensale", function([deployer, token, placeholder, proxy, investor, hacker, kownWallet, leapWallet]) {
	const hardcap = inBaseUnits(52500000);
	const hardcapEth = ether(10000);

	const ethInvestment = ether(0.001);
	const btcInvestment = new web3.BigNumber(10).pow(5);

	const ethRate = new web3.BigNumber(5250); // LEAP/ETH
	const btcRate = new web3.BigNumber(52500).mul(new web3.BigNumber(10).pow(10)); // ETH/BTC

	const testingDivider = 10000;

	before(async function() {
		await utils.advanceBlock();
	});

	beforeEach(async function() {
		this.token = await Token.new();

		this.tokensale = await Tokensale.new(
			utils.latestTime() + 3600,
			this.token.address, placeholder, kownWallet, leapWallet
		);

		await this.tokensale.setBitcoinProxy(proxy);

		await this.tokensale.updateBitcoinMultiplier(100000);

		await this.token.transferOwnership(this.tokensale.address);
	});

	it("should be initialized correctly", async function() {
		expect(await this.tokensale.token()).to.be.equal(this.token.address);
		expect(await this.tokensale.placeholder()).to.be.equal(placeholder);
		expect(await this.tokensale.proxy()).to.be.equal(proxy);
		expect(await this.tokensale.wallet()).to.be.equal(kownWallet);
	});

	it("should process payments only from ANYONE", async function() {
		await utils.setTime(await this.tokensale.startTime());

		expect(await this.tokensale.validPayment(investor)).to.be.true;
		expect(await this.tokensale.validPayment(hacker)).to.be.true;
	});

	it("should buy coins with correct eth payments", async function() {
		await utils.setTime(await this.tokensale.startTime());

		const expectedCoinsAmount = ethInvestment.mul(ethRate);

		const coinsAmount = (await this.tokensale.rate()).mul(ethInvestment);

		const tx = await this.tokensale.buyCoinsETH({from: investor, value: ethInvestment});
		const account = tx.logs.find(e => e.event === 'TokenPurchaseETH').args.account;

		expect(coinsAmount).to.be.bignumber.equal(expectedCoinsAmount);
		expect(await this.tokensale.leapRaised()).to.be.bignumber.equal(expectedCoinsAmount);
		expect(await this.tokensale.balanceOf(account)).to.be.bignumber.equal(expectedCoinsAmount);

		const accountStruct = await this.tokensale.lockedAccounts(account);

		expect(accountStruct[2]).to.be.bignumber.equal(ethInvestment);
	});

	it("should buy coins with correct btc payments", async function() {
		await utils.setTime(await this.tokensale.startTime());

		const expectedCoinsAmount = btcInvestment.mul(btcRate);

		const coinsAmount = (await this.tokensale.btcRate()).mul(btcInvestment);

		const tx = await this.tokensale.buyCoinsBTC(investor, btcInvestment, { from: proxy });
		const account = tx.logs.find(e => e.event === 'TokenPurchaseBTC').args.account;

		expect(coinsAmount).to.be.bignumber.equal(expectedCoinsAmount);
		expect(await this.tokensale.leapRaised()).to.be.bignumber.equal(expectedCoinsAmount);
		expect(await this.tokensale.balanceOf(account)).to.be.bignumber.equal(expectedCoinsAmount);

		const accountStruct = await this.tokensale.lockedAccounts(investor);

		expect(accountStruct[3]).to.be.bignumber.equal(btcInvestment);
	});

	it("should fail to overlap 52.5M coins cap", async function() {
		await utils.setTime(await this.tokensale.startTime());

		const investment = hardcapEth.div(testingDivider);
		const expectedAmount = investment.mul(ethRate);

		// should send back change not fail
		//await expectThrow(this.tokensale.buyCoinsETH({from: investor, value: hardcapEth.plus(ether(0.001)).div(testingDivider)}));

		await this.tokensale.buyCoinsETH({from: investor, value: investment});

		await expectThrow(this.tokensale.buyCoinsETH({from: investor, value: 1}));
		await expectThrow(this.tokensale.buyCoinsBTC(investor, 1, {from: proxy}));

		expect(await this.tokensale.leapRaised()).to.be.bignumber.equal(expectedAmount);
	});

	it("should distribute funds between two wallets equally", async function() {
		await utils.setTime(await this.tokensale.startTime());

		const halfOfInvestment = ethInvestment.div(2);

		const kownWalletBalanceBefore = new web3.BigNumber(await getBalance(kownWallet));
		const leapWalletBalanceBefore = new web3.BigNumber(await getBalance(leapWallet));

		await this.tokensale.buyCoinsETH({from: investor, value: ethInvestment});

		const kownWalletBalanceAfter = new web3.BigNumber(await getBalance(kownWallet));
		const leapWalletBalanceAfter = new web3.BigNumber(await getBalance(leapWallet));

		const receivedFundsByKown = kownWalletBalanceAfter.minus(kownWalletBalanceBefore);
		const receivedFundsByLeap = leapWalletBalanceAfter.minus(leapWalletBalanceBefore);

		expect(kownWalletBalanceAfter).to.be.bignumber.above(kownWalletBalanceBefore);
		expect(leapWalletBalanceAfter).to.be.bignumber.above(leapWalletBalanceBefore);

		expect(receivedFundsByLeap).to.be.bignumber.equal(receivedFundsByKown);
	});

});