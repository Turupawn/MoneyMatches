import React, { Component } from "react";
import SimpleStorageContract from "./contracts/SimpleStorage.json";
import getWeb3 from "./utils/getWeb3";
import ThreeBox from './3box'
import {
  Box,
  Link,
  Card,
  Heading,
  Text,
  Image,
  Button,
  Loader
} from 'rimble-ui';
import NetworkIndicator from '@rimble/network-indicator';
import ConnectionBanner from '@rimble/connection-banner';
import BetChart from "./components/BetChart";
import HostControl from "./components/HostControl";
import BetForm from "./components/BetForm";
import Player1Control from "./components/Player1Control";
import Player2Control from "./components/Player2Control";

class App extends Component {
  state = { required_network: 4, // Hardcoded preset Rinkeby 4 and local 5777
            money_match_id: "1",
            host_addr: "",
            host_name: "",
            player1_name: "",
            player2_name: "",
            image_ipfs_hash: "",
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
            is_host: false,
            is_player1: false,
            is_player2: false,
            has_cashed_out_player1_bet: false,
            has_cashed_out_player2_bet: false,
            has_host_cashed_out: false,
            has_player1_cashed_out: false,
            has_player2_cashed_out: false,
            winner_cut: 0,
            host_cut: 0,
            loaded: false,
            web3: null, accounts: null, contract: null, network_id: 0 };

  constructor(props) {
    super(props);
    this.updateStats = this.updateStats.bind(this);
    this.onGetAccounts = this.onGetAccounts.bind(this);
  }

  handleSubmit(event) {
    alert('A name was submitted: ' + this.state.value);
    event.preventDefault();
  }

  async updateStats() {
    if(this.state.network_id != this.state.required_network)
      return;
    
    const { accounts, contract } = this.state;
    
    const host_addr = await contract.methods.getHostAddress(this.state.money_match_id).call();
    const player1_name = await contract.methods.getPlayer1Name(this.state.money_match_id).call();
    const player2_name = await contract.methods.getPlayer2Name(this.state.money_match_id).call();
    const summary = await contract.methods.getSummary(this.state.money_match_id).call();
    const image_ipfs_hash = await contract.methods.getImageIPFSHash(this.state.money_match_id).call();
    const player1_pot = await contract.methods.getPlayer1Pot(this.state.money_match_id).call();
    const player2_pot = await contract.methods.getPlayer2Pot(this.state.money_match_id).call();
    const cut_free_pot = await contract.methods.getCutFreePot(this.state.money_match_id).call();
    const my_player1_bet = await contract.methods.getPlayer1BetByAddress(this.state.money_match_id, accounts[0]).call();
    const my_player2_bet = await contract.methods.getPlayer2BetByAddress(this.state.money_match_id, accounts[0]).call();
    const is_bets_open = await contract.methods.isBetsOpen(this.state.money_match_id).call();
    const is_cashout_enabled = await contract.methods.isCashoutEnabled(this.state.money_match_id).call();
    const is_player1_wins = await contract.methods.isPlayer1Wins(this.state.money_match_id).call();
    const is_player2_wins = await contract.methods.isPlayer2Wins(this.state.money_match_id).call();
    const is_host = await contract.methods.isAddressHost(this.state.money_match_id, accounts[0]).call();
    const is_player1 = await contract.methods.isAddressPlayer1(this.state.money_match_id, accounts[0]).call();
    const is_player2 = await contract.methods.isAddressPlayer2(this.state.money_match_id, accounts[0]).call();
    const has_cashed_out_player1_bet = await contract.methods.hasCashedOutPlayer1Bet(this.state.money_match_id, accounts[0]).call();
    const has_cashed_out_player2_bet = await contract.methods.hasCashedOutPlayer2Bet(this.state.money_match_id, accounts[0]).call();
    const has_host_cashed_out = await contract.methods.hasHostCashedOut(this.state.money_match_id).call();
    const has_player1_cashed_out = await contract.methods.hasPlayer1CashedOut(this.state.money_match_id).call();
    const has_player2_cashed_out = await contract.methods.hasPlayer2CashedOut(this.state.money_match_id).call();
    const host_cut = await contract.methods.getHostCut(this.state.money_match_id).call();
    const winner_cut = await contract.methods.getWinnerCut(this.state.money_match_id).call();
    
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

    // 3box stuff
    const host_profile = await ThreeBox.getProfile(host_addr);
    var host_name = "";
    if(host_profile.name)
    {
      host_name = host_profile.name;
    }

    this.setState({
      host_addr: host_addr,
      host_name: host_name,
      player1_name: this.state.web3.utils.hexToUtf8(player1_name),
      player2_name: this.state.web3.utils.hexToUtf8(player2_name),
      summary: summary,
      image_ipfs_hash: image_ipfs_hash,
      player1_pot: player1_pot,
      player2_pot: player2_pot,
      my_player1_bet: this.state.web3.utils.fromWei(my_player1_bet,'ether'),
      my_player2_bet: this.state.web3.utils.fromWei(my_player2_bet,'ether'),
      total_pot: this.state.web3.utils.fromWei(total_pot.toString(), 'ether'),
      my_player1_earnings: this.state.web3.utils.fromWei(""+my_player1_earnings, 'ether'),
      my_player2_earnings: this.state.web3.utils.fromWei(""+my_player2_earnings, 'ether'),
      is_bets_open: is_bets_open,
      is_cashout_enabled: is_cashout_enabled,
      is_player1_wins: is_player1_wins,
      is_player2_wins: is_player2_wins,
      is_host: is_host,
      is_player1: is_player1,
      is_player2: is_player2,
      has_cashed_out_player1_bet: has_cashed_out_player1_bet,
      has_cashed_out_player2_bet: has_cashed_out_player2_bet,
      has_host_cashed_out: has_host_cashed_out,
      has_player1_cashed_out: has_player1_cashed_out,
      has_player2_cashed_out: has_player2_cashed_out,
      host_cut: this.state.web3.utils.fromWei(host_cut,'ether'),
      winner_cut: this.state.web3.utils.fromWei(winner_cut,'ether'),
      loaded: true
    });
  }

  async getOtherMoneyMatches() {
    if(this.state.network_id !== this.state.required_network)
      return;
    
    const { contract } = this.state;
    var that = this;
    
    contract.getPastEvents('MoneyMatchCreated', {
      fromBlock: 0,
      toBlock: 'latest'
    }, function(error, events){
      var i = 0;
      var other_money_matches = [];
      for (i=0; i<events.length; i++) {
        var eventObj = events[i];
        other_money_matches.push({
          id: eventObj.returnValues.id,
          player1_name: that.state.web3.utils.hexToUtf8(eventObj.returnValues.player1_name),
          player2_name: that.state.web3.utils.hexToUtf8(eventObj.returnValues.player2_name),
          summary: eventObj.returnValues.summary,
          image_ipfs_hash: eventObj.returnValues.image_ipfs_hash
        });
      }
      that.setState({other_money_matches: other_money_matches});
    });
  }

  onGetAccounts(e,accounts)
  {
    if(accounts.length>0)
      this.connectToWeb3();
  }

  componentDidMount = async () => {
    if(window.ethereum)
      this.setState({network_id: parseInt(window.ethereum.networkVersion)});
    if(window.web3 && window.web3.eth)
      window.web3.eth.getAccounts(this.onGetAccounts)
  }

  connectToWeb3 = async () => 
  {
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
    this.updateStats();
    this.getOtherMoneyMatches();
  };

  render() {
    const otherMoneyMatches = this.state.other_money_matches.map((money_match) =>
      <Card>
        <Heading.h4>{money_match.player1_name} vs {money_match.player2_name}</Heading.h4>
        <Link href={"/money_match/" + money_match.id}>
          <Image href="/host" width="200" src={"http://ipfs.io/ipfs/" + money_match.image_ipfs_hash}></Image>
        </Link>
        <Text>{money_match.summary}</Text>
        <Box>
          <Link href={"/money_match/" + money_match.id}>
            Go to money match
          </Link>
        </Box>
      </Card>
    );
    return (
      <Box maxWidth={'640px'} mx={'auto'} p={3}>
        <Card>
          <NetworkIndicator currentNetwork={this.state.network_id} requiredNetwork={this.state.required_network}/>
          <ConnectionBanner
            currentNetwork={this.state.network_id}
            requiredNetwork={this.state.required_network}
            onWeb3Fallback={window.ethereum == null}
          />
        </Card>
        {this.state.web3 && !this.state.loaded &&
          <Card>
            <Loader size="40px" />
          </Card>
        }
        {this.state.web3 && this.state.loaded &&
          <Box>
            <Card>
              <Heading.h1>{this.state.player1_name} vs {this.state.player2_name}</Heading.h1>
              {!this.state.is_cashout_enabled &&
                <Heading.h2>There's {this.state.total_pot} eth on the line!</Heading.h2>
              }
              <Image
                borderRadius={8}
                height="auto"
                width="640"
                mx={'auto'} p={3}
                src={"http://ipfs.io/ipfs/" + this.state.image_ipfs_hash}
              />
              {this.state.is_player1_wins &&
                <Heading.h2>It has been decided: {this.state.player1_name} Wins!</Heading.h2>
              }
              {this.state.is_player2_wins &&
                <Heading.h2>It has been decided: {this.state.player2_name} Wins!</Heading.h2>
              }
              {this.state.my_player1_bet > 0 && !this.state.is_cashout_enabled &&
                <Box>
                  <Heading.h2>You betted {this.state.my_player1_bet} eth on {this.state.player1_name}</Heading.h2>
                  <Text>If {this.state.player1_name} wins you get {this.state.my_player1_earnings} eth</Text>
                </Box>
              }
              {this.state.my_player2_bet > 0 && !this.state.is_cashout_enabled &&
                <Box>
                  <Heading.h2>You betted {this.state.my_player2_bet} eth on {this.state.player2_name}</Heading.h2>
                  <Text>If {this.state.player2_name} wins you get {this.state.my_player2_earnings} eth</Text>
                </Box>
              }
              {this.state.is_cashout_enabled && this.state.my_player1_bet > 0 && this.state.is_player1_wins &&
                <Box>
                  <Heading.h2>Congratulations!</Heading.h2>
                  <Button width={1} onClick={this.cashOutPlayer1BetJS}>
                    Collect {this.state.my_player1_earnings} eth
                  </Button>
                </Box>
              }
              {this.state.is_cashout_enabled && this.state.my_player2_bet > 0 && this.state.is_player2_wins &&
                <Box>
                  <Heading.h2>Congratulations!</Heading.h2>
                  <Button width={1} onClick={this.cashOutPlayer2BetJS}>
                  Collect {this.state.my_player2_earnings} eth
                  </Button>
                </Box>
              }
              {this.state.player1_pot !== "0" && this.state.player2_pot !== "0" &&
                <BetChart player1_pot={this.state.player1_pot} player2_pot={this.state.player2_pot} player1_name={this.state.player1_name} player2_name={this.state.player2_name} />
              }
              {this.state.my_player1_bet <= 0 && this.state.my_player2_bet <= 0 && this.state.is_bets_open &&
                <Text>You still have no bets placed. Place your bet now and support your favorite player!</Text>
              }
              {this.state.is_bets_open &&
                <BetForm
                  contract={this.state.contract}
                  money_match_id={this.state.money_match_id}
                  web3={this.state.web3}
                  player1_name={this.state.player1_name}
                  player2_name={this.state.player2_name}
                  account={this.state.accounts[0]}
                  updateStats={this.updateStats}
                  bet_some_more_flag={(this.state.my_player1_bet > 0 || this.state.my_player2_bet > 0) && this.state.is_bets_open}
                />
              }
              {!this.state.is_bets_open && !this.state.is_cashout_enabled &&
                <Text>Bets are closed now, join and watch the show with us!</Text>
              }
              {!this.state.is_bets_open && this.state.is_cashout_enabled && this.state.my_player1_bet <= 0 && this.state.my_player2_bet <= 0 &&
                <Text>This money match just finished, stay tuned for the next one!</Text>
              }
              <Heading.h3>About this money match</Heading.h3>
              <Text>{this.state.summary}</Text>
              <Text>Hosted by&nbsp;
                <Link href={"https://3box.io/" + this.state.host_addr}>
                  {this.state.host_name}
                </Link>
              </Text>
              {this.state.is_host &&
                <HostControl
                contract={this.state.contract}
                money_match_id={this.state.money_match_id}
                account={this.state.accounts[0]}
                player1_name={this.state.player1_name}
                player2_name={this.state.player2_name}
                is_cashout_enabled={this.state.is_cashout_enabled}
                host_cut={this.state.host_cut}
                has_host_cashed_out={this.state.has_host_cashed_out}
                />
              }
              {this.state.is_player1 &&
                <Player1Control
                contract={this.state.contract}
                money_match_id={this.state.money_match_id}
                account={this.state.accounts[0]}
                is_player1_wins={this.state.is_player1_wins}
                player1_name={this.state.player1_name}
                is_cashout_enabled={this.state.is_cashout_enabled}
                winner_cut={this.state.winner_cut}
                has_player1_cashed_out={this.state.has_player1_cashed_out}
                />
              }
              {this.state.is_player2 &&
                <Box>
                  <Player2Control
                    contract={this.state.contract}
                    money_match_id={this.state.money_match_id}
                    account={this.state.accounts[0]}
                    is_player2_wins={this.state.is_player2_wins}
                    player2_name={this.state.player2_name}
                    is_cashout_enabled={this.state.is_cashout_enabled}
                    winner_cut={this.state.winner_cut}
                    has_player2_cashed_out={this.state.has_player2_cashed_out}
                  />
                </Box>
              }
            </Card>
            <Card>
              <Heading.h3>More money matches</Heading.h3>
              {otherMoneyMatches}
              <Link href="/host">
                Host a money match
              </Link>
            </Card>
          </Box>
        }
        {!this.state.web3 &&
          <Card>
            <Heading.h3>Connect your ethereum account</Heading.h3>
            <Text>Atomic Buster needs your permission to browse money matches.</Text>
            <Button onClick={this.connectToWeb3}>Connect</Button>
          </Card>
        }
      </Box>
    );
  }
}

export default App;
