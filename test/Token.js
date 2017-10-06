const Token = artifacts.require('./LEAP.sol');

const utils = require('./utils.js');
const expect = utils.expect;
const expectThrow = utils.expectThrow;

contract("Token", function([deployer]) {
	let token;

	beforeEach(async function() {
		token = await Token.new();
	});

	it("should have zero total supply", async function() {
		expect(await token.totalSupply()).to.be.bignumber.equal(0);
	});

	it("should be ownable", async function() {
		expect(await token.owner()).to.be.equal(deployer);
	});

	it("should be mintable", async function() {
		expect(await token.mintingFinished()).to.be.false;
	});

	it("should be transferable", async function() {
		expect(await token.paused()).to.be.false;
	});

	it("should not accept payments", async function() {
		await expectThrow(token.send(1));
	})
});