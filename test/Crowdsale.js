const CrowdsaleMock = artifacts.require('./CrowdsaleMock.sol');
const Token = artifacts.require('./Token.sol');

const utils = require('./utils.js');
const expect = utils.expect;
const inBaseUnits = utils.inBaseUnits(18);
const ether = utils.ether;
const getBalance = utils.getBalance;
const expectInvalidOpcode = utils.expectInvalidOpcode;

contract('Crowdsale', function([_, investor, anotherInvestor, hacker, wallet]) {
	const investment = ether(1);
	const units = inBaseUnits(1);
	const cap = ether(2);

	let token;
	let crowdsale;

	const oneHour = 3600;
	const oneDay = oneHour * 24;
	let startTime;
	let endTime;
	let afterEndTime;

	before(async function() {
		await utils.advanceBlock();
	});

	beforeEach(async function() {
		startTime = utils.latestTime() + oneDay;
		endTime = startTime + oneDay;
		afterEndTime = endTime + oneHour;

		token = await Token.new();

		crowdsale = await CrowdsaleMock.new(startTime, endTime, cap, wallet);
	});

	it("should be constructed correctly", async function() {
		expect(await crowdsale.startTime()).to.be.bignumber.equal(startTime);
		expect(await crowdsale.endTime()).to.be.bignumber.equal(endTime);
		expect(await crowdsale.wallet()).to.be.equal(wallet);
		expect(await crowdsale.cap()).to.be.bignumber.equal(cap);
	});

	it("should accept payments in etherum", async function() {
		await utils.setTime(startTime);

		expect(crowdsale.buyTokens({value: investment, from: investor})).to.be.eventually.fulfilled;
	});

	it("should fail to accept payments before start", async function() {
		await expectInvalidOpcode(crowdsale.buyTokens({value: investment, from: investor}));
	});

	it("should fail to accept payments after end", async function() {
		await utils.setTime(afterEndTime);

		await expectInvalidOpcode(crowdsale.buyTokens({value: investment, from: investor}));
	});

	it("should fail to accept direct payments", async function() {
		await utils.setTime(startTime);

		await expectInvalidOpcode(crowdsale.sendTransaction({value: investment, from: investor}));
	});

	it("should fail to accept zero payments", async function() {
		await expectInvalidOpcode(crowdsale.buyTokens({value: 0, from: investor}));
	});

	it("should fail to accept over cap payments", async function() {
		await utils.setTime(startTime);

		await expectInvalidOpcode(crowdsale.buyTokens({value: cap.plus(1), from: investor}));

		await expect(crowdsale.buyTokens({value: cap, from: investor})).to.be.eventually.fulfilled;
		await expectInvalidOpcode(crowdsale.buyTokens({value: 1, from: investor}));
	});
});