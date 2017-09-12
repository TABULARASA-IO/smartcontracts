contract("Token", async function([investor, anotherInvestor, hacker]) {
    describe("Construction", function() {
        it("should be created with correct params");
        it("should have token supply of 0");
        it("should enable minting");
        it("should disable transfers");
        it("should store KYC");
        it("should store AML");
        it("should store tokens");
        it("should store frozen tokens");
        it("should store supply for every investor");
        it("should have a confirming oracle");
    });

    it("should not accept payments");

    it("should mint frozen tokens by owner transaction");
    it("should fail to mint tokens by non-owner transaction");
    it("should fail to mint tokens after minting is finished");
    it("should not mint confirmed tokens");

    it("should transfer tokens when transfers are enabled");
    it("should fail to transfer tokens when transfers are disabled");
    it("should fail to transfer more tokens than balance");

    it("should transfer tokens from another account when transfers are enabled");
    it("should fail to transfer tokens from another account when transfers are disabled");
    it("should fail to transfer more tokens than allowed");

    it("should enable transfers by owner transaction");
    it("should fail to enable transfers by non-owner transaction");

    it("should disable transfers by owner transaction");
    it("should fail to disable transfers by non-owner transaction")

    it("should finish minting by owner transaction");
    it("should fail to finish minting by non-owner transaction");

    it("should activate frozen tokens by investor transaction");

    it("should add KYC entry by owner transaction");
    it("should fail to add KYC entry by non-owner transaction");
    it("should add AML entry by owner transaction");
    it("should fail to add AML entry by non-owner transaction");
});

contract("ICO", async function([wallet, investor]) {
    it("should own token");

    it("should accept eth payments");
    it("should accept btc payments");

    describe("accept payment", function() {
        it("should transfer money to the wallet");
        it("should mint frozen tokens for the sender");
        it("should increase total token supply");
        it("should increase paid amount for the sender");
    });

    it("should reject payments before start");
    it("should reject payments after end");
    it("should reject payments outside cap");
    it("should reject payments that exceed cap");

    it("should be started after begin time");
    it("should be ended after end time");
    it("should be ended after hard cap reached");

    describe("calculate token amount", function() {
       it("should have constant rate");
       it("should be in proportion to price");
       it("should be in proportion to payment amount");
       it("should be in proportion to stage bonus");
       it("should be incremented with bonus in first hour");
    });
});