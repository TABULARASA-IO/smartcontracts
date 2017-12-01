const Token = artifacts.require('LEAP');
const Placeholder = artifacts.require('LeapTokensalePlaceholder');

const utils = require('./utils.js');
const expect = utils.expect;
const expectThrow = utils.expectThrow;

contract("LeapTokensalePlaceholder", function([_, nextTokensale, hacker]) {
	beforeEach(async function() {
		this.token = await Token.new();
		this.placeholder = await Placeholder.new(this.token.address);
	});

	it("should hold link to the token", async function() {
		expect(await this.placeholder.token()).to.be.equal(this.token.address);
	});

	it("should transfer token ownership", async function() {
		await this.token.transferOwnership(this.placeholder.address);

		await this.placeholder.changeTokenController(nextTokensale);

		expect(await this.token.owner()).to.be.equal(nextTokensale);
	});

	it("should fail to transfer token ownership before delegation", async function() {
		await expectThrow(this.placeholder.changeTokenController(nextTokensale));
	});

	it("should fail to transfer token ownership by hacker", async function() {
		await this.token.transferOwnership(this.placeholder.address);

		await expectThrow(this.placeholder.changeTokenController(nextTokensale, { from: hacker }));
	});
});