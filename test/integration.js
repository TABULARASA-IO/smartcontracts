const ICO = artifacts.require('./ICO.sol');
const PreICO = artifacts.require('./PreICO.sol');
const TokenHolderFactory = artifacts.require('./TokenHolderFactory.sol');

contract('Usercase #1', function([_, kown, investor, anotherInvestor, hacker]) {
	describe('PreICO starts', function() {
		before(async function() {
			token = token.new();
			factory = await TokenHolderFactory.new(token.address, kown, endTime);
			crowdsale = await PreICO.new(startTime, endTime, cap, wallet, token.address, factory.address);

			await h.setTime(startTime);

			// investor buy tokens
			const tx = await crowdsale.buyTokens({value: investment, from: investor});
			const account = tx.logs[0].args.lockedAccount;

			// we sign account
			this.signature = web3.eth.sign(kown, sha3(investor));
		});

		it("locked account should have correct balance", async function() {
			expect(await token.balanceOf(account)).to.be.bignumber.equal(units);
		});

		it("investor account should have zero balance", async function() {
			expect(await token.balanceOf(investor)).to.be.bignumber.equal(0);
		});

		it("investor should not be able to unlock account", async function() {
			const signature = web3.eth.sign(signer, sha3(beneficiary));
			expectThrow(lockedAccount.release(signature, {from: investor}));
		});
	});

	describe('PreICO ends', function() {
		// set time over

		it("investor should be able to unlock account", async function() {
			// sign account by kown
			// unlock investor account with signature
		});

		it("investor should not be able to buy coins", async function() {

		});
	});

	describe('ICO starts', function() {
		it("investor should be able to buy coins through ICO", async function() {

		});

		it("investor should be able to unlock account created by PreICO", async function() {

		});

		it("investor should not be able to unlock account created by ICO", async function() {

		});
	});

	describe('ICO ends', function() {
		it("investor should not be able to buy coins", async function() {

		});

		it("investor should be able to unlock account", async function() {

		});
	});

	describe('After unlock time', function() {
		it("investor should not be able to unlock coins", async function() {

		});
	});
});