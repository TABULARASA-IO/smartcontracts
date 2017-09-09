const Token = artifacts.require('./Token.sol');

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

const util = require('ethereumjs-util');
const sha3 = require('solidity-sha3').default;

contract("Token", async function([_, kown, investor, anotherInvestor, hacker]) {
    let token;

    const investment = ether(1);
    const limitBeforeAML = inBaseUnits(3);
    const units = inBaseUnits(1);
    const unitsOverAML = limitBeforeAML + 1;

    // We should correspond signature to investor when he is ready to activate tokens
    const signature = web3.eth.sign(kown, sha3(investor));
    const invalidSignature = web3.eth.sign(investor, sha3(investor));

    console.log(sha3(investor));

    beforeEach(async function() {
        token = await Token.new(kown, limitBeforeAML);
    });

    describe("Construction", function() {
        it("should be created with correct params", async function() {
            expect(await token.confirmingOracle()).to.be.equal(kown);
            expect(await token.limitBeforeAML()).to.be.bignumber.equal(limitBeforeAML);
        });
        it("should have total supply of 0", async function() {
            expect(await token.totalSupply()).to.be.bignumber.equal(0);
        });
        it("should have minting enabled", async function() {
            expect(await token.mintingFinished()).to.be.false;
        });
        it("should have transfering disabled", async function() {
            expect(await token.transfersEnabled()).to.be.false;
        });
        it("should store KYC", async function() {
            expect(token.KYC).to.exist;
        });
        it("should store AML", async function() {
            expect(token.AML).to.exist;
        });
        it("should store frozen tokens", async function() {
            expect(token.frozenBalances).to.exist;
        });
        it("should store supply for every investor", async function() {
            expect(token.supply).to.exist;
        });
    });

    it("should not accept payments", async function() {
        expectInvalidOpcode(token.send(investment));
    });

    it("should mint only frozen tokens by owner transaction", async function() {
        await token.mint(investor, units);

        expect(await token.totalSupply()).to.be.bignumber.equal(units);
        expect(await token.supplyBy(investor)).to.be.bignumber.equal(units);
    });

    it("should fail to mint tokens by non-owner transaction", async function() {
        expectInvalidOpcode(token.mint(investor, units, {from: hacker}));
    });

    it("should fail to mint tokens after minting is finished", async function() {
        await token.finishMinting();

        expectInvalidOpcode(token.mint(investor, units, {from: investor}));
        expect(await token.frozenBalanceOf(investor)).to.be.bignumber.equal(0);
    });

    it("should enable transfers by owner transaction", async function() {
       await token.enableTransfers();

       expect(await token.transfersEnabled()).to.be.true;
    });
    it("should fail to enable transfers by non-owner transaction", async function() {
        await token.disableTransfers();

        expectInvalidOpcode(token.enableTransfers({from: hacker}));
        expect(await token.transfersEnabled()).to.be.false;
    });

    it("should disable transfers by owner transaction", async function() {
        await token.disableTransfers();

        expect(await token.transfersEnabled()).to.be.false;
    });
    it("should fail to disable transfers by non-owner transaction", async function() {
        await token.enableTransfers();

        expectInvalidOpcode(token.disableTransfers({from: hacker}));
        expect(await token.transfersEnabled()).to.be.true;
    });

    it("should confirm KYC for address by kown transaction", async function() {
        const statusBeforeConfirmation = await token.checkKYC(investor);
        await token.addKYC(investor, {from: kown});

        const statusAfterConfirmation = await token.checkKYC(investor);
        expect(statusBeforeConfirmation).to.be.false;
        expect(statusAfterConfirmation).to.be.true;
    });
    it("should fail to confirm KYC by non-kown transaction", async function() {
       expectInvalidOpcode(token.addKYC(investor));
       expect(await token.checkKYC(investor)).to.be.false;
    });

    it("should confirm AML for address by kow[n transaction", async function() {
        const statusBeforeConfirmation = await token.checkAML(investor);
        await token.addAML(investor, {from: kown});

        const statusAfterConfirmation = await token.checkAML(investor);
        expect(statusBeforeConfirmation).to.be.false;
        expect(statusAfterConfirmation).to.be.true;
    });
    it("should fail to confirm AML by non-kown transaction", async function() {
        expectInvalidOpcode(token.addAML(investor));
        expect(await token.checkAML(investor)).to.be.false;
    });

	it("should activate tokens by investor transaction", async function() {
		token.mint(investor, units);

		await token.activateTokens(signature, {from: investor});

		expect(await token.balanceOf(investor)).to.be.bignumber.equal(units);
		expect(await token.frozenBalanceOf(investor)).to.be.bignumber.equal(0);
	});

    it("should transfer tokens", async function() {
        await token.enableTransfers();
        await token.mint(investor, units);
        await token.addKYC(investor, {from: kown});
        await token.activateTokens(signature, {from: investor});
        await token.transfer(anotherInvestor, units, {from: investor});

        expect(await token.frozenBalanceOf(investor)).to.be.bignumber.equal(0);
        expect(await token.balanceOf(anotherInvestor)).to.be.bignumber.equal(units);
    });
    it("should fail to transfer frozenTokens", async function() {
        await token.mint(investor, units);

        expectInvalidOpcode(token.transfer(anotherInvestor, units, {from: investor}));
        expect(await token.frozenBalanceOf(investor)).to.be.bignumber.equal(units);
        expect(await token.frozenBalanceOf(anotherInvestor)).to.be.bignumber.equal(0);
    });
    it("should fail to transfer tokens when transfers are disabled", async function() {
        await token.disableTransfers();
        await token.mint(investor, units);
        await token.addKYC(investor, {from: kown});
        await token.activateTokens(signature, {from: investor});

        expectInvalidOpcode(token.transfer(anotherInvestor, units, {from: investor}));
        expect(await token.balanceOf(investor)).to.be.bignumber.equal(units);
        expect(await token.balanceOf(anotherInvestor)).to.be.bignumber.equal(0);
    });

    it("should transfer tokens from another account", async function() {
        await token.enableTransfers();
        await token.mint(investor, units);
        await token.approve(anotherInvestor, units, {from: investor});
        await token.addKYC(investor, {from: kown});
        await token.activateTokens(signature, {from: investor});
        await token.transferFrom(investor, anotherInvestor, units, {from: anotherInvestor});

        expect(await token.balanceOf(investor)).to.be.bignumber.equal(0);
        expect(await token.balanceOf(anotherInvestor)).to.be.bignumber.equal(units);
    });
    it("should fail to transfer tokens from another accounts when transfers are disabled", async function() {
        await token.disableTransfers();
        await token.mint(investor, units);
        await token.approve(anotherInvestor, units, {from: anotherInvestor});
        await token.addKYC(investor, {from: kown});
        await token.activateTokens(signature, {from: investor});

        expectInvalidOpcode(token.transferFrom(investor, anotherInvestor, units, {from: investor}));
        expect(await token.balanceOf(investor)).to.be.bignumber.equal(units);
        expect(await token.balanceOf(anotherInvestor)).to.be.bignumber.equal(0);
    });
});