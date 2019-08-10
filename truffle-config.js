const path = require("path");
var HDWalletProvider = require("truffle-hdwallet-provider");

var mnemonic = "";
var infura_api_key = "";

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    ganache: {
      network_id: 5777,
      host: 'localhost',
      port: 8545
    },
    rinkeby: {
      provider: function() { 
       return new HDWalletProvider(mnemonic, "https://rinkeby.infura.io/v3/" + infura_api_key);
      },
      network_id: 4,
      gas: 4500000,
      gasPrice: 10000000000,
    }
  }
};
