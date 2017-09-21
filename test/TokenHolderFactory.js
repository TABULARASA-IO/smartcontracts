const Token = artifacts.require('./Token.sol');
const TokenHolderFactory = artifacts.require('./TokenHolderFactory.sol');

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

const sha3 = require('solidity-sha3').default;

contract("TokenHolderFactory", async function([_, signer, investor, anotherInvestor]) {
	let token;
	let factory;

	const oneHour = 3600;
	let releaseAfter;

	beforeEach(async function() {
		releaseAfter = h.latestTime() + oneHour;
		releaseBefore = releaseAfter + oneHour;
		token = await Token.new(signer);
		factory = await TokenHolderFactory.new(token.address, signer, releaseAfter, releaseBefore);
	});

	it("should be initialized correctly", async function() {
		expect(await factory.token()).to.be.equal(token.address);
		expect(await factory.signer()).to.be.equal(signer);
	});

	it("should create token holder", async function() {
		const account = await factory.createTokenHolder(investor);
		expect(account).to.exist;
	});

	it("should fail to create token holder by non-owner transaction", async function() {
		expectInvalidOpcode(factory.createTokenHolder(investor, {from: investor}));
	});

	it("should create token holder only once per one beneficiary", async function() {
		const accountForInvestorTx = await factory.createTokenHolder(investor);
		const theSameAccountTx = await factory.createTokenHolder(investor);
		const accountForAnotherInvestorTx = await factory.createTokenHolder(anotherInvestor);

		const accountForInvestor = accountForInvestorTx.logs[0].args.account;
		const accountForAnotherInvestor = accountForAnotherInvestorTx.logs[0].args.account;

		expect(theSameAccountTx.logs).to.be.empty;
		expect(accountForInvestor).to.be.not.equal(accountForAnotherInvestor);
	});
});