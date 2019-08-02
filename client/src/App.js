import React, { Component } from "react";
import SimpleStorageContract from "./contracts/SimpleStorage.json";
import getWeb3 from "./utils/getWeb3";

import "./App.css";

class App extends Component {
  state = { money_match_id: "1", // Hardcoded preset
            player1_name: "Tribilin", // Hardcoded preset
            player2_name: "Pato dolan", // Hardcoded preset
            bet_amount: "",
            player: "",
            total_pot: 0,
            player1_pot: 0,
            player2_pot: 0,
            my_player1_bet: 0,
            my_player2_bet: 0,
            my_player1_earnings: 0,
            my_player2_earnings: 0,
            is_player1_wins: false,
            is_player2_wins: false,
            storageValue: 0,
            is_bets_open: false,
            is_cashout_enabled: false,
            web3: null, accounts: null, contract: null };

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
    const player2_pot = await contract.methods.getPlayer2Pot(this.state.money_match_id).call();
    const cut_free_pot = await contract.methods.getCutFreePot(this.state.money_match_id).call();
    const my_player1_bet = await contract.methods.getPlayer1BetByAddress(this.state.money_match_id, accounts[0]).call();
    const my_player2_bet = await contract.methods.getPlayer2BetByAddress(this.state.money_match_id, accounts[0]).call();
    const is_bets_open = await contract.methods.isBetsOpen(this.state.money_match_id).call();
    const is_cashout_enabled = await contract.methods.isCashoutEnabled(this.state.money_match_id).call();
    const is_player1_wins = await contract.methods.isPlayer1Wins(this.state.money_match_id).call();
    const is_player2_wins = await contract.methods.isPlayer2Wins(this.state.money_match_id).call();
    var total_pot = Number(player1_pot) + Number(player2_pot);
    var my_player1_earnings = my_player1_bet * cut_free_pot / player1_pot;
    var my_player2_earnings = my_player2_bet * cut_free_pot / player2_pot;
    if(player1_pot == 0)
    {
      my_player1_earnings = 0;
    }
    if(player2_pot == 0)
    {
      my_player2_earnings = 0;
    }
    this.setState({
                    player1_pot: this.state.web3.utils.fromWei(player1_pot,'ether'),
                    player2_pot: this.state.web3.utils.fromWei(player2_pot,'ether'),
                    my_player1_bet: this.state.web3.utils.fromWei(my_player1_bet,'ether'),
                    my_player2_bet: this.state.web3.utils.fromWei(my_player2_bet,'ether'),
                    total_pot: this.state.web3.utils.fromWei(total_pot.toString(), 'ether'),
                    my_player1_earnings: this.state.web3.utils.fromWei(""+my_player1_earnings, 'ether'),
                    my_player2_earnings: this.state.web3.utils.fromWei(""+my_player2_earnings, 'ether'),
                    is_bets_open: is_bets_open,
                    is_cashout_enabled: is_cashout_enabled,
                    is_player1_wins: is_player1_wins,
                    is_player2_wins: is_player2_wins
                  });
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

  cashOutPlayer1BetJS = async () => {
    const { accounts, contract } = this.state;
    // Stores a given value, 5 by default.
    await contract.methods.cashOutPlayer1Bet(this.state.money_match_id).send({ from: accounts[0] });

    this.updateStats();
  };

  cashOutPlayer2BetJS = async () => {
    const { accounts, contract } = this.state;
    // Stores a given value, 5 by default.
    await contract.methods.cashOutPlayer2Bet(this.state.money_match_id).send({ from: accounts[0] });

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
        <h1>atomicbuster.com</h1>
        <h4>Bet and support your favorite players!</h4>
        {!this.state.is_cashout_enabled &&
          <div>
            <h2>{this.state.player1_name} vs {this.state.player2_name}</h2>
            <h2>There's {this.state.total_pot} eth on the line!</h2>
          </div>
        }
        {this.state.is_player1_wins &&
          <div>
            <h2>It has been decided: {this.state.player1_name} Wins!</h2>
          </div>
        }
        {this.state.is_player2_wins &&
          <div>
            <h2>It has been decided: {this.state.player2_name} Wins!</h2>
          </div>
        }
        <div>{this.state.player1_pot} eth on {this.state.player1_name}</div>
        <div>{this.state.player2_pot} eth on {this.state.player2_name}</div>
        {this.state.my_player1_bet > 0 &&
          <div>
            <div>You betted {this.state.my_player1_bet} eth on {this.state.player1_name}</div>
            <div>If {this.state.player1_name} wins you get {this.state.my_player1_earnings} eth</div>
          </div>
        }
        {this.state.my_player2_bet > 0 &&
          <div>
            <div>You betted {this.state.my_player2_bet} eth on {this.state.player2_name}</div>
            <div>If {this.state.player2_name} wins you get {this.state.my_player2_earnings} eth</div>
          </div>
        }
        {this.state.my_player1_bet <= 0 && this.state.my_player2_bet <= 0 && this.state.is_bets_open &&
          <div>
            You still have no bet placed. Place your bet now and support your favorite player!
          </div>
        }
        {this.state.is_bets_open &&
          <div>
            <h1>Place your bets!</h1>
            <form onSubmit={this.betJS}>
              <label>
                <input type="text" placeholder="Your bet in ETH here" value={this.state.bet_amount} onChange={this.handleBetAmountChange} />
              </label>
              <label>
                <select onChange={this.handlePlayerChange}>
                  <option value="0">Select your player!</option>
                  <option value="1">{this.state.player1_name}</option>
                  <option value="2">{this.state.player2_name}</option>
                </select>
              </label>
            </form>
            <button onClick={this.betJS}>
              Bet
            </button>
          </div>
        }
        {this.state.is_cashout_enabled && this.state.my_player1_bet > 0 && this.state.is_player1_wins &&
          <div>
            <h3>Congratulations! Recieve your prize!</h3>
            <button onClick={this.cashOutPlayer1BetJS}>
              Recieve prize
            </button>
          </div>
        }
        {this.state.is_cashout_enabled && this.state.my_player2_bet > 0 && this.state.is_player2_wins &&
          <div>
            <h3>Congratulations! Recieve your prize!</h3>
            <button onClick={this.cashOutPlayer2BetJS}>
              Recieve prize
            </button>
          </div>
        }
        {!this.state.is_bets_open && !this.state.is_cashout_enabled &&
          <div>
            <div>Bets are closed now, join and watch the show with us!</div>
          </div>
        }
        {!this.state.is_bets_open && this.state.is_cashout_enabled && this.state.my_player1_bet <= 0 && this.state.my_player2_bet <= 0 &&
          <div>
            <div>This money match just finished, stay tuned for the next one!</div>
          </div>
        }

      </div>
    );
  }
}

export default App;
