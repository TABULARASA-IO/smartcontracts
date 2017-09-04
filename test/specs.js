contract("Token", async function([investor, anotherInvestor, hacker]) {
    describe("Construction", function() {
        it("should be created with correct params", async function() {
        });
        it("should be controlled by crowdsale", async function() {
        });
        it("should have token supply of 0", async function() {
        });
        it("should enable minting", async function() {
        });
        it("should disable transfers", async function() {
        });
        it("should store KYC", async function() {
        });
        it("should store AML", async function() {
        });
        it("should store tokens", async function() {
        });
        it("should store frozen tokens", async function() {
        });
        it("should store supply for every investor");
    });

    it("should not accept payments",);

    it("should mint frozen tokens by owner transaction",);
    it("should fail to mint tokens by non-owner transaction",);
    it("should fail to mint tokens after minting is finished",);
    it("should not mint confirmed tokens",);

    it("should transfer tokens when transfers are enabled",);
    it("should fail to transfer tokens when transfers are disabled",);
    it("should fail to transfer more tokens than balance",);

    it("should transfer tokens from another account when transfers are enabled",);
    it("should fail to transfer tokens from another account when transfers are disabled",);
    it("should fail to transfer more tokens than allowed",);

    it("should enable transfers by owner transaction",);
    it("should fail to enable transfers by non-owner transaction",);

    it("should disable transfers by owner transaction",);
    it("should fail to disable transfers by non-owner transaction",)

    it("should finish minting by owner transaction",);
    it("should fail to finish minting by non-owner transaction",);

    it("should activate frozen tokens by investor transaction",);

    it("should add KYC entry by owner transaction",);
    it("should fail to add KYC entry by non-owner transaction",);
    it("should add AML entry by owner transaction",);
    it("should fail to add AML entry by non-owner transaction",);
});

contract("ICO", async function([wallet, investor]) {
    it("should start with correct params",);
    it("should have link to official document");

    it("should own token",);

    it("should accept eth payments",);
    it("should accept btc payments");

    describe("accept payment", function() {
        it("should transfer money to the wallet", async function() {
        });
        it("should mint frozen tokens for the sender", async function() {
        });
        it("should increase total token supply", async function() {
        });
        it("should increase paid amount for the sender", async function() {
        });
    });

    it("should reject payments before start",);
    it("should reject payments after end",);
    it("should reject payments outside cap",);
    it("should reject payments that exceed cap",);

    it("should be started after begin time",);
    it("should be ended after end time",);
    it("should be ended after hard cap reached",);

    describe("calculate token amount", function() {
       it("should have constant rate",);
       it("should be in proportion to price",);
       it("should be in proportion to payment amount");
       it("should be in proportion to stage bonus");
       it("should be incremented with bonus in first hour");
    });
});