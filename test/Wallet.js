const Wallet = artifacts.require('Wallet');
const Multisig = artifacts.require('MultiSigWallet');

const utils = require('./utils.js');
const expect = utils.expect;
const expectThrow = utils.expectThrow;
const getBalance = utils.getBalance;

contract("Wallet", function([_, tokensale, first, second, third, fourth, fifth]) {
	const payment = utils.ether(0.01);

	const firstPercentage = 50;
	const secondPercentage = 15;
	const thirdPercentage = 15;
	const fourthPercentage = 10;
	const fifthPercentage = 10;

	beforeEach(async function() {
		const departmentWallets = [first, second, third, fourth, fifth];
		const departmentPercentages = [firstPercentage, secondPercentage, thirdPercentage, fourthPercentage, fifthPercentage];

		this.wallet = await Wallet.new(departmentWallets, departmentPercentages);
	});

	it("should accept payments", async function() {
		const balanceBefore = getBalance(this.wallet.address);
		const totalBefore = await this.wallet.total();

		await this.wallet.send(payment, { from: tokensale });

		const balanceAfter = getBalance(this.wallet.address);
		const totalAfter = await this.wallet.total();

		expect(balanceBefore).to.be.bignumber.equal(0);
		expect(utils.ether(balanceAfter)).to.be.bignumber.equal(payment);

		expect(totalBefore).to.be.bignumber.equal(0);
		expect(totalAfter).to.be.bignumber.equal(payment);
	});

	it("should allow withdrawal by departments", async function() {
		const firstBalanceBefore = getBalance(first);
		const firstBalanceAllowed = payment * firstPercentage / 100;

		const secondBalanceBefore = getBalance(second);
		const secondBalanceAllowed = payment * secondPercentage / 100;

		const thirdBalanceBefore = getBalance(third);
		const thirdBalanceAllowed = payment * thirdPercentage / 100;

		const fourthBalanceBefore = getBalance(fourth);
		const fourthBalanceAllowed = payment * fourthPercentage / 100;

		const fifthBalanceBefore = getBalance(fifth);
		const fifthBalanceAllowed = payment * fifthPercentage / 100;

		await this.wallet.send(payment, { from: tokensale });

		const tx1 = await this.wallet.withdraw({from: first});
		const tx2 = await this.wallet.withdraw({from: second});
		const tx3 = await this.wallet.withdraw({from: third});
		const tx4 = await this.wallet.withdraw({from: fourth});
		const tx5 = await this.wallet.withdraw({from: fifth});

		const firstBalanceAfter = getBalance(first);
		const secondBalanceAfter = getBalance(second);
		const thirdBalanceAfter = getBalance(third);
		const fourthBalanceAfter = getBalance(fourth);
		const fifthBalanceAfter = getBalance(fifth);

		expect(tx1.logs[0].args['beneficiary']).to.be.equal(first);
		expect(tx1.logs[0].args['amount']).to.be.bignumber.equal(firstBalanceAllowed);

		expect(tx2.logs[0].args['beneficiary']).to.be.equal(second);
		expect(tx2.logs[0].args['amount']).to.be.bignumber.equal(secondBalanceAllowed);

		expect(tx3.logs[0].args['beneficiary']).to.be.equal(third);
		expect(tx3.logs[0].args['amount']).to.be.bignumber.equal(thirdBalanceAllowed);

		expect(tx4.logs[0].args['beneficiary']).to.be.equal(fourth);
		expect(tx4.logs[0].args['amount']).to.be.bignumber.equal(fourthBalanceAllowed);

		expect(tx5.logs[0].args['beneficiary']).to.be.equal(fifth);
		expect(tx5.logs[0].args['amount']).to.be.bignumber.equal(fifthBalanceAllowed);

		expect(await this.wallet.total()).to.be.bignumber.equal(payment);
		expect(getBalance(this.wallet.address)).to.be.bignumber.equal(0);

		expect(firstBalanceAfter).to.be.bignumber.above(firstBalanceBefore);
		expect(secondBalanceAfter).to.be.bignumber.above(secondBalanceBefore);
		expect(thirdBalanceAfter).to.be.bignumber.above(thirdBalanceBefore);
		expect(fourthBalanceAfter).to.be.bignumber.above(fourthBalanceBefore);
		expect(fifthBalanceAfter).to.be.bignumber.above(fifthBalanceBefore);
	});

	it("should fail to withdraw more than allowed", async function() {
		await this.wallet.send(payment, { from: tokensale });

		await this.wallet.withdraw({from: first});
		expectThrow(this.wallet.withdraw({from: first}));
	});
});