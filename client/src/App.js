import React, { Component } from "react";
import SimpleStorageContract from "./contracts/SimpleStorage.json";
import getWeb3 from "./utils/getWeb3";
import {
  Box,
  Flex,
  Button,
  Heading,
  Text
} from 'rimble-ui';
import BetChart from "./components/BetChart";

class App extends Component {
  state = { money_match_id: "1", // Hardcoded preset
            player1_name: "Tribilin", // Hardcoded preset
            player2_name: "Pato dolan", // Hardcoded preset
            bet_amount: "",
            player: "",
            total_pot: 0,
            player1_pot: "0",
            player2_pot: "0",
            my_player1_bet: 0,
            my_player2_bet: 0,
            my_player1_earnings: 0,
            my_player2_earnings: 0,
            is_player1_wins: false,
            is_player2_wins: false,
            storageValue: 0,
            is_bets_open: false,
            is_cashout_enabled: false,
            other_money_matches: [],
            web3: null, accounts: null, contract: null, network_id: 0 };

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
    if(this.state.network_id !== 5777)
      return;
    
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
    if(player1_pot === "0")
    {
      my_player1_earnings = 0;
    }
    if(player2_pot === "0")
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

  async getOtherMoneyMatches() {
    if(this.state.network_id !== 5777)
      return;
    
    const { accounts, contract } = this.state;
    var that = this;
    
    contract.getPastEvents('MoneyMatchCreated', {
      fromBlock: 0,
      toBlock: 'latest'
    }, function(error, events){
      var i = 0;
      var other_money_matches = [];
      for (i=0; i<events.length; i++) {
        var eventObj = events[i];
        console.log(eventObj.returnValues.name);
        console.log(eventObj.returnValues.description);
        console.log(eventObj.returnValues.image_ipfs_hash);
        other_money_matches.push({
          name: eventObj.returnValues.name,
          description: eventObj.returnValues.description,
          image_ipfs_hash: eventObj.returnValues.image_ipfs_hash
        });
      }
      that.setState({other_money_matches: other_money_matches});
    });
  }

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const network_id = await web3.eth.net.getId();
      const deployedNetwork = SimpleStorageContract.networks[network_id];
      const instance = new web3.eth.Contract(
        SimpleStorageContract.abi,
        deployedNetwork && deployedNetwork.address,
      );
      
      if(this.props.match.params.money_match_id)
        this.setState({money_match_id: this.props.match.params.money_match_id});

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance, network_id }, this.runExample);
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
    const { contract } = this.state;

    this.updateStats();
    this.getOtherMoneyMatches();
  };

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    const otherMoneyMatches = this.state.other_money_matches.map((money_match) =>
      <li>{money_match.name}: {money_match.description} <img width="200" src={"http://ipfs.io/ipfs/" + money_match.image_ipfs_hash}></img></li>
    );
    return (
      <Box maxWidth={'640px'} mx={'auto'} p={3}>
        <Heading.h1>{this.state.player1_name} vs {this.state.player2_name}</Heading.h1>
        {!this.state.is_cashout_enabled &&
          <Heading.h2>There's {this.state.total_pot} eth on the line!</Heading.h2>
        }
        {this.state.is_player1_wins &&
          <Heading.h2>It has been decided: {this.state.player1_name} Wins!</Heading.h2>
        }
        {this.state.is_player2_wins &&
          <Heading.h2>It has been decided: {this.state.player2_name} Wins!</Heading.h2>
        }
        {this.state.player1_pot !== "0" && this.state.player1_pot !== "0" &&
          <BetChart player1_pot={this.state.player1_pot} player2_pot={this.state.player2_pot} player1_name={this.state.player1_name} player2_name={this.state.player2_name} />
        }
        {this.state.my_player1_bet > 0 &&
          <div>
            <Text>You betted {this.state.my_player1_bet} eth on {this.state.player1_name}</Text>
            <Text>If {this.state.player1_name} wins you get {this.state.my_player1_earnings} eth</Text>
          </div>
        }
        {this.state.my_player2_bet > 0 &&
          <div>
            <Text>You betted {this.state.my_player2_bet} eth on {this.state.player2_name}</Text>
            <Text>If {this.state.player2_name} wins you get {this.state.my_player2_earnings} eth</Text>
          </div>
        }
        {this.state.my_player1_bet <= 0 && this.state.my_player2_bet <= 0 && this.state.is_bets_open &&
          <Text>You still have no bet placed. Place your bet now and support your favorite player!</Text>
        }
        {this.state.is_bets_open &&
          <div>
            <Heading.h2>Place your bets!</Heading.h2>
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
            <Heading.h2>Congratulations! Recieve your prize!</Heading.h2>
            <button onClick={this.cashOutPlayer1BetJS}>
              Recieve prize
            </button>
          </div>
        }
        {this.state.is_cashout_enabled && this.state.my_player2_bet > 0 && this.state.is_player2_wins &&
          <div>
            <Heading.h2>Congratulations! Recieve your prize!</Heading.h2>
            <button onClick={this.cashOutPlayer2BetJS}>
              Recieve prize
            </button>
          </div>
        }
        {!this.state.is_bets_open && !this.state.is_cashout_enabled &&
          <Text>Bets are closed now, join and watch the show with us!</Text>
        }
        {!this.state.is_bets_open && this.state.is_cashout_enabled && this.state.my_player1_bet <= 0 && this.state.my_player2_bet <= 0 &&
          <Text>This money match just finished, stay tuned for the next one!</Text>
        }
        <Heading.h3>More community money matches</Heading.h3>
        <ul>{otherMoneyMatches}</ul>
      </Box>
    );
  }
}

export default App;
