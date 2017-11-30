const HDWalletProvider = require('truffle-hdwallet-provider');
const fs = require('fs');

let infuraToken = "";
let mnemonic = "";

if(fs.existsSync("mnemonic")) {
  mnemonic = fs.readFileSync("mnemonic");
}

module.exports = {
  networks: {
    mainnet: {
        provider: new HDWalletProvider(mnemonic, "https://mainnet.infura.io/"+infuraToken),
        network_id: 1
    },
    ropsten: {
        provider: new HDWalletProvider(mnemonic, "https://ropsten.infura.io/"+infuraToken),
        network_id: 3
    },
    development: {
        host: "localhost",
        port: 8545,
        network_id: "*", // Match any network id
        gasPrice: 1
    }
  }
};
