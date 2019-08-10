import React from "react";
import { Box, Heading, Field, Input, Button } from "rimble-ui";

class HostControl extends React.Component {
  state = {
    player1_bet_amount: "",
    player2_bet_amount: ""
  };

  constructor(props) {
    super(props);

    this.handlePlayer1BetAmountChange = this.handlePlayer1BetAmountChange.bind(this);
    this.handlePlayer2BetAmountChange = this.handlePlayer2BetAmountChange.bind(this);
  }

  handlePlayer1BetAmountChange(event) {
    this.setState({player1_bet_amount: event.target.value});
  }

  handlePlayer2BetAmountChange(event) {
    this.setState({player2_bet_amount: event.target.value});
  }

  betPlayer1JS = async () => {
    await this.props.contract.methods.bet(
      this.props.money_match_id,
      "1"
    ).send({ from: this.props.account, value: this.props.web3.utils.toWei(this.state.player1_bet_amount, 'ether') });
    this.props.updateStats();
  };

  betPlayer2JS = async () => {
    await this.props.contract.methods.bet(
      this.props.money_match_id,
      "2"
    ).send({ from: this.props.account, value: this.props.web3.utils.toWei(this.state.player2_bet_amount, 'ether') });
    this.props.updateStats();
  };

  render() {
    return (
      <Box maxWidth={'640px'} mx={'auto'} p={3}>
        {this.props.bet_some_more_flag &&
          <Heading.h2>Bet some more?</Heading.h2>
        }
        {!this.props.bet_some_more_flag &&
          <Heading.h2>Place your bets!</Heading.h2>
        }
        <Field>
          <Input type="text" required={true} placeholder="e.g. 0.5" onChange={this.handlePlayer1BetAmountChange} />
        </Field>
        <Field>
          <Button width={1} required={true} onClick={this.betPlayer1JS}>Bet for {this.props.player1_name}</Button>
        </Field>
        <Field>
          <Input type="text" required={true} placeholder="e.g. 0.5" onChange={this.handlePlayer2BetAmountChange} />
        </Field>
        <Field>        
          <Button width={1} required={true} onClick={this.betPlayer2JS}>Bet for {this.props.player2_name}</Button>
        </Field>
      </Box>
    );
  }
}

export default HostControl;