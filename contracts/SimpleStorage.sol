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

  struct Bettor
  {
    address addr;
    uint256 bet;
    uint8 player;
  }

  // Enums
  enum MoneyMatchState { BetsOpen, BetsClosed, Finished }
  mapping(uint256 => MoneyMatch) public money_matches; // Stores money matches data
  uint256 public money_match_count; // Helps generating a new money match id
  mapping(uint256 => mapping(address => Bettor)) public money_match_bettors; // Stores bettors data

  uint storedData;

  function set(uint x) public {
    storedData = x;
  }

  function get() public view returns (uint) {
    return storedData;
  }

  function createMoneyMatch (address player1_address, address player2_address) public {
    money_match_count += 1;
    money_matches[money_match_count] = MoneyMatch(msg.sender, MoneyMatchState.BetsOpen, 0, 0, player1_address, player2_address);
  }

  function bet(uint256 money_match_id, uint256 bet_amount, uint8 player) public payable {
    Bettor memory bettor = Bettor(msg.sender, bet_amount, player);
    money_match_bettors[money_match_id][msg.sender] = bettor;
    if(player == 1)
      money_matches[money_match_id].player1_pot = money_matches[money_match_id].player1_pot.add(bet_amount);
    if(player == 2)
      money_matches[money_match_id].player2_pot = money_matches[money_match_id].player2_pot.add(bet_amount);
  }

  function cashOut(uint256 money_match_id) public {
    msg.sender.transfer(1);
  }

  function closeBets(uint256 money_match_id) public {
    money_matches[money_match_id].state = MoneyMatchState.BetsClosed;
  }

  function finish(uint256 money_match_id) public {
    money_matches[money_match_id].state = MoneyMatchState.Finished;
  }
}
