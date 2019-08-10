import React from "react";
import {
  Box,
  Button,
  Heading,
  Field,
  Text
} from "rimble-ui";

class HostControl extends React.Component {
  closeBetsJS = async () => {
    await this.props.contract.methods.closeBets(this.props.money_match_id).send({ from: this.props.account });
  };

  player1WinsJS = async () => {
    await this.props.contract.methods.player1Wins(this.props.money_match_id).send({ from: this.props.account });
  };

  player2WinsJS = async () => {
    await this.props.contract.methods.player2Wins(this.props.money_match_id).send({ from: this.props.account });
  };

  cashOutHostJS = async () => {
    await this.props.contract.methods.cashOutHost(this.props.money_match_id).send({ from: this.props.account });
  };
    
  render() {
    return (
      <Box maxWidth={'640px'} mx={'auto'} p={3}>
        <Heading.h2>Host Menu</Heading.h2>
        <Field width={1}>
          <Button required="true" onClick={this.closeBetsJS}>Close bets</Button>
        </Field>
        <Field width={1}>
          <Button required="true" onClick={this.player1WinsJS}>{this.props.player1_name} Wins!</Button>
        </Field>
        <Field width={1}>
          <Button required="true" onClick={this.player2WinsJS}>{this.props.player2_name} Wins!</Button>
        </Field>
        {!this.props.has_host_cashed_out && this.props.is_cashout_enabled &&
          <Field width={1}>
            <Button required="true" onClick={this.cashOutHostJS}>Collect {this.props.host_cut} eth</Button>
          </Field>
        }
        {this.props.has_host_cashed_out &&
          <Text>You collected {this.props.host_cut} eth</Text>
        }
      </Box>
    );
  }
}

export default HostControl;