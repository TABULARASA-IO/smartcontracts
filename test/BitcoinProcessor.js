const BitcoinProcessor = artifacts.require('./BitcoinProcessorMock.sol');
const Relay = artifacts.require('./MockBTCRelay.sol');

const utils = require('./utils.js');
const expect = utils.expect;
const expectInvalidOpcode = utils.expectInvalidOpcode;

contract('BitcoinProcessor', function([_, investor, anotherInvestor]) {
	const bitcoinAmount = new web3.BigNumber(10);

	beforeEach(async function() {
		this.relay = await Relay.new();
		this.processor = await BitcoinProcessor.new(this.relay.address);
		this.processorContract = this.processor.address;

		this.rawTransaction = '0x'+Buffer.from("send 10 BTC to $ourBitcoinWallet").toString("hex");
		this.merkleProof = [];
		this.txIndex = 100500;
		this.blockHash = 100500;

		// reversed double sha256 from rawTransaction
		// investor should call verifyTx() with rawTransaction and proof to retrieve this hash
		this.txHash = 0x123;
	});

	it("should be initialized correctly", async function() {
		expect(await this.processor.btcRelay()).to.be.equal(this.relay.address);
	});

	it("should accept promise to send bitcoins", async function() {
		await this.processor.promise(bitcoinAmount, {from: investor});

		const promisedToPay = await this.processor.promises(investor);

		expect(promisedToPay).to.be.bignumber.equal(bitcoinAmount);
	});

	it("shold fail to accept multiple promises from investor at the same time", async function() {
		await this.processor.promise(bitcoinAmount, { from: investor });
		await this.processor.promise(bitcoinAmount*2, { from: anotherInvestor });

		expectInvalidOpcode(this.processor.promise(bitcoinAmount*2, { from: investor }));
	});

	it("should cancel promise", async function() {
		await this.processor.promise(bitcoinAmount, { from: investor });
		const promiseSettled = await this.processor.promises(investor);

		await this.processor.undoPromise({ from: investor });
		const promiseCancelled = await this.processor.promises(investor);

		expect(promiseSettled).to.be.bignumber.equal(bitcoinAmount);
		expect(promiseCancelled).to.be.bignumber.equal(0);
	});

	it("should confirm promised payment", async function() {
		await this.processor.promise(bitcoinAmount, { from: investor });
		await this.processor.claim(this.txHash, { from: investor });

		expect(await this.processor.hashes(this.txHash)).to.be.equal(investor);
	});

	it("should fail to confirm payment without promise", async function() {
		expectInvalidOpcode(this.processor.claim(this.txHash, { from: investor }));
	});

	it("should relay transaction", async function() {
		// investor promise to pay bitcoinAmount
		await this.processor.promise(bitcoinAmount, { from: investor });

		// investor send bitcoinAmount to our wallet and retrieve transaction hash
		await this.processor.claim(this.txHash, { from: investor });

		// investor retrieve proof for bitcoin transaction and relay it
		await this.relay.relayTx(this.rawTransaction, this.txIndex, this.merkleProof, this.blockHash, this.processorContract, { from: investor });

		// crowdsale should process transaction with `buyTokenBtc` method
		expect(await this.processor.lastBeneficiary()).to.be.equal(investor);
		expect(await this.processor.lastBtcAmount()).to.be.bignumber.equal(bitcoinAmount);
	});

	it("should fail to relay non-claimed transaction", async function() {
		await expectInvalidOpcode(this.relay.relayTx(this.rawTransaction, this.txIndex, this.merkleProof, this.blockHash, this.processorContract, { from: investor }));
	});
});