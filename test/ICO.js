const ICO = artifacts.require('./ICO.sol');
const TokenHolderFactory = artifacts.require('./TokenHolderFactory.sol');
const Token = artifacts.require('./Token.sol');

const utils = require('./utils.js');
const expect = utils.expect;
const inBaseUnits = utils.inBaseUnits(18);
const ether = utils.ether;
const getBalance = utils.getBalance;
const expectInvalidOpcode = utils.expectInvalidOpcode;

contract("PreICO", async function([_, wallet, investor, signer]) {
	const investment = ether(1);
	const cap = ether(10);
	const oneDay = 3600;

	let coinsPerEth = 10;

	let startTime;
	let endTime;
	let token;
	let crowdsale;
	let factory;
	let unitsPerInvestment;
	let rate;

	beforeEach(async function() {
		startTime = utils.latestTime() + oneDay;
		endTime = startTime + oneDay;

		token = await Token.new();
		factory = await TokenHolderFactory.new(token.address, signer, endTime, endTime + oneDay);
		crowdsale = await ICO.new(startTime, endTime, cap, wallet, token.address, factory.address);

		await token.transferOwnership(crowdsale.address);
		await factory.transferOwnership(crowdsale.address);
		await crowdsale.updateCoinsPerEth(coinsPerEth);

		rate = await crowdsale.getEthRate();
		unitsPerInvestment = investment.times(rate);
	});

	it("should have token", async function() {
		expect(await crowdsale.token()).to.be.equal(token.address);
	});

	it("should instantiate token holder factory", async function() {
		expect(await crowdsale.factory()).to.exist;
	});

	it("should have constant price", async function() {
		expect(await crowdsale.getEthRate()).to.be.bignumber.equal(rate);
	});

	it("should increase balance of locked account", async function() {
		await utils.setTime(startTime);

		const tx = await crowdsale.buyTokens({value: investment, from: investor});
		const account = tx.logs[0].args.account;

		expect(await token.balanceOf(account)).to.be.bignumber.equal(unitsPerInvestment);
		expect(await token.balanceOf(investor)).to.be.bignumber.equal(0);
	});

	it("should forward funds to owner", async function() {
		await utils.setTime(startTime);

		const walletBalanceBefore = await getBalance(wallet);
		const investorBalanceBefore = await getBalance(investor);

		await crowdsale.buyTokens({value: investment, from: investor});

		const walletBalanceAfter = await getBalance(wallet);
		const investorBalanceAfter = await getBalance(investor);

		expect(walletBalanceAfter).to.be.bignumber.above(walletBalanceBefore);
		expect(investorBalanceAfter).to.be.bignumber.below(investorBalanceBefore);
	});
});