const Tokensale = artifacts.require('LeapPrivatePreTokensale');
const Token = artifacts.require('Token');

const utils = require('./utils');
const expect = utils.expect;
const expectThrow = utils.expectThrow;

contract("LeapPrivatePreTokensale", function([proxy, wallet, placeholder, investor, hacker]) {
	const investment = utils.ether(1);

	before(async function() {
		await utils.advanceBlock();
	});

	beforeEach(async function() {
		this.token = await Token.new();

		this.tokensale = await Tokensale.new(
			utils.latestTime(),
			this.token.address, proxy, placeholder, wallet
		);
	});

	it("should behave like basic tokensale", async function() {
		expect(await this.tokensale.token()).to.be.equal(this.token.address);
		expect(await this.tokensale.proxy()).to.be.equal(proxy);
		expect(await this.tokensale.wallet()).to.be.equal(wallet);
		expect(await this.tokensale.placeholder()).to.be.equal(placeholder);
	});

	it("owner should add members", async function() {
		await this.tokensale.addMember(investor);
	});
});