contract("Token", async function(accounts) {
    it("should be ERC20 compatible");
    it("should be zeppelin audited");
    it("should be controlled by ICO");

    it("should start with correct params");
    it("should start with totalSupply of 0");
    it("should start with disabled transfers");
    it("should start with enabled minting");

    it("should not accept payments");

    it("should mint frozen tokens by owner transaction");
    it("should fail to mint tokens by non-owner transaction");
    it("should fail to mint tokens after minting is finished");
    it("should not mint confirmed tokens");

    it("should transfer tokens when transfers are enabled");
    it("should fail to transfer tokens when transfers are disabled");
    it("should fail to transfer more tokens than balance");

    it("should transfer tokens from another account when transfers are enabled");
    it("should not transfer tokens from another account when transfer are disabled");
    it("should fail to transfer more tokens than allowed");

    it("should approve allowance when transfers are enabled");
    it("should fail to approve allowance when transfers are disabled");

    it("should enable transfers by owner transaction");
    it("should not enable transfers by non-owner transaction");

    it("should finish minting by owner transaction");
    it("should not finish minting by non-owner transaction");

    it("should store frozen and confirmed tokens");
    it("should activate frozen tokens by owner transaction");
    it("should fail to activate frozen tokens by non-owner transaction");

    it("should store KYC and AML addresses");
    it("should add KYC entry by owner transaction");
    it("should fail to add KYC entry by non-owner transaction");
    it("should add AML entry by owner transaction");
    it("should fail to add AML entry by non-owner transaction");
});

contract("ICO", async function(accounts) {
    it("should implement capped crowdsale functionality");
    it("should be zeppelin audited");
    it("should be controlled by KOWN");

    it("should start with correct params");
    it("should have link to official document");
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
       it("should have constant rate price");
       it("should be in proportion to price");
       it("should be in proportion to payment amount");
       it("should be in proportion to stage bonus");
       it("should be incremented with bonus in first hour");
    });

    it("should confirm KYC address by owner transaction");
    it("should fail to confirm KYC address by non-owner transaction");
    it("should confirm AML address by owner transaction");
    it("should fail to confirm AML address by non-owner transaction");

    it("should confirm tokens for address transaction");
    it("should confirm tokens even after end");
    it("should fail to confirm tokens if KYC is not done");
    it("should fail to confirm tokens if KYC is not done even if AML is done");
    it("should fail to confirm tokens if paid amount is more than limit before AML and +" +
        "AML is not done");
})
