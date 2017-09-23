const Token = artifacts.require('./Token.sol');

const utils = require('./utils.js');
const expect = utils.expect;
const inBaseUnits = utils.inBaseUnits(18);
const ether = utils.ether;
const getBalance = utils.getBalance;
const expectInvalidOpcode = utils.expectInvalidOpcode;

const sha3 = require('solidity-sha3').default;

contract("Token", async function([_, kown, investor, anotherInvestor, hacker]) {
    let token;

    const investment = ether(1);
    const units = inBaseUnits(1);

    beforeEach(async function() {
        token = await Token.new();
        await token.pause();
    });

    describe("Construction", function() {
        it("should have total supply of 0", async function() {
            expect(await token.totalSupply()).to.be.bignumber.equal(0);
        });
        it("should have minting enabled", async function() {
            expect(await token.mintingFinished()).to.be.false;
        });
        it("should have transfering disabled", async function() {
            expect(await token.paused()).to.be.true;
        });
    });

    it("should not accept payments", async function() {
        await expectInvalidOpcode(token.send(investment));
    });

    it("should mint tokens by owner transaction", async function() {
        await token.mint(investor, units);

        expect(await token.totalSupply()).to.be.bignumber.equal(units);
        expect(await token.balanceOf(investor)).to.be.bignumber.equal(units);
    });

    it("should fail to mint tokens by non-owner transaction", async function() {
        expectInvalidOpcode(token.mint(investor, units, {from: hacker}));
    });

    it("should fail to mint tokens after minting is finished", async function() {
        await token.finishMinting();

        await expectInvalidOpcode(token.mint(investor, units, {from: investor}));
        expect(await token.balanceOf(investor)).to.be.bignumber.equal(0);
    });

    it("should enable transfers by owner transaction", async function() {
       await token.unpause();

       expect(await token.paused()).to.be.false;
    });
    it("should fail to enable transfers by non-owner transaction", async function() {
        await expectInvalidOpcode(token.unpause({from: hacker}));
        expect(await token.paused()).to.be.true;
    });

    it("should transfer tokens", async function() {
        await token.unpause();
        await token.mint(investor, units);
        await token.transfer(anotherInvestor, units, {from: investor});

        expect(await token.balanceOf(anotherInvestor)).to.be.bignumber.equal(units);
        expect(await token.balanceOf(investor)).to.be.bignumber.equal(0);
    });
    it("should fail to transfer tokens when transfers are disabled", async function() {
        await token.mint(investor, units);

        await expectInvalidOpcode(token.transfer(anotherInvestor, units, {from: investor}));
        expect(await token.balanceOf(investor)).to.be.bignumber.equal(units);
        expect(await token.balanceOf(anotherInvestor)).to.be.bignumber.equal(0);
    });

    it("should transfer tokens from another account", async function() {
        await token.unpause();
        await token.mint(investor, units);
        await token.approve(anotherInvestor, units, {from: investor});
        await token.transferFrom(investor, anotherInvestor, units, {from: anotherInvestor});

        expect(await token.balanceOf(investor)).to.be.bignumber.equal(0);
        expect(await token.balanceOf(anotherInvestor)).to.be.bignumber.equal(units);
    });
    it("should fail to transfer tokens from another account when transfers are disabled", async function() {
        await token.mint(investor, units);
        await token.approve(anotherInvestor, units, {from: anotherInvestor});

        await expectInvalidOpcode(token.transferFrom(investor, anotherInvestor, units, {from: investor}));
        expect(await token.balanceOf(investor)).to.be.bignumber.equal(units);
        expect(await token.balanceOf(anotherInvestor)).to.be.bignumber.equal(0);
    });
});