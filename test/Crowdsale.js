const CrowdsaleMock = artifacts.require('./CrowdsaleMock.sol');
const Token = artifacts.require('./Token.sol');

const BigNumber = web3.BigNumber;
const chai = require('chai');
chai.use(require('chai-as-promised'));
chai.use(require('chai-bignumber')(BigNumber));
const expect = chai.expect;

const h = require('../scripts/helper_functions.js');
const ether = h.ether;
const getBalance = h.getBalance;
const expectInvalidOpcode = h.expectInvalidOpcode;
const inBaseUnits = h.inBaseUnits(18);



contract('Crowdsale', function([_, investor, anotherInvestor, hacker, wallet]) {
	const investment = ether(1);
	const units = h.inBaseUnits(1);
	const cap = ether(10);

	let token;
	let crowdsale;

	const oneHour = 3600;
	const oneDay = oneHour * 24;
	let startTime;
	let endTime;
	let afterEndTime;

	before(async function() {
		await h.advanceBlock();
	});

	beforeEach(async function() {
		startTime = h.latestTime() + oneDay;
		endTime = startTime + oneDay;
		afterEndTime = endTime + oneHour;

		token = await Token.new();

		crowdsale = await CrowdsaleMock.new(startTime, endTime, cap, wallet);
	});

	describe("Initialization", function() {
		it("should be constructed correctly", async function() {
			expect(await crowdsale.startTime()).to.be.bignumber.equal(startTime);
			expect(await crowdsale.endTime()).to.be.bignumber.equal(endTime);
			expect(await crowdsale.wallet()).to.be.equal(wallet);
			expect(await crowdsale.cap()).to.be.bignumber.equal(cap);
		});
	});

	describe("accept payments", function() {
		it("should accept payments in etherum", async function() {
			await h.setTime(startTime);

			expect(crowdsale.buyTokens({value: investment, from: investor})).to.be.eventually.fulfilled;
		});

		it("should fail to accept payments before start", async function() {
			expectInvalidOpcode(crowdsale.buyTokens({value: investment, from: investor}));
		});

		it("should fail to accept payments after end", async function() {
			await h.setTime(afterEndTime);

			expectInvalidOpcode(crowdsale.buyTokens({value: investment, from: investor}));
		});

		it("should fail to accept direct payments", async function() {
			await h.setTime(startTime);

			expectInvalidOpcode(crowdsale.sendTransaction({value: investment, from: investor}));
		});
	});

	describe("validate payments", function() {
		it("should allow correct payments");
		it("should disallow payments before begin");
		it("should disallow payments after begin");
		it("should disallow zero payments");
		it("should diallow overcap payments");
	});
});