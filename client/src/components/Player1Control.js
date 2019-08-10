import React, { Component } from "react";
import {
    Box,
    Button,
    Heading,
    Text
  } from 'rimble-ui';

class Player1Control extends Component {
  cashOutPlayer1JS = async () => {
    await this.props.contract.methods.cashOutPlayer1(this.props.money_match_id).send({ from: this.props.account });
  };

  runExample = async () => {
  };

  render() {
    return (
      <Box maxWidth={'640px'} mx={'auto'} p={3}>
        <Heading.h3>{this.props.player1_name} menu</Heading.h3>
        {this.props.is_player1_wins &&
          <Box>
            <Heading.h3>You win!</Heading.h3>
            {!this.props.has_player1_cashed_out &&
              <Button onClick={this.cashOutPlayer1JS}>Collect {this.props.winner_cut} eth</Button>
            }
            {this.props.has_player1_cashed_out &&
              <Text>You collected {this.props.winner_cut} eth</Text>
            }
          </Box>
        }
        {!this.props.is_player1_wins && this.props.is_cashout_enabled &&
          <Box>
            <Heading.h3>You lose</Heading.h3>
          </Box>
        }
      </Box>
    );
  }
}

export default Player1Control;
