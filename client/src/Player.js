import React, { Component } from "react";
import SimpleStorageContract from "./contracts/SimpleStorage.json";
import getWeb3 from "./utils/getWeb3";

class Player extends Component {
  state = { money_match_id: "1", // Hardcoded preset
            web3: null, accounts: null, contract: null };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = SimpleStorageContract.networks[networkId];
      const instance = new web3.eth.Contract(
        SimpleStorageContract.abi,
        deployedNetwork && deployedNetwork.address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance }, this.runExample);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  cashOutPlayer1JS = async () => {
    const { accounts, contract } = this.state;
    await contract.methods.cashOutPlayer1JS(this.state.money_match_id).send({ from: accounts[0] });
  };

  cashOutPlayer2JS = async () => {
    const { accounts, contract } = this.state;
    await contract.methods.cashOutPlayer2JS(this.state.money_match_id).send({ from: accounts[0] });
  };

  runExample = async () => {
  };

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="Admin">
        <h1>Cashout</h1>
        <div>
          <button onClick={this.cashOutPlayer1JS}>
            Cash out player 1
          </button>
        </div>
        <div>
          <button onClick={this.cashOutPlayer2JS}>
            Cash out player 2
          </button>
        </div>
      </div>
    );
  }
}

export default Player;
