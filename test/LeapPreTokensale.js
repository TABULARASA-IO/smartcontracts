const Tokensale = artifacts.require('LeapPreTokensaleFake');
const Token = artifacts.require('LEAP');

const utils = require('./utils');
const expect = utils.expect;
const expectThrow = utils.expectThrow;
const inBaseUnits = utils.inBaseUnits(18);
const ether = utils.ether;
const getBalance = utils.getBalance;

contract("LeapPreTokensale", function([_, investor, proxy, placeholder, kownWallet, leapWallet]) {
	const firstStageRaised = new web3.BigNumber(inBaseUnits(15003000));
	const secondStageRaised = new web3.BigNumber(inBaseUnits(29001450));
	const thirdStageRaised = new web3.BigNumber(inBaseUnits(41995550));

	const priceFirstStage = 4500;
	const priceSecondStage = 4350;
	const priceThirdStage = 4200;

	const divider = 10000;

	before(async function() {
		await utils.advanceBlock();
	});

	beforeEach(async function() {
		this.token = await Token.new();

		this.tokensale = await Tokensale.new(
			utils.latestTime() + 3600,
			this.token.address, placeholder, kownWallet, leapWallet
		);

		await this.tokensale.setBitcoinProxy(proxy);

		await this.token.transferOwnership(this.tokensale.address);
	});

	it("should behave like basic tokensale", async function() {
		expect(await this.tokensale.token()).to.be.equal(this.token.address);
		expect(await this.tokensale.proxy()).to.be.equal(proxy);
		expect(await this.tokensale.wallet()).to.be.equal(kownWallet);
		expect(await this.tokensale.placeholder()).to.be.equal(placeholder);
	});

	it("should process ETH payments correctly", async function() {
		await utils.setTime(await this.tokensale.startTime());

		const firstStageInvestmentAmount = ether(3334).div(divider);
		const secondStageInvestmentAmount = ether(6667).div(divider);

		// NOTICE: Here we exceed hardcap over 1 ether but is appropriate solution
		const thirdStageInvestmentAmount = ether(9999).div(divider);

		await this.tokensale.buyCoinsETH({from: investor, value: firstStageInvestmentAmount});

		const supplyFirstStage = await this.tokensale.leapRaised();

		await this.tokensale.buyCoinsETH({from: investor, value: secondStageInvestmentAmount});

		const supplySecondStage = await this.tokensale.leapRaised();

		await this.tokensale.buyCoinsETH({from: investor, value: thirdStageInvestmentAmount});

		const supplyThirdStage = await this.tokensale.leapRaised();

		await expectThrow(this.tokensale.buyCoinsETH({from: investor, value: ether(1).div(divider)}));

		expect(supplyFirstStage).to.be.bignumber.equal(firstStageRaised.div(divider));
		expect(supplySecondStage).to.be.bignumber.equal(firstStageRaised.plus(secondStageRaised).div(divider));
		expect(supplyThirdStage).to.be.bignumber.equal(firstStageRaised.plus(secondStageRaised).plus(thirdStageRaised).div(divider));
	});


	it("should distribute funds between two wallets equally", async function() {
		await utils.setTime(await this.tokensale.startTime());

		const halfOfInvestment = ether(1).div(2);

		const kownWalletBalanceBefore = new web3.BigNumber(await getBalance(kownWallet));
		const leapWalletBalanceBefore = new web3.BigNumber(await getBalance(leapWallet));

		await this.tokensale.buyCoinsETH({from: investor, value: ether(1)});

		const kownWalletBalanceAfter = new web3.BigNumber(await getBalance(kownWallet));
		const leapWalletBalanceAfter = new web3.BigNumber(await getBalance(leapWallet));

		const receivedFundsByKown = kownWalletBalanceAfter.minus(kownWalletBalanceBefore);
		const receivedFundsByLeap = leapWalletBalanceAfter.minus(leapWalletBalanceBefore);

		expect(kownWalletBalanceAfter).to.be.bignumber.above(kownWalletBalanceBefore);
		expect(leapWalletBalanceAfter).to.be.bignumber.above(leapWalletBalanceBefore);

		expect(receivedFundsByLeap).to.be.bignumber.equal(receivedFundsByKown);
	});

});