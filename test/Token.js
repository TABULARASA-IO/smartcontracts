const Token = artifacts.require('./LEAP.sol');

const utils = require('./utils.js');
const expect = utils.expect;
const expectThrow = utils.expectThrow;

contract("Token", function([deployer, i1, i2, i3, i4, i5]) {
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

	it("should mint the list", async function() {
		const investors = [i1, i2, i3, i4, i5];
		const amounts = [100, 200, 300, 0, 500];

		token.mintAll(investors, amounts);

		expect(await token.balanceOf(i1)).to.be.bignumber.equal(100);
		expect(await token.balanceOf(i2)).to.be.bignumber.equal(200);
		expect(await token.balanceOf(i3)).to.be.bignumber.equal(300);
		expect(await token.balanceOf(i4)).to.be.bignumber.equal(0);
		expect(await token.balanceOf(i5)).to.be.bignumber.equal(500);
	});

	it("should mint a huge list", async function() {
		let expectedInvestorsCount = 10;
		const amountByEveryInvestor = new web3.BigNumber(10000).mul(new web3.BigNumber(10).pow(18));
		const expectedTotalSupply = amountByEveryInvestor.mul(expectedInvestorsCount);

		let investors = [];
		let amounts = [];

		for(let i = 0; i < expectedInvestorsCount; i++) {
			investors[i] = i;
			amounts[i] = amountByEveryInvestor;
		}

		const tx = await token.mintAll(investors, amounts);

		console.log(tx.receipt.gasUsed);

		expect(await token.totalSupply()).to.be.bignumber.equal(expectedTotalSupply);
	});
});