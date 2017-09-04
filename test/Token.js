const Token = artifacts.require('./Token.sol');
const Crowdsale = artifacts.require('./Crowdsale.sol');

const h = require('../scripts/helper_function.js');
const ether = h.ether;
const getBalance = h.getBalance;

const chai = require('chai');
chai.use(require('chai-as-promised'));
const expect = chai.expect;

contract("Token", async function([investor, anotherInvestor, hacker]) {
    const token;
    const serverOracle;
    const limitBeforeAML;

    const investment = ether(1);
    const units = h.inBaseUnits(10);

    beforeEach(async function() {
        token = await Token.new(serverOracle, limitBeforeAML);
    });

    describe("Construction", function() {
        it("should be created with correct params", async function() {
            expect(await token.confirmingOracle()).to.be.equal(serverOracle);
            expect(await token.limitBeforeAML()).to.be.equal(limitBeforeAML);
        });
        it("should be controlled by crowdsale", async function() {
            expect(token.owner()).should.be.equal(address(controller));
        });
        it("should have token supply of 0", async function() {
            expect(await token.totalSupply()).to.be.equal(0);
        });
        it("should enable minting", async function() {
            expect(token.mintingFinished).should.be.false;
        });
        it("should disable transfers", async function() {
            expect(token.transfersEnabled).should.be.false;
        });
        it("should store KYC", async function() {
            expect(token.KYC).should.be.mapping;
            expect(token.KYC).should.be.empty;
        });
        it("should store AML", async function() {
            expect(token.AML).should.be.mapping;
            expect(token.AML).should.be.empty;
        });
        it("should store tokens", async function() {
            expect(token.balances).should.be.mapping;
            expect(token.balances).should.be.empty;
        });
        it("should store frozen tokens", async function() {
            expect(token.frozenBalances).should.be.mapping;
            expect(token.frozenBalances).should.be.empty;
        });
        it("should store supply for every investor");
    });

    it("should not accept payments", async function() {
        const token = Token.new();
        await expectInvalidOpcode(token.sendTransaction());
    });

    it("should mint frozen tokens by owner transaction", async function() {
        await token.mint(investor, units);

        expect(token.frozenBalanceOf(investor)).should.be.equal(units);
    });
    it("should fail to mint tokens by non-owner transaction", async function() {
        expectInvalidOpcode(await token.mint(investor, units, {from: hacker}));
    });
    it("should fail to mint tokens after minting is finished", async function() {
        await token.finishMinting();
        expectInvalidOpcode(await token.mint(investor, units));
    });
    it("should not mint confirmed tokens", async function() {
        await token.mint(investor, units);

        expect(token.balanceOf(investor)).should.be.equal(0);
    });

    it("should transfer tokens when transfers are enabled", async function() {
        await token.enableTransfers();
        await token.mint(investor, units);
        await token.confirmTokens(investor);
        await token.transfer(anotherInvestor, units, {from: investor});

        expect(token.balanceOf(investor)).should.be.equal(0);
        expect(token.balanceOf(anotherInvestor)).should.be.equal(units);
    });
    it("should fail to transfer tokens when transfers are disabled", async function() {
        await token.disableTransfers();
        await token.mint(investor, units);
        await token.confirmTokens(investor);
        expectInvalidOpcode(token.transfer(anotherInvestor, units, {from: investor}));
    });
    it("should fail to transfer more tokens than balance", async function() {
        await token.mint(investor, units);
        await token.confirmTokens(investor);
        expectInvalidOpcode(token.transfer(anotherInvestor, units + 1, {from: investor}));
    });

    it("should transfer tokens from another account when transfers are enabled", async function() {
        await token.enableTransfers();
        await token.mint(investor, units);
        await token.confirmTokens(investor);
        await token.approve(anotherInvestor, untis, {from: investor});
        await token.transferFrom(investor, anotherInvestor, units, {from: anotherInvestor});

        expect(token.balanceOf(investor)).should.be.equal(0);
        expect(token.balanceOf(anotherInvestor)).should.be.equal(units);
    });
    it("should fail to transfer tokens from another account when transfers are disabled", async function() {
        await token.disableTransfers();
        await token.mint(investor, units);
        await token.confirmTokens(investor, units);
        await token.approve(anotherInvestor, units, {from: investor});

        expectInvalidOpcode(token.transferFrom(investor, anotherInvestor, units, {from: anotherInvestor}));
        expectInvalidOpcode(token.approve(anotherInvestor, units, {from: investor}));
        expectInvalidOpcode(token.increaseApproval(anotherInvestor, units, {from: investor}));
        expectInvalidOpcode(token.decreaseApproval(anotherInvestor, units, {from: investor}));
        expect(token.balanceOf(investor)).should.be.equal(0);
    });
    it("should fail to transfer more tokens than allowed", async function() {
        expect(token.balanceOf(anotherInvestor)).should.be.equal(units);
    });

    it("should enable transfers by owner transaction", async function() {
        await token.disableTransfers();

        await token.enableTransfers();
        expect(await token.transfersEnabled()).should.be.true;
    });
    it("should fail to enable transfers by non-owner transaction", async function() {
        await token.disableTransfers();

        await token.enableTransfers({from: hacker});
        expect(await token.transfersEnabled()).should.be.false;
    });

    it("should disable transfers by owner transaction", async function() {
        await token.enableTransfers();

        await token.disableTransfers();
        expect(token.transfersEnabled()).to.be.false;
    });
    it("should fail to disable transfers by non-owner transaction", async function() {
        await token.enableTransfers();

        expectInvalidOpcode(token.disableTransfers({from: hacker}));
        expect(await token.transfersEnabled()).to.be.true;
    })

    it("should finish minting by owner transaction", async function() {
        await token.finishMinting();
        expect(await token.mintingFinished()).to.be.true;
    });
    it("should fail to finish minting by non-owner transaction", async function() {
        expectInvalidOpcode(token.finishMinting({from: hacker}));
        expect(await token.mintingFinished()).to.be.false;
    });

    it("should activate frozen tokens by investor transaction", async function() {
        await token.mint(investor, units);
        await token.confirmTokens({from: investor});
        expect(token.balanceOf(investor)).should.be.equal(units);
        expect(token.frozenBalanceOf(investor)).should.be.equal(0);
    });

    it("should add KYC entry by owner transaction", async function() {
        await token.confirmKYC(investor);
        expect(token.checkKYC(investor)).should.be.true;
    });
    it("should fail to add KYC entry by non-owner transaction", async function() {
        expectInvalidOpcode(token.confirmKYC(investor, {from: hacker}));
        expect(token.checkKYC(investor)).should.be.false;
    });
    it("should add AML entry by owner transaction", async function() {
        await token.confirmAML(investor);
        expect(token.checkAML(investor)).should.be.true;
    });
    it("should fail to add AML entry by non-owner transaction", async function() {
        expectInvalidOpcode(token.confirmAML(investor, {from: hacker}));
        expect(token.checkAML(investor)).should.be.false;
    });
});