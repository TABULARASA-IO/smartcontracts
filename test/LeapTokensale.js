const Tokensale = artifacts.require('LeapTokensaleFake.sol');
const Token = artifacts.require('LEAP.sol');

const utils = require('./utils');
const expect = utils.expect;
const ether = utils.ether;
const inBaseUnits = utils.inBaseUnits(18);

contract("LeapTokensale", function([_, investor, proxy, wallet, placeholder, bounty, team, ecosystem, reserve]) {
	const contributorsBasePoints = 4000;
	const bountyBasePoints = 1000;
	const teamBasePoints = 1500;
	const ecosystemBasePoints = 1500;
	const reserveBasePoints = 2000;

	const contributorsCoins = new web3.BigNumber(400000000) * new web3.BigNumber(10).pow(18);
	const bountyCoins = new web3.BigNumber(100000000) * new web3.BigNumber(10).pow(18);
	const teamCoins = new web3.BigNumber(150000000) * new web3.BigNumber(10).pow(18);
	const ecosystemCoins = new web3.BigNumber(150000000) * new web3.BigNumber(10).pow(18);
	const reserveCoins = new web3.BigNumber(200000000) * new web3.BigNumber(10).pow(18);

	const firstStageRaised = new web3.BigNumber(inBaseUnits(36000000));
	const secondStageRaised = new web3.BigNumber(inBaseUnits(46002300));
	const thirdStageRaised = new web3.BigNumber(inBaseUnits(55001100));
	const fourthStageRaised = new web3.BigNumber(inBaseUnits(64500000));
	const fifthStageRaised = new web3.BigNumber(inBaseUnits(59996600));

	const priceForFirstStage = 3600;
	const priceForSecondStage = 3450;
	const priceForThirdStage = 3300;
	const priceForFourthStage = 3225;
	const priceForFifthStage = 3000;

	const divider = 10000;

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

		expect(await this.tokensale.contributorsBasePoints()).to.be.bignumber.equal(contributorsBasePoints);
		expect(await this.tokensale.bountyBasePoints()).to.be.bignumber.equal(bountyBasePoints);
		expect(await this.tokensale.teamBasePoints()).to.be.bignumber.equal(teamBasePoints);
		expect(await this.tokensale.reserveBasePoints()).to.be.bignumber.equal(reserveBasePoints);
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

	it("should process ETH payments correctly", async function() {
		await utils.setTime(await this.tokensale.startTime());

		const firstStageInvestmentAmount = ether(10000).div(divider);
		const secondStageInvestmentAmount = ether(13334).div(divider);
		const thirdStageInvestmentAmount = ether(16667).div(divider);
		const fourthStageInvestmentAmount = ether(20000).div(divider);

		// the charge should be transfered back to investor
		const fifthStageInvestmentAmount = ether(19999).div(divider);

		await this.tokensale.buyCoinsETH({from: investor, value: firstStageInvestmentAmount});
		const supplyFirstStage = await this.tokensale.leapRaised();

		await this.tokensale.buyCoinsETH({from: investor, value: secondStageInvestmentAmount});
		const supplySecondStage = await this.tokensale.leapRaised();

		await this.tokensale.buyCoinsETH({from: investor, value: thirdStageInvestmentAmount});
		const supplyThirdStage = await this.tokensale.leapRaised();

		await this.tokensale.buyCoinsETH({from: investor, value: fourthStageInvestmentAmount});
		const supplyFourthStage = await this.tokensale.leapRaised();

		await this.tokensale.buyCoinsETH({from: investor, value: fifthStageInvestmentAmount});
		const supplyFifthStage = await this.tokensale.leapRaised();

		expect(supplyFirstStage).to.be.bignumber.equal(firstStageRaised.div(divider));
		expect(supplySecondStage).to.be.bignumber.equal(firstStageRaised.plus(secondStageRaised).div(divider));
		expect(supplyThirdStage).to.be.bignumber.equal(firstStageRaised.plus(secondStageRaised).plus(thirdStageRaised).div(divider));
		expect(supplyFourthStage).to.be.bignumber.equal(firstStageRaised.plus(secondStageRaised).plus(thirdStageRaised).plus(fourthStageRaised).div(divider));
		expect(supplyFifthStage).to.be.bignumber.equal(firstStageRaised.plus(secondStageRaised).plus(thirdStageRaised).plus(fourthStageRaised).plus(fifthStageRaised).div(divider));
	});
});