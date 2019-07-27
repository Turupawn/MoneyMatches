pragma solidity ^0.5.0;
import "client/node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract SimpleStorage {
  using SafeMath for uint256;

  // Structs
  struct MoneyMatch
  {
    address host_addr;
    MoneyMatchState state;
    uint256 player1_pot;
    uint256 player2_pot;
    address player1_address;
    address player2_address;
  }

  // Enums
  enum MoneyMatchState { BetsOpen, BetsClosed, Finished }
  mapping(uint256 => MoneyMatch) public money_matches; // Stores money matches data
  uint256 public money_match_count; // Helps generating a new money match id
  mapping(uint256 => mapping(address => uint256)) public player1_bets; // maps[money match][bettor][bet]
  mapping(uint256 => mapping(address => uint256)) public player2_bets; // maps[money match][bettor][bet]

  function getPlayer1Pot(uint256 money_match_id) public view returns (uint) {
    return money_matches[money_match_id].player1_pot;
  }

  function getPlayer2Pot(uint256 money_match_id) public view returns (uint) {
    return money_matches[money_match_id].player2_pot;
  }

  function getMyPlayer1Bet(uint256 money_match_id, address bettor) public view returns (uint) {
    return player1_bets[money_match_id][bettor];
  }

  function getMyPlayer2Bet(uint256 money_match_id, address bettor) public view returns (uint) {
    return player2_bets[money_match_id][bettor];
  }

  function createMoneyMatch (address player1_address, address player2_address) public {
    money_match_count += 1;
    money_matches[money_match_count] = MoneyMatch(msg.sender, MoneyMatchState.BetsOpen, 0, 0, player1_address, player2_address);
  }

  function bet(uint256 money_match_id, uint256 bet_amount, uint8 player) public payable {
    if(player == 1)
    {
      player1_bets[money_match_id][msg.sender] = player1_bets[money_match_id][msg.sender].add(bet_amount);
      money_matches[money_match_id].player1_pot = money_matches[money_match_id].player1_pot.add(bet_amount);
    }
    if(player == 2)
    {
      player2_bets[money_match_id][msg.sender] = player2_bets[money_match_id][msg.sender].add(bet_amount);
      money_matches[money_match_id].player2_pot = money_matches[money_match_id].player2_pot.add(bet_amount);
    }
  }

  function cashOut(uint256 money_match_id) public {
    msg.sender.transfer(1 ether);
  }

  function closeBets(uint256 money_match_id) public {
    money_matches[money_match_id].state = MoneyMatchState.BetsClosed;
  }

  function finish(uint256 money_match_id) public {
    money_matches[money_match_id].state = MoneyMatchState.Finished;
  }
}
