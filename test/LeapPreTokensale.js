const Tokensale = artifacts.require('LeapPreTokensale');
const Token = artifacts.require('Token');

const utils = require('./utils');
const expect = utils.expect;
const expectThrow = utils.expectThrow;

contract("LeapPreTokensale", function([_, investor, proxy, wallet, placeholder]) {
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
});