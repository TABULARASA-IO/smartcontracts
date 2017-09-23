const PrivatePreICO = artifacts.require('./PrivatePreICO.sol');
const Token = artifacts.require('./Token.sol');

const utils = require('./utils.js');
const expect = utils.expect;
const inBaseUnits = utils.inBaseUnits(18);
const ether = utils.ether;
const getBalance = utils.getBalance;
const expectInvalidOpcode = utils.expectInvalidOpcode;

contract("PrivatePreICO", async function([_, wallet, kown, investor, hacker]) {
	const investment = ether(1);
	const cap = ether(10);

	const oneDay = 3600;

	beforeEach(async function() {
		this.startTime = utils.latestTime() + oneDay;
		this.endTime = this.startTime + oneDay;

		this.token = await Token.new();
		this.crowdsale = await PrivatePreICO.new(
			this.startTime,
			this.endTime,
			cap,
			wallet,
			this.token.address
		);
		await this.token.transferOwnership(this.crowdsale.address);
		await this.crowdsale.transferOwnership(kown);
	});

	it("init", async function() {
		expect(await this.crowdsale.token()).to.be.equal(this.token.address);
		expect(await this.crowdsale.whitelist).to.exist;
	});

	it("should add member to whitelist", async function() {
		const statusDefault = await this.crowdsale.isMember(investor);

		const tx = await this.crowdsale.addMember(investor, {from: kown});
		const memberLogged = tx.logs[0].args.member;

		const statusChanged = await this.crowdsale.isMember(investor)

		expect(statusDefault).to.be.false;
		expect(statusChanged).to.be.true;

		expect(memberLogged).to.be.equal(investor);
	});

	it("should fail to add member by hacker", async function() {
		await expectInvalidOpcode(this.crowdsale.addMember(investor), { from: hacker });
	});

	it("should sell tokens with constant price", async function() {
		await utils.setTime(this.startTime);

		const expectedBalance = investment.times(await this.crowdsale.getRate());
		await this.crowdsale.addMember(investor, {from: kown});
		await this.crowdsale.buyTokens({from: investor, value: investment});
		expect(await this.token.balanceOf(investor)).to.be.bignumber.equal(expectedBalance);
	});

	it("should fail to sell tokens for not-whitelisted senders", async function() {
		await utils.setTime(this.startTime);

		await expectInvalidOpcode(this.crowdsale.buyTokens({from: hacker, value: investment}));
	});
});