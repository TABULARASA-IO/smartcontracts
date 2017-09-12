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

contract("TokenHolderFactory", async function([_, signer, investor]) {
	let token;
	let factory;

	const oneHour = 3600;
	let releaseAfter;

	beforeEach(async function() {
		releaseAfter = h.latestTime() + oneHour;
		token = await Token.new(signer);
		factory = await TokenHolderFactory.new(token.address, signer);
	});

	it("should be initialized correctly", async function() {
		expect(await factory.token()).to.be.equal(token.address);
		expect(await factory.signer()).to.be.equal(signer);
	});

	it("should create token holder", async function() {
		const account = await factory.createTokenHolder(investor, releaseAfter);
		expect(account).to.exist;
	});
});