const Token = artifacts.require('./LEAP.sol');

const utils = require('./utils.js');
const expect = utils.expect;
const expectThrow = utils.expectThrow;

contract("Token", function([deployer, investor, hacker]) {
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
	});

	it("should refund/burn tokens when investor didn't complete KYC", async function() {
		await token.mint(investor, 1000);
		const afterMintingAmount = await token.balanceOf(investor);

		const tx = await token.refund(investor);
		const afterRefundingAmount = await token.balanceOf(investor);
		const loggedEvent = tx.logs.find(e => e.name === 'Refunded');

		expect(loggedEvent.args['investor']).to.be.equal(investor);
		expect(loggedEvent.args['amount']).to.be.bignumber.equal(1000);

		expect(afterMintingAmount).to.be.bignumber.equal(1000);
		expect(afterRefundingAmount).to.be.bignumber.equal(0);

		expect(afterMintingAmount).to.be.bignumber.equal(1000);
		expect(afterRefundingSupply).to.be.bignumber.equal(0);
	});

	it("should fail to refund tokens by hacker", async function() {
		await token.mint(investor, 1000);

		await expectThrow(token.refund(investor));

		expect(await token.balanceOf(investor)).to.be.bignumber.equal(1000);
	});
});