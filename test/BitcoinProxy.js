const BitcoinProxy = artifacts.require('BitcoinProxy');
const Tokensale = artifacts.require('TokensaleFake');

const utils = require('./utils');
const expect = utils.expect;
const expectThrow = utils.expectThrow;

const bs58 = require('bs58');

contract("BitcoinProxy", function([deployer, investor, hacker, token, placeholder, wallet]) {
	const satoshiAmount = 12345678;
	const rawBtcWallet = "1MaTeTiCCGFvgmZxK2R1pmD9LDWvkmU9BS";
	const hash = 0x123;
	const expectedCoinsAmount = 12345678;
	const rawTransaction = "0100000001a58cbbcbad45625f5ed1f20458f393fe1d1507e254265f09d9746232da4800240000000000ffffffff024e61bc00000000001976a914e1b67c3a7f8977fac55a15dbdb19c7a175676d7388ac3041ab00000000001976a91438923a989763397163a08d5498d903a0b86b9ac988ac00000000";

	const btcWallet = "0x".concat(bs58.decode(rawBtcWallet).toString("hex").slice(2));
	const transaction = "0x".concat(rawTransaction);

	function btcSend(from) {
		const preparedTransactionHash = web3.sha3(transaction);
		return preparedTransactionHash;
	}

	beforeEach(async function() {
		this.proxy = await BitcoinProxy.new(deployer, btcWallet);

		this.tokensale = await Tokensale.new(
			utils.latestTime() + 3600,
			token,
			this.proxy.address,
			placeholder,
			wallet
		);

		await this.proxy.setTokensale(this.tokensale.address);
	});

	it("should be initialized correctly", async function() {
		expect(await this.proxy.btcRelay()).to.be.equal(deployer);
	});

	it("user should be able to make promise to pay", async function() {
		await this.proxy.promise(satoshiAmount, {from: investor});

		expect(await this.proxy.promises(investor)).to.be.bignumber.equal(satoshiAmount);
	});

	it("user should be able claim fulfilled transaction with hash", async function() {
		await this.proxy.promise(satoshiAmount, {from: investor});
		await this.proxy.claim(hash, {from: investor});

		expect(await this.proxy.claimed(hash)).to.be.bignumber.equal(investor);
	});

	it("user should not be able to claim transaction without promise before", async function() {
		await expectThrow(this.proxy.claim(hash, {from: investor}));
	});

		it("user should not be able to promise multiple payments at once", async function() {
			await this.proxy.promise(satoshiAmount, {from: investor});
			await expectThrow(this.proxy.promise(satoshiAmount * 2, {from: investor}));
		});

	it("user should not be able to reclaim transaction", async function() {
		await this.proxy.promise(satoshiAmount, {from: investor});
		await this.proxy.claim(hash, {from: investor});
		await expectThrow(this.proxy.claim(hash, {from: hacker}))
	});

	it("relay should process valid transaction only once", async function() {
		await this.proxy.promise(satoshiAmount, {from: investor});

		const hash = btcSend(investor);
		await this.proxy.claim(hash, {from: investor});

		const tx = await this.proxy.processTransaction(transaction, hash);

		expect(tx.logs[0].args['beneficiary']).to.be.equal(investor);
		expect(tx.logs[1].args['btcAmount']).to.be.bignumber.equal(satoshiAmount);
	});
});