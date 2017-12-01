const TokenHolder = artifacts.require('./TokenHolder.sol');
const Token = artifacts.require('./Token.sol');

const utils = require('./utils.js');
const baseUnits = utils.inBaseUnits(18);
const expect = utils.expect;
const expectThrow = utils.expectThrow;

const sha3 = require('solidity-sha3').default;

contract("TokenHolder", function([_, investor, signer, hacker]) {
	const units = baseUnits(10);

	beforeEach(async function() {
		this.releaseStart = utils.latestTime() + 3600;
		this.releaseEnd = this.releaseStart + 3600;

		this.token = await Token.new();
		this.lockedAccount = await TokenHolder.new(this.token.address, signer, investor, this.releaseStart, this.releaseEnd);

		await this.token.mint(this.lockedAccount.address, units);

		this.signature = web3.eth.sign(signer, sha3(this.lockedAccount.address));
	});

	it("should be initialized correctly", async function() {
		expect(await this.lockedAccount.token()).to.be.equal(this.token.address);
		expect(await this.lockedAccount.beneficiary()).to.be.equal(investor);
		expect(await this.lockedAccount.signer()).to.be.equal(signer);
		expect(await this.lockedAccount.releaseStart()).to.be.bignumber.equal(this.releaseStart);
		expect(await this.lockedAccount.releaseEnd()).to.be.bignumber.equal(this.releaseEnd);
	});

	it("should release frozen tokens to beneficiary", async function() {
		await utils.setTime(this.releaseStart);

		expect(await this.token.balanceOf(this.lockedAccount.address)).to.be.bignumber.equal(units);
		expect(await this.token.balanceOf(investor)).to.be.bignumber.equal(0);

		await this.lockedAccount.release(this.signature, {from: investor});

		expect(await this.token.balanceOf(this.lockedAccount.address)).to.be.bignumber.equal(0);
		expect(await this.token.balanceOf(investor)).to.be.bignumber.equal(units);
	});

	it("should fail to release tokens before release time", async function() {
		await expectThrow(this.lockedAccount.release(this.signature, {from: investor}));
	});

	it("should fail to release tokens after release time", async function() {
		await utils.setTime(this.releaseEnd + 1);

		await expectThrow(this.lockedAccount.release(this.signature, {from: investor}));
	});

	it("should fail to release tokens with signature from different account", async function() {
		await utils.setTime(this.releaseStart);

		const anotherLockedAccount = await TokenHolder.new(this.token.address, signer, investor, this.releaseStart, this.releaseEnd);

		await this.token.mint(anotherLockedAccount.address, units);

		await expectThrow(anotherLockedAccount.release(this.signature, {from: investor}));
	});

	it("should fail to release tokens twice", async function() {
		await utils.setTime(this.releaseStart);

		await this.lockedAccount.release(this.signature, {from: investor});
		await expectThrow(this.lockedAccount.release(this.signature, {from: investor}));
	});
});