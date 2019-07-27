import React, { Component } from "react";
import SimpleStorageContract from "./contracts/SimpleStorage.json";
import getWeb3 from "./utils/getWeb3";

import "./App.css";

class App extends Component {
  state = { money_match_id: "1", bet_amount: "", player: "", total_pot: 0, player1_pot: 0, player2_pot: 0, my_player1_bet: 0, my_player2_bet: 0, storageValue: 0, web3: null, accounts: null, contract: null };

  constructor(props) {
    super(props);

    this.handleBetAmountChange = this.handleBetAmountChange.bind(this);
    this.handlePlayerChange = this.handlePlayerChange.bind(this);
  }

  handleBetAmountChange(event) {
    this.setState({bet_amount: event.target.value});
  }

  handlePlayerChange(event) {
    this.setState({player: event.target.value});
  }

  handleSubmit(event) {
    alert('A name was submitted: ' + this.state.value);
    event.preventDefault();
  }

  async updateStats() {
    const { accounts, contract } = this.state;
    
    const player1_pot = await contract.methods.getPlayer1Pot(this.state.money_match_id).call();
    this.setState({ player1_pot: this.state.web3.utils.fromWei(player1_pot,'ether') });
    
    const player2_pot = await contract.methods.getPlayer2Pot(this.state.money_match_id).call();
    this.setState({ player2_pot: this.state.web3.utils.fromWei(player2_pot,'ether') });

    const my_player1_bet = await contract.methods.getMyPlayer1Bet(this.state.money_match_id, accounts[0]).call();
    this.setState({ my_player1_bet: this.state.web3.utils.fromWei(my_player1_bet,'ether') });

    const my_player2_bet = await contract.methods.getMyPlayer2Bet(this.state.money_match_id, accounts[0]).call();
    this.setState({ my_player2_bet: this.state.web3.utils.fromWei(my_player2_bet,'ether') });
    
    var total_pot = Number(player1_pot) + Number(player2_pot);
    this.setState({ total_pot: this.state.web3.utils.fromWei(total_pot.toString(), 'ether') });
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

  betJS = async () => {
    const { accounts, contract } = this.state;
    // Stores a given value, 5 by default.
    await contract.methods.bet(this.state.money_match_id, this.state.web3.utils.toWei(this.state.bet_amount,'ether'), this.state.player).send({ from: accounts[0], value: this.state.web3.utils.toWei(this.state.bet_amount, 'ether') });


    this.updateStats();
  };

  cashOutJS = async () => {
    const { accounts, contract } = this.state;
    // Stores a given value, 5 by default.
    await contract.methods.cashOut(this.state.money_match_id).send({ from: accounts[0] });

    this.updateStats();
  };

  runExample = async () => {
    const { accounts, contract } = this.state;

    this.updateStats();
  };

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>Inspect pot</h1>
        <div>Total pot: {this.state.total_pot} eth</div>
        <div>Player 1 pot: {this.state.player1_pot} eth</div>
        <div>Player 2 pot: {this.state.player2_pot} eth</div>
        <div>My player 1 bet: {this.state.my_player1_bet} eth</div>
        <div>My player 2 bet: {this.state.my_player2_bet} eth</div>
        <button onClick={this.getPlayer1PotJS}>
          Inspect
        </button>
        <h1>Bet</h1>
        <form onSubmit={this.betJS}>
          <label>
            Bet amount:
            <input type="text" value={this.state.bet_amount} onChange={this.handleBetAmountChange} />
          </label>
          <label>
            Player:
            <input type="text" value={this.state.player} onChange={this.handlePlayerChange} />
          </label>
        </form>
        <button onClick={this.betJS}>
          Bet
        </button>

        <h1>Cash out</h1>
        <button onClick={this.cashOutJS}>
          Cash out
        </button>
      </div>
    );
  }
}

export default App;
