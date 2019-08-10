import React, { Component } from "react";
import SimpleStorageContract from "./contracts/SimpleStorage.json";
import getWeb3 from "./utils/getWeb3";
import ipfs from './ipfs'
import { Input, Heading, Box, Button, Field } from "rimble-ui";

class Admin extends Component {
  state = { money_match_id: "1", // Hardcoded preset
            address_player1: "",
            address_player2: "",
            host_cut_percentage: "",
            winner_cut_percentage: "",
            player1_name: "",
            player2_name: "",
            summary: "",
            image_buffer: null,
            image_ipfs_hash: "",
            web3: null, accounts: null, contract: null };

  constructor(props) {
    super(props);

    this.handleAddressPlayer1Change = this.handleAddressPlayer1Change.bind(this);
    this.handleAddressPlayer2Change = this.handleAddressPlayer2Change.bind(this);
    this.handleHostCutPercentageChange = this.handleHostCutPercentageChange.bind(this);
    this.handleWinnerCutPercentageChange = this.handleWinnerCutPercentageChange.bind(this);
    this.handlePlayer1NameChange = this.handlePlayer1NameChange.bind(this);
    this.handlePlayer2NameChange = this.handlePlayer2NameChange.bind(this);
    this.handleSummaryChange = this.handleSummaryChange.bind(this);
    this.handleImageChange = this.handleImageChange.bind(this);
  }
  
  handlePlayer1NameChange(event) {
    this.setState({ player1_name: this.state.web3.utils.utf8ToHex(event.target.value) });
  }
  handlePlayer2NameChange(event) {
    this.setState({ player2_name: this.state.web3.utils.utf8ToHex(event.target.value) });
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

  handleSummaryChange(event) {
    this.setState({summary: event.target.value });
  }

  handleImageChange(event) {
    const file = event.target.files[0];
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () => {
      this.setState({ image_buffer: Buffer(reader.result) });
    }
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

    await ipfs.files.add(this.state.image_buffer, (error, result) => {
      if(error) {
        console.log(error);
        return;
      }
      this.setState({ image_ipfs_hash: result[0].hash });
      //console.log(this.state.image_ipfs_hash);

      contract.methods.createMoneyMatch(
        this.state.player1_name,
        this.state.player2_name,
        this.state.address_player1,
        this.state.address_player2,
        this.state.winner_cut_percentage,
        this.state.host_cut_percentage,
        this.state.summary,
        this.state.image_ipfs_hash).send({ from: accounts[0] });
    });
  };

  runExample = async () => {
  };

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <Box maxWidth={'640px'} mx={'auto'} p={3}>
        <Heading>Create money match</Heading>
        <Field label="Player 1 name">
          <Input type="text" required={true} placeholder="e.g. Daigo" onChange={this.handlePlayer1NameChange} />
        </Field>
        <Field label="Player 2 name">
          <Input type="text" required={true} placeholder="e.g. Uncle Valle" onChange={this.handlePlayer2NameChange} />
        </Field>
        <Field label="Player 1 address">
          <Input type="text" required={true} placeholder="e.g. 0x730bF3B67090511A64ABA060FbD2F7903536321E" onChange={this.handleAddressPlayer1Change} />
        </Field>
        <Field label="Player 2 address">
          <Input type="text" required={true} placeholder="e.g. 0x730bF3B67090511A64ABA060FbD2F7903536321E" onChange={this.handleAddressPlayer2Change} />
        </Field>
        <Field label="Host cut percentage">
          <Input type="text" required={true} placeholder="e.g. 3" onChange={this.handleHostCutPercentageChange} />
        </Field>
        <Field label="Winner cut percentage">
          <Input type="text" required={true} placeholder="e.g. 10" value={this.state.winner_cut_percentage} onChange={this.handleWinnerCutPercentageChange} />
        </Field>
        <Field label="Summary">
          <Input type="text" required={true} placeholder="e.g. 14/2 8PM GMT @ twitch.com/evo" onChange={this.handleSummaryChange} />
        </Field>
        <Field label="Image">
          <input type="file" required={true} onChange={this.handleImageChange} />
        </Field>
        <Button onClick={this.createMoneyMatchJS}>Create</Button>
      </Box>
    );
  }
}

export default Admin;
