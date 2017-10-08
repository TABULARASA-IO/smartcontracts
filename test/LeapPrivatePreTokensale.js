const LeapTokensalePlaceholder = artifacts.require('LeapTokensalePlaceholder');
const Tokensale = artifacts.require('LeapPrivatePreTokensale');
const Token = artifacts.require('Token');
const BitcoinProxy = artifacts.require('BitcoinProxy');

const utils = require('./utils');
const expect = utils.expect;
const expectThrow = utils.expectThrow;

contract("LeapPrivatePreTokensale", function([deployer, token, placeholder, proxy, wallet, investor, hacker]) {
	before(async function() {
		await utils.advanceBlock();
	});

	beforeEach(async function() {
		this.tokensale = await Tokensale.new(
			utils.latestTime() + 3600,
			token, proxy, placeholder, wallet
		);
	});

	it("should be initialized correctly", async function() {
		expect(await this.tokensale.token()).to.be.equal(token);
		expect(await this.tokensale.placeholder()).to.be.equal(placeholder);
		expect(await this.tokensale.proxy()).to.be.equal(proxy);
		expect(await this.tokensale.wallet()).to.be.equal(wallet);
	});

	it("should allow owner to add members", async function() {
		await this.tokensale.addMember(investor);

		expect(await this.tokensale.isMember(investor)).to.be.true;

		await expectThrow(this.tokensale.addMember(investor));
	});

	it("should disallow non-owner to add members", async function() {
		await expectThrow(this.tokensale.addMember(investor, {from: hacker}));
	});

	it("should process payments only from members", async function() {
		await this.tokensale.addMember(investor);

		await utils.setTime(await this.tokensale.startTime());

		expect(await this.tokensale.validPayment(investor, 1)).to.be.true;
		expect(await this.tokensale.validPayment(hacker, 1)).to.be.false;
	});
});