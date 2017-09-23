const Token = artifacts.require('./Token.sol');
const TokenHolder = artifacts.require('./TokenHolder.sol');

const BigNumber = web3.BigNumber;
const chai = require('chai');
chai.use(require('chai-as-promised'));
chai.use(require('chai-bignumber')(BigNumber));
const expect = chai.expect;

const h = require('../scripts/helper_functions.js');
const expectInvalidOpcode = h.expectInvalidOpcode;
const inBaseUnits = h.inBaseUnits(18);

const sha3 = require('solidity-sha3').default;

contract("TokenHolder", async function([_, signer, beneficiary]) {
	let token;
	let tokenHolder;
	let tokenAddress;
	let tokenHolderAddress;

	const units = inBaseUnits(1);

	const oneHour = 3600;
	let releaseAfter;

	let signature;
	const wrongSignature = web3.eth.sign(signer, sha3(beneficiary));

	before(async function() {
		await h.advanceBlock();
	});

	beforeEach(async function() {
		releaseAfter = h.latestTime() + oneHour;
		releaseBefore = releaseAfter + oneHour;
		token = await Token.new();
		tokenAddress = token.address;
		tokenHolder = await TokenHolder.new(tokenAddress, signer, beneficiary, releaseAfter, releaseBefore);
		tokenHolderAddress = tokenHolder.address;

		signature = web3.eth.sign(signer, sha3(tokenHolderAddress));
	});

	it("should be initialized correctly", async function() {
		expect(await tokenHolder.token()).to.be.equal(tokenAddress);
		expect(await tokenHolder.beneficiary()).to.be.equal(beneficiary);
		expect(await tokenHolder.signer()).to.be.equal(signer);
		expect(await tokenHolder.releaseAfter()).to.be.bignumber.equal(releaseAfter);
	});

	it("should handle locked tokens for investor", async function() {
		await token.mint(tokenHolderAddress, units);

		expect(await token.balanceOf(tokenHolderAddress)).to.be.bignumber.equal(units);
		expect(await token.balanceOf(beneficiary)).to.be.bignumber.equal(0);
	});

	it("should release tokens to beneficiary", async function() {
		await token.mint(tokenHolderAddress, units);
		await h.setTime(releaseAfter);
		await tokenHolder.release(signature, {from: beneficiary});

		expect(await token.balanceOf(tokenHolderAddress)).to.be.bignumber.equal(0);
		expect(await token.balanceOf(beneficiary)).to.be.bignumber.equal(units);
	});

	it("should fail to release tokens by holder with zero balance", async function() {
		await token.mint(tokenHolderAddress, units);
		await h.setTime(releaseAfter);
		await tokenHolder.release(signature, {from: beneficiary});

		expectInvalidOpcode(tokenHolder.release(signature, {from: beneficiary}));
	});
	it("should fail to release tokens before release time", async function() {
		await token.mint(tokenHolderAddress, units);

		expectInvalidOpcode(tokenHolder.release(signature, {from: beneficiary}));
	});
	it("should fail to release tokens with invalid signature", async function() {
		await token.mint(tokenHolderAddress, units);
		await h.setTime(releaseAfter);

		expectInvalidOpcode(tokenHolder.release(wrongSignature, {from: beneficiary}));
	});
	it("should fail to release tokens with signature from different account", async function() {
		const anotherTokenHolder = await TokenHolder.new(tokenAddress, signer, beneficiary, releaseAfter, releaseBefore);
		await h.setTime(releaseAfter);

		expectInvalidOpcode(anotherTokenHolder.release(signature, {from: beneficiary}));
	});
	it("should fail to release tokens after release time", async function() {
		await token.mint(tokenHolderAddress, units);
		await h.setTime(releaseBefore + 1);

		expectInvalidOpcode(tokenHolder.release(signature, {from: beneficiary}));
	});
});