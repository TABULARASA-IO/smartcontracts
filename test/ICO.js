const Token = artifacts.require('./Token.sol');
const Crowdsale = artifacts.require('./ICO.sol');
const TokenHolderFactory = artifacts.require('./TokenHolderFactory.sol');

const utils = require('./utils.js');
const expect = utils.expect;
const inBaseUnits = utils.inBaseUnits(18);
const ether = utils.ether;
const getBalance = utils.getBalance;
const expectInvalidOpcode = utils.expectInvalidOpcode;

const BigNumber = web3.BigNumber;

contract("ICO", async function([_, kown, wallet, investor]) {
    const investment = ether(1);
    const rate = new BigNumber(10);
    const cap = ether(10);

    const stageBonus = inBaseUnits(2);
    const firstHourBonus = inBaseUnits(1);

    const expectedSupplyForInvestment = investment.times(rate).plus(stageBonus);
    const expectedSupplyForInvestmentInFirstHour = expectedSupplyForInvestment.plus(firstHourBonus);

    const oneHour = 3600;
    const oneDay = oneHour * 24;

    let startTime;
    let endTime;
    let afterEndTime;

    let token;
    let crowdsale;

    before(async function() {
        await utils.advanceBlock();
    })

    beforeEach(async function() {
        startTime = utils.latestTime() + oneDay;
        endTime = startTime + oneDay;
        afterEndTime = endTime + 1;

	    crowdsale = await Crowdsale.new(
		    startTime,
		    endTime,
		    rate,
		    cap,
		    wallet,
		    stageBonus,
		    firstHourBonus
	    );

        token = await Token.new();
        await token.transferOwnership(crowdsale.address);
        await crowdsale.setToken(token.address);

	    const factory = await TokenHolderFactory.new(token.address, kown, endTime, afterEndTime);
	    await factory.transferOwnership(crowdsale.address);
	    await crowdsale.setTokenHolderFactory(factory.address);
    });

    it("should be created with correct params", async function() {
        expect(await crowdsale.startTime()).to.be.bignumber.equal(startTime);
        expect(await crowdsale.endTime()).to.be.bignumber.equal(endTime);
        expect(await crowdsale.rate()).to.be.bignumber.equal(rate);
        expect(await crowdsale.wallet()).to.be.bignumber.equal(wallet);
        expect(await crowdsale.cap()).to.be.bignumber.equal(cap);
        expect(await crowdsale.stageBonus()).to.be.bignumber.equal(stageBonus);
        expect(await crowdsale.firstHourBonus()).to.be.bignumber.equal(firstHourBonus);
    });

    it("should own token", async function() {
        expect(await crowdsale.token()).to.exist;
        expect(await Token.at(await crowdsale.token()).owner()).to.be.equal(crowdsale.address);
    });

    it("should accept payments in etherum", async function() {
        await utils.setTime(startTime);

        const walletBalanceBefore = getBalance(wallet);
        const investorBalanceBefore = getBalance(investor);

	    const tx = await crowdsale.buyTokens({value: investment, from: investor});

	    const lockedAccount = tx.logs[0].args.lockedAccount;

        const walletBalanceAfter = getBalance(wallet);
        const investorBalanceAfter = getBalance(investor);

        expect(walletBalanceAfter).to.be.bignumber.above(walletBalanceBefore);
        expect(investorBalanceAfter).to.be.bignumber.below(investorBalanceBefore);

        expect(await token.balanceOf(lockedAccount)).to.be.bignumber.equal(expectedSupplyForInvestmentInFirstHour);
        expect(await token.totalSupply()).to.be.bignumber.equal(expectedSupplyForInvestmentInFirstHour);
        expect(await token.balanceOf(investor)).to.be.bignumber.equal(0);
    });
    it("should mint less tokens after one hour", async function() {
        await utils.setTime(startTime+oneHour);

        const tx = await crowdsale.buyTokens({value: investment, from: investor});

        const lockedAccount = tx.logs[0].args.lockedAccount;

        expect((await token.balanceOf(lockedAccount))).to.be.bignumber.equal(expectedSupplyForInvestment);
        expect(await token.balanceOf(investor)).to.be.bignumber.equal(0);
        expect(await token.totalSupply()).to.be.bignumber.equal(expectedSupplyForInvestment);
    });
    it("should fail to accept payments before start", async function() {
        await expectInvalidOpcode(crowdsale.buyTokens({value: investment, from: investor}));
        expect(await token.balanceOf(investor)).to.be.bignumber.equal(0);
    });
    it("should fail to accept payments after end", async function() {
        await utils.setTime(afterEndTime);
        await expectInvalidOpcode(crowdsale.buyTokens({value: investment, from: investor}));
        expect(await token.balanceOf(investor)).to.be.bignumber.equal(0);
    });
});