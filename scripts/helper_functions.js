let chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
const assert = chai.assert;
const expect = chai.expect;
chai.use(chaiAsPromised);

const expectInvalidOpcode = async (promise) => {
    try {
        await promise;
    }
    catch (error) {
        expect(error.message).to.include('invalid opcode')
        return;
    }
    expect.fail('Expected throw not received');
}

const expectInvalidJump = async (promise) => {
    try {
        await promise;
    }
    catch (error) {
        expect(error.message).to.include('invalid JUMP');
        return;
    }
    expect.fail('Expected throw not received')
}

const expectOutOfGas = async (promise) => {
    try {
        await promise;
    }
    catch (error) {
        expect(error.message).to.include('out of gas');
        return;
    }
    expect.fail('Expected throw not received');
}

const ether = (amount) => {
    return new web3.BigNumber(web3.toWei(amount, 'ether')).toString();
}

const getBalance = (address) => {
    return web3.fromWei(web3.eth.getBalance(address).toString(), 'ether');
}

const inEther = (amountInWei) => {
    return web3.fromWei(amountInWei, 'ether');
}

const inWei = (amountInEther) => {
    return web3.toWei(amountInEther, 'ether');
}

const tokenWei = (decimals) => (amountInTokens) => {
    return amountInTokens * (10 ** decimals);
}

const inBaseUnits = (decimals) => (tokens) => {
    return tokens * (10 ** decimals);
}

const inTokenUnits = (decimals) => (tokenBaseUnits) => {
    return tokenBaseUnits / (10 * decimals);
}

const equivalentTokenBaseUnits = (rate) => (wei) => {
    return rate * wei;
}

const equivalentTokenUnits = (decimals) => (rate) => (wei) => {
    return rate * wei / (10 ** decimals);
}

const latestTime = () => web3.eth.getBlock('latest').timestamp;

const increaseTime = (duration) => {
    const id = Date.now();

    return new Promise((resolve, reject) => {
        web3.currentProvider.sendAsync({
            jsonrpc: '2.0',
            method: 'evm_increaseTime',
            params: [duration],
            id
        }, err => {
            if(err) return reject(err);

            web3.currentProvider.sendAsync({
                jsonrpc: '2.0',
                method: 'evm_mine',
                id: id+1
            }, (err, res) => {
                if(err) return reject(err);
                resolve(res);
            })
        })
    })
}

module.exports = {
    expectInvalidOpcode,
    expectInvalidJump,
    expectOutOfGas,
    ether,
    getBalance,
    inEther,
    inWei,
    equivalentTokenBaseUnits,
    equivalentTokenUnits,
    inBaseUnits,
    inTokenUnits,
    latestTime,
    increaseTime
}