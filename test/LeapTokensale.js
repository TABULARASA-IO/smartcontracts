const Tokensale = artifacts.require('LeapTokensale.sol');
const Token = artifacts.require('LEAP.sol');

const utils = require('./utils');
const expect = utils.expect;

contract("LeapTokensale", function([_, investor, proxy, wallet, placeholder, bounty, team, ecosystem, reserve]) {
	const contributorsPercentage = 40;
	const bountyPercentage = 10;
	const teamPercentage = 15;
	const ecosystemPercentage = 15;
	const reservePercentage = 20;

	const contributorsCoins = percentFromOneBillionCoins(40); // 400m^18
	const bountyCoins = percentFromOneBillionCoins(10); // 100m^18
	const teamCoins = percentFromOneBillionCoins(15); // 150m^18
	const ecosystemCoins = percentFromOneBillionCoins(15); // 150m^18
	const reserveCoins = percentFromOneBillionCoins(20); // 20m^18

	function percentFromOneBillionCoins(n) {
		return new web3.BigNumber(10).pow(7).mul(n) * new web3.BigNumber(10).pow(18);
	}

	before(async function() {
		await utils.advanceBlock();
	});

	beforeEach(async function() {
		this.token = await Token.new();

		this.tokensale = await Tokensale.new(
			utils.latestTime() + 3600,
			this.token.address, proxy, placeholder, wallet,
			bounty, team, ecosystem, reserve
		);

		await this.token.mint(investor, contributorsCoins);

		await this.token.transferOwnership(this.tokensale.address);
	});

	it("should behave like basic tokensale", async function() {
		expect(await this.tokensale.token()).to.be.equal(this.token.address);
		expect(await this.tokensale.proxy()).to.be.equal(proxy);
		expect(await this.tokensale.wallet()).to.be.equal(wallet);
		expect(await this.tokensale.placeholder()).to.be.equal(placeholder);
	});

	it("should be done", async function() {
		expect(await this.token.balanceOf(investor)).to.be.bignumber.equal(contributorsCoins);
	});

	it("should have bonuses", async function() {
		expect(await this.tokensale.bounty()).to.be.equal(bounty);
		expect(await this.tokensale.team()).to.be.equal(team);
		expect(await this.tokensale.ecosystem()).to.be.equal(ecosystem);
		expect(await this.tokensale.reserve()).to.be.equal(reserve);

		expect(await this.tokensale.contributorsPercentage()).to.be.bignumber.equal(contributorsPercentage);
		expect(await this.tokensale.bountyPercentage()).to.be.bignumber.equal(bountyPercentage);
		expect(await this.tokensale.teamPercentage()).to.be.bignumber.equal(teamPercentage);
		expect(await this.tokensale.reservePercentage()).to.be.bignumber.equal(reservePercentage);
	});

	it("should issue bonuses after the end", async function() {
		await utils.setTime(await this.tokensale.endTime());

		await this.tokensale.finalize();

		expect(await this.token.balanceOf(investor)).to.be.bignumber.equal(contributorsCoins);
		expect(await this.token.balanceOf(bounty)).to.be.bignumber.equal(bountyCoins);
		expect(await this.token.balanceOf(team)).to.be.bignumber.equal(teamCoins);
		expect(await this.token.balanceOf(ecosystem)).to.be.bignumber.equal(ecosystemCoins);
		expect(await this.token.balanceOf(reserve)).to.be.bignumber.equal(reserveCoins);
	});
});