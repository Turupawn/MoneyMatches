pragma solidity ^0.5.0;
import "client/node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract SimpleStorage {
  using SafeMath for uint256;

  // Structs
  struct MoneyMatch
  {
    MoneyMatchState state;
    uint256 player1_pot;
    uint256 player2_pot;
    address host_addr;
    address player1_addr;
    address player2_addr;
    uint8 host_cut_percentage;
    uint8 winner_cut_percentage;
  }

  // Events
  event MoneyMatchCreated
  (
    address host_addr,
    address player1_addr,
    address player2_addr,
    uint8 host_cut_percentage,
    uint8 winner_cut_percentage
  );

  event BetSubmitted
  (
    uint256 money_match_id,
    address bettor,
    uint256 amount,
    uint8 player
  );

  event BetCashout
  (
    uint256 money_match_id,
    address bettor,
    uint256 amount,
    uint8 player
  );

  event HostCashout
  (
    uint256 money_match_id,
    address host_addr,
    uint256 amount
  );

  event PlayerCashout
  (
    uint256 money_match_id,
    address player_addr,
    uint8 player,
    uint256 amount
  );

  event BetsClosed
  (
    uint256 money_match_id
  );

  event MoneyMatchFinished
  (
    uint256 money_match_id,
    uint8 player_won
  );

  // Enums
  enum MoneyMatchState { Undefined, BetsOpen, BetsClosed, Player1Wins, Player2Wins }
  mapping(uint256 => MoneyMatch) public money_matches; // Stores money matches data
  uint256 public money_match_count; // Helps generating a new money match id
  mapping(uint256 => mapping(address => uint256)) public player1_bets; // maps[money match][bettor][bet]
  mapping(uint256 => mapping(address => uint256)) public player2_bets; // maps[money match][bettor][bet]
  mapping(uint256 => mapping(address => bool)) public has_cashed_out_player1_bet; // Helps preventing double cash out
  mapping(uint256 => mapping(address => bool)) public has_cashed_out_player2_bet; // maps[money_match_id][has_cashed_out]
  mapping(uint256 => bool) public host_has_cashed_out; // maps[money_match_id][has_cashed_out]
  mapping(uint256 => bool) public player1_has_cashed_out;
  mapping(uint256 => bool) public player2_has_cashed_out;

  // Read only functions
  function getPlayer1Pot(uint256 money_match_id) public view returns (uint) {
    return money_matches[money_match_id].player1_pot;
  }

  function getPlayer2Pot(uint256 money_match_id) public view returns (uint) {
    return money_matches[money_match_id].player2_pot;
  }

  function getCutFreePot(uint256 money_match_id) public view returns (uint) {
    uint256 total_pot = money_matches[money_match_id].player1_pot.
                        add(money_matches[money_match_id].player2_pot);
    uint256 host_cut = total_pot.
                        mul(money_matches[money_match_id].host_cut_percentage).
                        div(100);
    uint256 winner_cut = total_pot.
                        mul(money_matches[money_match_id].winner_cut_percentage).
                        div(100);
    return total_pot.sub(host_cut).sub(winner_cut);
  }

  function getPlayer1BetByAddress(uint256 money_match_id, address bettor) public view returns (uint) {
    return player1_bets[money_match_id][bettor];
  }

  function getPlayer2BetByAddress(uint256 money_match_id, address bettor) public view returns (uint) {
    return player2_bets[money_match_id][bettor];
  }

  function getHostCutPercentage(uint256 money_match_id) public view returns (uint) {
    return money_matches[money_match_id].host_cut_percentage;
  }

  function getWinnerCutPercentage(uint256 money_match_id) public view returns (uint) {
    return money_matches[money_match_id].winner_cut_percentage;
  }

  function getHostCut(uint256 money_match_id) public view returns (uint) {
    uint256 total_pot = getPlayer1Pot(money_match_id).add(getPlayer2Pot(money_match_id));
    return total_pot.mul(getHostCutPercentage(money_match_id)).div(100);
  }

  function getWinnerCut(uint256 money_match_id) public view returns (uint) {
    uint256 total_pot = getPlayer1Pot(money_match_id).add(getPlayer2Pot(money_match_id));
    return total_pot.mul(getWinnerCutPercentage(money_match_id)).div(100);
  }

  function isBetsOpen(uint256 money_match_id) public view returns (bool) {
    return money_matches[money_match_id].state == MoneyMatchState.BetsOpen;
  }

  function isCashoutEnabled(uint256 money_match_id) public view returns (bool) {
    return money_matches[money_match_id].state == MoneyMatchState.Player1Wins ||
            money_matches[money_match_id].state == MoneyMatchState.Player2Wins;
  }

  function isPlayer1Wins(uint256 money_match_id) public view returns (bool) {
    return money_matches[money_match_id].state == MoneyMatchState.Player1Wins;
  }

  function isPlayer2Wins(uint256 money_match_id) public view returns (bool) {
    return money_matches[money_match_id].state == MoneyMatchState.Player2Wins;
  }

  // Modifiers
  modifier betsAreOpen(uint256 money_match_id) {
    require(isBetsOpen(money_match_id), "Bets are currently closed for the selected money match.");
    _;
  }

  modifier cashoutIsEnabled(uint256 money_match_id) {
    require(isCashoutEnabled(money_match_id), "Cashout is currently closed for the selected money match.");
    _;
  }

  modifier player1Won(uint256 money_match_id) {
    require(isPlayer1Wins(money_match_id), "Player 1 has not won.");
    _;
  }

  modifier player2Won(uint256 money_match_id) {
    require(isPlayer2Wins(money_match_id), "Player 2 has not won.");
    _;
  }

  modifier playerIsValid(uint8 player) {
    require(player == 1 || player == 2, "Player selected is invalid, please 1 or 2.");
    _;
  }

  modifier hasNotCashedOutPlayer1Bet(uint256 money_match_id)
  {
    require(!has_cashed_out_player1_bet[money_match_id][msg.sender], "Bettor has already cashed out his player 1 bet");
    _;
  }

  modifier hasNotCashedOutPlayer2Bet(uint256 money_match_id)
  {
    require(!has_cashed_out_player2_bet[money_match_id][msg.sender], "Bettor has already cashed out his player 2 bet");
    _;
  }

  modifier hostHasNotCashedOut(uint256 money_match_id)
  {
    require(!host_has_cashed_out[money_match_id], "Host has already cashed out");
    _;
  }

  modifier player1HasNotCashedOut(uint256 money_match_id)
  {
    require(!player1_has_cashed_out[money_match_id], "Player 1 has already cashed out");
    _;
  }

  modifier player2HasNotCashedOut(uint256 money_match_id)
  {
    require(!player2_has_cashed_out[money_match_id], "Player 2 has already cashed out");
    _;
  }

  modifier hasBettedForPlayer1(uint256 money_match_id)
  {
    require(getPlayer1BetByAddress(money_match_id, msg.sender) > 0, "You have no bets placed for player 1");
    _;
  }

  modifier hasBettedForPlayer2(uint256 money_match_id)
  {
    require(getPlayer2BetByAddress(money_match_id, msg.sender) > 0, "You have no bets placed for player 2");
    _;
  }

  modifier isHost(uint256 money_match_id)
  {
    require(money_matches[money_match_id].host_addr == msg.sender, "You have not the host of this money match");
    _;
  }

  modifier isPlayer1(uint256 money_match_id)
  {
    require(money_matches[money_match_id].player1_addr == msg.sender, "You have not the player 1 of this money match");
    _;
  }

  modifier isPlayer2(uint256 money_match_id)
  {
    require(money_matches[money_match_id].player2_addr == msg.sender, "You have not the player 2 of this money match");
    _;
  }

  // Write functions
  function createMoneyMatch (
    address player1_addr,
    address player2_addr,
    uint8 host_cut_percentage,
    uint8 winner_cut_percentage
  ) public {
    money_match_count = money_match_count.add(1);
    money_matches[money_match_count] = MoneyMatch(MoneyMatchState.BetsOpen,
      0,
      0,
      msg.sender,
      player1_addr,
      player2_addr,
      host_cut_percentage,
      winner_cut_percentage);

    emit MoneyMatchCreated (
      msg.sender,
      player1_addr,
      player2_addr,
      host_cut_percentage,
      winner_cut_percentage
    );
  }

  function bet(
    uint256 money_match_id,
    uint256 bet_amount,
    uint8 player
  ) public payable
    betsAreOpen(money_match_id)
    playerIsValid(player)
  {
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

    emit BetSubmitted (
      money_match_id,
      msg.sender,
      bet_amount,
      player
    );
  }

  function cashOutPlayer1Bet(
    uint256 money_match_id
  ) public
    cashoutIsEnabled(money_match_id)
    hasNotCashedOutPlayer1Bet(money_match_id)
    hasBettedForPlayer1(money_match_id)
    player1Won(money_match_id)
  {
    uint256 cut_free_pot = getCutFreePot(money_match_id);
    uint256 my_cashout = cut_free_pot.mul(getPlayer1BetByAddress(money_match_id, msg.sender)).div(getPlayer1Pot(money_match_id));
    msg.sender.transfer(my_cashout);
    has_cashed_out_player1_bet[money_match_id][msg.sender] = true;

    emit BetCashout (
      money_match_id,
      msg.sender,
      my_cashout,
      1
    );
  }

  function cashOutPlayer2Bet(
    uint256 money_match_id
  ) public
    cashoutIsEnabled(money_match_id)
    hasNotCashedOutPlayer2Bet(money_match_id)
    hasBettedForPlayer2(money_match_id)
    player2Won(money_match_id)
  {
    uint256 cut_free_pot = getCutFreePot(money_match_id);
    uint256 my_cashout = cut_free_pot.mul(getPlayer2BetByAddress(money_match_id, msg.sender)).div(getPlayer2Pot(money_match_id));
    msg.sender.transfer(my_cashout);
    has_cashed_out_player2_bet[money_match_id][msg.sender] = true;

    emit BetCashout (
      money_match_id,
      msg.sender,
      my_cashout,
      2
    );
  }

  function cashOutHost(
    uint256 money_match_id
  ) public
    cashoutIsEnabled(money_match_id)
    hostHasNotCashedOut(money_match_id)
    isHost(money_match_id)
  {
    uint256 my_cashout = getHostCut(money_match_id);
    msg.sender.transfer(my_cashout);
    host_has_cashed_out[money_match_id] = true;

    emit HostCashout
    (
      money_match_id,
      msg.sender,
      my_cashout
    );
  }

  function cashOutPlayer1(
    uint256 money_match_id
  ) public
    cashoutIsEnabled(money_match_id)
    player1HasNotCashedOut(money_match_id)
    isPlayer1(money_match_id)
    player1Won(money_match_id)
  {
    uint256 my_cashout = getWinnerCut(money_match_id);
    msg.sender.transfer(my_cashout);
    player1_has_cashed_out[money_match_id] = true;

    emit PlayerCashout (
      money_match_id,
      msg.sender,
      1,
      my_cashout
    );
  }

  function cashOutPlayer2(
    uint256 money_match_id
  ) public
    cashoutIsEnabled(money_match_id)
    player2HasNotCashedOut(money_match_id)
    isPlayer2(money_match_id)
    player2Won(money_match_id)
  {
    uint256 my_cashout = getWinnerCut(money_match_id);
    msg.sender.transfer(my_cashout);
    player2_has_cashed_out[money_match_id] = true;

    emit PlayerCashout (
      money_match_id,
      msg.sender,
      2,
      my_cashout
    );
  }

  function closeBets(uint256 money_match_id) public isHost(money_match_id) {
    money_matches[money_match_id].state = MoneyMatchState.BetsClosed;

    emit BetsClosed (
      money_match_id
    );
  }

  function player1Wins(uint256 money_match_id) public isHost(money_match_id) {
    money_matches[money_match_id].state = MoneyMatchState.Player1Wins;

    emit MoneyMatchFinished (
      money_match_id,
      1
    );
  }

  function player2Wins(uint256 money_match_id) public isHost(money_match_id) {
    money_matches[money_match_id].state = MoneyMatchState.Player2Wins;

    emit MoneyMatchFinished (
      money_match_id,
      2
    );
  }
}
