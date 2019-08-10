import React, { Component } from "react";
import {
    Box,
    Button,
    Heading,
    Text
  } from 'rimble-ui';

class Player2Control extends Component {
  cashOutPlayer2JS = async () => {
    await this.props.contract.methods.cashOutPlayer2(this.props.money_match_id).send({ from: this.props.account });
  };

  runExample = async () => {
  };

  render() {
    return (
      <Box maxWidth={'640px'} mx={'auto'} p={3}>
        <Heading.h3>{this.props.player2_name} menu</Heading.h3>
        {this.props.is_player2_wins &&
          <Box>
            <Heading.h3>You win!</Heading.h3>
            {!this.props.has_player2_cashed_out &&
              <Button onClick={this.cashOutPlayer2JS}>Collect {this.props.winner_cut} eth</Button>
            }
            {this.props.has_player2_cashed_out &&
              <Text>You collected {this.props.winner_cut} eth</Text>
            }
          </Box>
        }
        {!this.props.is_player2_wins && this.props.is_cashout_enabled &&
          <Box>
            <Heading.h3>You lose</Heading.h3>
          </Box>
        }
      </Box>
    );
  }
}

export default Player2Control;
