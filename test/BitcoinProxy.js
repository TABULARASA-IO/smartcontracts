const BitcoinProxy = artifacts.require('BitcoinProxy');
const TokensaleFake = artifacts.require('TokensaleFake');

const utils = require('./utils');
const expect = utils.expect;
const expectThrow = utils.expectThrow;

contract("BitcoinProxy", function([deployer, investor, hacker]) {
	const satoshiAmount = 12345678;
	const btcWalletHex = "1MaTeTiCCGFvgmZxK2R1pmD9LDWvkmU9BS";
	const hash = 0x123;
	const expectedCoinsAmount = 12345678;
	const transaction = Buffer.from("0100000001a58cbbcbad45625f5ed1f20458f393fe1d1507e254265f09d9746232da4800240000000000ffffffff024e61bc00000000001976a914e1b67c3a7f8977fac55a15dbdb19c7a175676d7388ac3041ab00000000001976a91438923a989763397163a08d5498d903a0b86b9ac988ac00000000", "hex");

	function btcSend(from) {
		const preparedTransactionHash = web3.sha3(transaction);
		return transactionHash;
	}

	beforeEach(async function() {
		this.proxy = await BitcoinProxy.new(deployer);

		this.tokensale = await TokensaleFake.new();

		await this.proxy.setTokensale(this.tokensale);
	});

	it("should be initialized correctly", async function() {
		expect(await this.proxy.btcRelay()).to.be.equal(deployer);
	});

	it("user should be able to make promise to pay", async function() {
		await this.proxy.promise(investment, {from: investor});

		expect(await this.proxy.promises(msg.sender)).to.be.equal(investment);
	});

	it("user should be able claim fulfilled transaction with hash", async function() {
		await this.proxy.promise(investment, {from: investor});
		await this.proxy.claim(hash, {from: investor});

		expect(await this.proxy.claimed(hash)).to.be.equal(msg.sender);
	});

	it("user should not be able to claim transaction without promise before", async function() {
		await expectThrow(this.proxy.claim(hash, {from: investor}));
	});

	it("user should not be able to promise multiple payments at once", async function() {
		await this.proxy.promise(investment, {from: investor});
		await expectThrow(this.proxy.promise(investment * 2, {from: investor}));
	});

	it("user should not be able to reclaim transaction", async function() {
		await this.proxy.claim(hash, {from: investor});
		await expectThrow(this.proxy.claim(hash, {from: hacker}))
	});

	it("relay should be able to process valid transaction", async function() {
		await this.proxy.promise(investment, {from: investor});

		const hash = btcSend(investor);
		await this.proxy.claim(hash, {from: investor});

		await this.proxy.processTransaction(transaction, hash);

		expect(await this.tokensale.balances(investor)).to.be.equal(expectedCoinsAmount);
	});
});