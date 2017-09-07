const Token = artifacts.require('./Token.sol');
const Crowdsale = artifacts.require('./ICO.sol');

const BigNumber = web3.BigNumber;
const chai = require('chai');
chai.use(require('chai-as-promised'));
chai.use(require('chai-bignumber')(BigNumber));
const expect = chai.expect;

const h = require('../scripts/helper_functions.js');
const ether = h.ether;
const getBalance = h.getBalance;
const expectInvalidOpcode = h.expectInvalidOpcode;
const inBaseUnits = h.inBaseUnits(18);

contract("ICO", async function([_, kown, wallet, investor]) {
    const limitBeforeAML = inBaseUnits(100);
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
        await h.advanceBlock();
    })

    beforeEach(async function() {
        startTime = h.latestTime() + oneDay;
        endTime = startTime + oneDay;
        afterEndTime = endTime + 1;

        token = await Token.new(kown, limitBeforeAML);
        crowdsale = await Crowdsale.new(
            startTime,
            endTime,
            rate,
            cap,
            wallet,
            stageBonus,
            firstHourBonus
        );
        await token.transferOwnership(crowdsale.address);
        await crowdsale.setToken(token.address);
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
        await h.setTime(startTime);

        const walletBalanceBefore = getBalance(wallet);
        const investorBalanceBefore = getBalance(investor);

        await crowdsale.sendTransaction({value: investment, from: investor});

        const walletBalanceAfter = getBalance(wallet);
        const investorBalanceAfter = getBalance(investor);

        expect(walletBalanceAfter).to.be.bignumber.above(walletBalanceBefore);
        expect(investorBalanceAfter).to.be.bignumber.below(investorBalanceBefore);

        expect(await token.frozenBalanceOf(investor)).to.be.bignumber.equal(expectedSupplyForInvestmentInFirstHour);
        expect(await token.totalSupply()).to.be.bignumber.equal(expectedSupplyForInvestmentInFirstHour);
        expect(await token.balanceOf(investor)).to.be.bignumber.equal(0);
    });
    it("should mint less tokens after one hour", async function() {
        await h.setTime(startTime+oneHour);

        await crowdsale.sendTransaction({value: investment, from: investor});

        expect((await token.frozenBalanceOf(investor))).to.be.bignumber.equal(expectedSupplyForInvestment);
        expect(await token.balanceOf(investor)).to.be.bignumber.equal(0);
        expect(await token.totalSupply()).to.be.bignumber.equal(expectedSupplyForInvestment);
    });
    it("should fail to accept payments before start", async function() {
        expectInvalidOpcode(crowdsale.send(investment));
        expectInvalidOpcode(crowdsale.buyTokens(investor, {value: investment, from: investor}));
        expect(await token.frozenBalanceOf(investor)).to.be.bignumber.equal(0);
    });
    it("should fail to accept payments after end", async function() {
        await h.setTime(afterEndTime);
        expectInvalidOpcode(crowdsale.send(investment));
        expectInvalidOpcode(crowdsale.buyTokens(investor, {value: investment, from: investor}));
        expect(await token.frozenBalanceOf(investor)).to.be.bignumber.equal(0);
    });

    it("should fail to exceed cap", async function() {
        await h.setTime(startTime);
        expectInvalidOpcode(crowdsale.sendTransaction({value: cap.plus(1), from: investor}));
        expect(crowdsale.sendTransaction({value: cap.minus(1), from: investor})).to.be.eventually.fulfilled;
        expectInvalidOpcode(crowdsale.sendTransaction({value: 2, from: investor}));
    });
});