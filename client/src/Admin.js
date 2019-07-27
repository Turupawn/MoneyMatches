import React, { Component } from "react";
import SimpleStorageContract from "./contracts/SimpleStorage.json";
import getWeb3 from "./utils/getWeb3";

import "./Admin.css";

class Admin extends Component {
  state = { address_player1: "", address_player2: "", web3: null, accounts: null, contract: null };

  constructor(props) {
    super(props);

    this.handleAddressPlayer1Change = this.handleAddressPlayer1Change.bind(this);
    this.handleAddressPlayer2Change = this.handleAddressPlayer2Change.bind(this);
  }

  handleAddressPlayer1Change(event) {
    this.setState({address_player1: event.target.value});
  }

  handleAddressPlayer2Change(event) {
    this.setState({address_player2: event.target.value});
  }

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

  createMoneyMatchJS = async () => {
    const { accounts, contract } = this.state;
    // Stores a given value, 5 by default.
    console.log(accounts[0]);
    await contract.methods.createMoneyMatch(this.state.address_player1,this.state.address_player2).send({ from: accounts[0] });

    // Get the value from the contract to prove it worked.
    const response = await contract.methods.getPlayer1Pot().call();

    // Update state with the result.
    this.setState({ storageValue: response });
  };

  runExample = async () => {
    const { accounts, contract } = this.state;
  };

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="Admin">
        <h1>Create money match</h1>
        <form onSubmit={this.createMoneyMatchJS}>
          <label>
            Address1:
            <input type="text" value={this.state.address_player1} onChange={this.handleAddressPlayer1Change} />
          </label>
          <label>
            Address2:
            <input type="text" value={this.state.address_player2} onChange={this.handleAddressPlayer2Change} />
          </label>
        </form>
        <button onClick={this.createMoneyMatchJS}>
          Create money match
        </button>
      </div>
    );
  }
}

export default Admin;
