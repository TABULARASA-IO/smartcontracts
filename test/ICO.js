const Token = artifacts.require('./Token.sol');
const Crowdsale = artifacts.require('./Crowdsale.sol');

const h = require('../scripts/helper_function.js');
const ether = h.ether;
const getBalance = h.getBalance;

const chai = require('chai');
chai.use(require('chai-as-promised'));
const expect = chai.expect;

contract("ICO", async function([wallet, investor]) {
    it("should implement capped crowdsale functionality");
    it("should be zeppelin audited");
    it("should be controlled by KOWN");

    const startTime;
    const endTime;
    const rate;
    const hardCap;

    const crowdsale;
    const token;

    const investment = ether(1);

    beforeEach(async function() {
        // CappedCrowdsale(hardCap) Crowdsale(...)
        crowdsale = await Crowdsale.new(wallet, startTime, endTime, rate, hardCap, limitBeforeAML);
    });

    it("should start with correct params", async function() {
        expect(await crowdsale.startTime().to.be.equal(startTime));
        expect(await crowdsale.endTime().to.be.equal(endTime));
        expect(await crowdsale.rate().to.be.equal(rate));
        expect(await crowdsale.hardCap().to.be.equal(hardCap));
        expect(await crowdsale.wallet().to.be.equal(wallet));
        expect(await crowdsale.limitBeforeAML().to.be.equal(limitBeforeAML));
    });
    // implement contactable
    it("should have link to official document");


    it("should own token", async function() {
        await crowdsale.token().owner().should.be.equal(address(crowdsale));
    });

    it("should accept eth payments", async function() {
        await crowdsale.sendTransaction(hardCap.minus(lessThanCap)).to.be.fulfilled;
        await crowdsale.sendTransaction(lessThanCap).to.be.fulfilled;
    });
    // later...
    it("should accept btc payments");

    describe("accept payment", function() {
        const walletBalanceBefore;
        const investorBalanceBefore;
        const frozenTokensBefore;
        const tokensBefore;
        const totalSupplyBefore;
        const paidAmountBefore;

        before(async function() {
            walletBalanceBefore = await h.getBalance(walelt);
            investorBalanceBefore = await h.getBalance(investor);
            frozenTokensBefore = await token.frozenBalanceOf(investor);
            tokensBefore = await token.balanceOf(investor);
            totalSupplyBefore = await token.totalSupply();
            paidAmountBefore = await token.paidAmountBefore();
            await crowdsale.sendTransaction(investment, {from: investor});
        });

        it("should transfer money to the wallet", async function() {
            const walletBalanceAfter = h.getBalance(wallet);
            const investorBalanceAfter = h.getBalance(investor);
            expect(walletBalanceAfter).to.be.above(walletBalanceBefore);
            expect(investorBalanceAfter).to.be.above(investorBalanceBefore);
        });
        it("should mint frozen tokens for the sender", async function() {
            expect(await token.frozenBalanceOf(investor)).to.be.above(frozenTokensBefore);
            expect(await token.balanceOf(investor)).to.be.above(tokensBefore);
        });
        it("should increase total token supply", async function() {
            expect(await token.totalSupply()).to.be.above(totalSupplyBefore);
        });
        it("should increase paid amount for the sender", async function() {
            expect(await token.paidAmountOf(investor)).to.be.above(paidAmountBefore);
        });
    });

    it("should reject payments before start", async function() {
        setTime(beforeStart);
        expectInvalidOpcode(crowdsale.sendTransaction(investment, {from: investor}));
    });
    it("should reject payments after end", async function() {
        setTime(afterEnd);
        expectInvalidOpcode(crowdsale.sendTransaction(investment, {from: investor}));
    });
    it("should reject payments outside cap", async function() {
        await crowdsale.sendTransaction(hardCap);
        expectInvalidOpcode(crowdsale.send(1));
    });
    it("should reject payments that exceed cap", async function() {
        expectInvalidOpcode(crowdsale.sendTransaction(hardCap.plus(1)));
    });

    it("should be started after begin time", async function() {
        await increaseTimeTo(this.startTime);

        const mintingEnabled = await token.mintingEnabled();
        expect(mintingEnabled).should.be.true;
    });
    it("should be ended after end time", async function() {
        await increaseTimeTo(endTime+1);

        expect(await crowdsale.hasEnded()).to.be.true;
        expect(await token.mintingEnabled()).to.be.false;
    });
    it("should be ended after hard cap reached", async function() {
        await crowdsale.sendTransaction(hardCap);

        expect(await crowdsale.hasEnded()).to.be.true;
        expect(await token.mintingEnabled()).to.be.false;
    });

    describe("calculate token amount", function() {
        it("should have constant rate", async function() {
            const rate1 = await crowdsale.rate();
            increaseTime();
            const rate2 = await crowdsale.rate();
            expect(rate1).should.be.equal(rate2);
        });
        it("should be in proportion to price", async function() {
            const crowdsale1 = await Crowdsale.new(wallet, startTime, endTime, rate, hardCap, limitBeforeAML);
            const crowdsale2 = await Crowdsale.new(wallet, startTime, endTime, rate * 3, hardCap, limitBeforeAML);

            const rate1 = await crowdsale1.rate();
            const rate2 = await crowdsale2.rate();

            await crowdsale1.sendTransaction(investment, {from: investor});
            await crowdsale2.sendTransaction(investment, {from: investor});

            const amount1 = await crowdsale1.token().balanceOf(investor);
            const amount2 = await crowdsale2.token().balanceOf(investor);

            expect(amount1/amount2).to.be.equal(3);
        });
        it("should be in proportion to payment amount");
        it("should be in proportion to stage bonus");
        it("should be incremented with bonus in first hour");
    });
});