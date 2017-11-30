const Token = artifacts.require('./LEAP.sol');

const utils = require('./utils.js');
const expect = utils.expect;
const expectThrow = utils.expectThrow;

contract("Token", function([deployer, investor, hacker, placeholder]) {
	let token;

	beforeEach(async function() {
		token = await Token.new();
		token.pause();
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

	it("we should not forget to pause token after deploy", async function() {
		expect(await token.paused()).to.be.true;
	});

	it("should not accept payments", async function() {
		await expectThrow(token.send(1));
	});

	it("should remember previous owners when ownership transfered", async function() {
		await token.transferOwnership(placeholder);

		expect(await token.owner()).to.be.equal(placeholder);
		expect(await token.exOwners(placeholder)).to.be.equal(false);
		expect(await token.exOwners(deployer)).to.be.equal(true);

		await token.transferOwnership(deployer, {from: placeholder});

		expect(await token.owner()).to.be.equal(deployer);
		expect(await token.exOwners(placeholder)).to.be.equal(true);
		expect(await token.exOwners(deployer)).to.be.equal(true);
	});

	it("should refund/burn tokens when investor didn't complete KYC", async function() {
		await token.mint(investor, 1000);

		const afterMintingAmount = await token.balanceOf(investor);
		const afterMintingSupply = await token.totalSupply();

		const tx = await token.refund(investor, 1000);

		const afterRefundingAmount = await token.balanceOf(investor);
		const afterRefundingSupply = await token.totalSupply();

		const loggedEvent = tx.logs.find(e => e.event === 'Refunded');

		expect(loggedEvent.args['investor']).to.be.equal(investor);
		expect(loggedEvent.args['amount']).to.be.bignumber.equal(1000);

		expect(afterMintingAmount).to.be.bignumber.equal(1000);
		expect(afterRefundingAmount).to.be.bignumber.equal(0);

		expect(afterMintingSupply).to.be.bignumber.equal(1000);
		expect(afterRefundingSupply).to.be.bignumber.equal(0);
	});

	it("should refund specific amount of tokens by previous owner", async function() {
		await token.mint(investor, 1000);

		await token.transferOwnership(placeholder);
		await token.refund(investor, 600);

		expect(await token.balanceOf(investor)).to.be.bignumber.equal(400);
		expect(await token.totalSupply()).to.be.bignumber.equal(400);
	});

	it("should fail to refund tokens by hacker", async function() {
		await token.mint(investor, 1000);

		await expectThrow(token.refund(investor, 1000, {from: hacker}));

		expect(await token.balanceOf(investor)).to.be.bignumber.equal(1000);
	});
});