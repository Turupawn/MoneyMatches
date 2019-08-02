import React, { Component } from "react";
import SimpleStorageContract from "./contracts/SimpleStorage.json";
import getWeb3 from "./utils/getWeb3";

import "./Admin.css";

class Admin extends Component {
  state = { money_match_id: "1", // Hardcoded preset
            address_player1: "",
            address_player2: "",
            host_cut_percentage: "",
            winner_cut_percentage: "",
            web3: null, accounts: null, contract: null };

  constructor(props) {
    super(props);

    this.handleAddressPlayer1Change = this.handleAddressPlayer1Change.bind(this);
    this.handleAddressPlayer2Change = this.handleAddressPlayer2Change.bind(this);
    this.handleHostCutPercentageChange = this.handleHostCutPercentageChange.bind(this);
    this.handleWinnerCutPercentageChange = this.handleWinnerCutPercentageChange.bind(this);
  }

  handleAddressPlayer1Change(event) {
    this.setState({address_player1: event.target.value});
  }

  handleAddressPlayer2Change(event) {
    this.setState({address_player2: event.target.value});
  }

  handleHostCutPercentageChange(event) {
    this.setState({host_cut_percentage: event.target.value});
  }

  handleWinnerCutPercentageChange(event) {
    this.setState({winner_cut_percentage: event.target.value});
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
    await contract.methods.createMoneyMatch(this.state.address_player1,
                                              this.state.address_player2,
                                              this.state.host_cut_percentage,
                                              this.state.winner_cut_percentage).send({ from: accounts[0] });
  };

  closeBetsJS = async () => {
    const { accounts, contract } = this.state;
    await contract.methods.closeBets(this.state.money_match_id).send({ from: accounts[0] });
  };

  player1WinsJS = async () => {
    const { accounts, contract } = this.state;
    await contract.methods.player1Wins(this.state.money_match_id).send({ from: accounts[0] });
  };

  player2WinsJS = async () => {
    const { accounts, contract } = this.state;
    await contract.methods.player2Wins(this.state.money_match_id).send({ from: accounts[0] });
  };

  cashOutHostJS = async () => {
    const { accounts, contract } = this.state;
    await contract.methods.cashOutHost(this.state.money_match_id).send({ from: accounts[0] });
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
        <form>
          <label>
            Player 1 address:
            <input type="text" value={this.state.address_player1} onChange={this.handleAddressPlayer1Change} />
          </label>
          <label>
            Player 2 address:
            <input type="text" value={this.state.address_player2} onChange={this.handleAddressPlayer2Change} />
          </label>
          <label>
            Host cut percentage:
            <input type="text" value={this.state.host_cut_percentage} onChange={this.handleHostCutPercentageChange} />
          </label>
          <label>
            Winner cut percentage:
            <input type="text" value={this.state.winner_cut_percentage} onChange={this.handleWinnerCutPercentageChange} />
          </label>
        </form>
        <div>
          <button onClick={this.createMoneyMatchJS}>
            Create money match
          </button>
        </div>
        <div>
          <button onClick={this.closeBetsJS}>
            Close bets
          </button>
        </div>
        <div>
          <button onClick={this.player1WinsJS}>
            Player 1 Wins!
          </button>
        </div>
        <div>
          <button onClick={this.player2WinsJS}>
            Player 2 Wins!
          </button>
        </div>
        <div>
          <button onClick={this.cashOutHostJS}>
            Cash out
          </button>
        </div>
      </div>
    );
  }
}

export default Admin;
