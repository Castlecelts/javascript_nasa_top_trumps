const PubSub = require('../helpers/pub_sub.js');
const RequestHelper = require('../helpers/request_helper.js');
const Deck = require('./deck.js');


const Game = function () {
  this.currentPlayer = 1;
  this.deck = new Deck();
  this.cardsInPlay = null;
  this.winner = null;
  this.allowPlayerToChoose = true;
};

Game.prototype.bindEvents = function () {
  PubSub.subscribe('Deck:deck-loaded', () => {
    this.deck.getHandSizes();
    // getHandSizes publishes Deck:hand-sizes
  });

  PubSub.subscribe('StartButton:start-game', () => {
    this.startMatch();
    // startMatch pops 2 new cards into play
  });

  PubSub.subscribe('CardView:category-clicked', (event) => {
     if (this.allowPlayerToChoose === true) {
       const formattedKey = this.keyFormatter(event.detail);
       this.winner = this.compareCards(this.cardsInPlay, formattedKey);
       this.allowPlayerToChoose = false;
       PubSub.publish('Game:message', `Player 1 has selected ${event.detail}`);
       setTimeout(() => {
         PubSub.publish('Game:message', ``);
         PubSub.publish('Game:winner-determined', [this.winner, event.detail]);
         PubSub.publish("Game:reveal-both-cards", {});
       }, 2000)
     }
   });

  PubSub.subscribe('NextMatchButton:start-next-match', () => {
    this.deck.putCardsAtBackOfHands(this.winner);
    this.deck.getHandSizes();
    this.checkWinner();
    this.startMatch();
    // startMatch pops 2 new cards into play
    this.switchTurns();
    // switchTurns publishes Game:current-player-turn
  });

  PubSub.subscribe('Game:current-player-turn', () => {
    if (this.currentPlayer === 2) {
      PubSub.publish('Game:message', 'Player 2 thinking...');
      setTimeout(() => {
        this.computerTurn();
      }, 1500)

    }
  })
};

Game.prototype.populateDeck = function () {
  this.deck.getDeal();
};

Game.prototype.startMatch = function () {
  this.cardsInPlay = this.deck.popCardsForPlayers();
};

Game.prototype.keyFormatter = function (label) {
 const keys = {
   "Distance": "pl_orbsmax",
   "Orbit Period": "pl_orbper",
   "Radius": "pl_radj",
   "Mass": "pl_bmassj",
   "Planets": "pl_pnum",
 }
 return keys[label];
};

Game.prototype.reverseKeyFormatter = function (label) {
  const keys = {
    "pl_orbsmax": "Distance",
    "pl_orbper": "Orbit Period",
    "pl_radj": "Radius",
    "pl_bmassj": "Mass",
    "pl_pnum": "Planets",
  }
  return keys[label];
};

Game.prototype.computerTurn = function () {
  PubSub.publish('Game:message', "Player 2 selecting...");
  const categories = this.getCategories(this.cardsInPlay[0]);
  const randomCategory = this.randomCategory(categories);
  this.winner = this.compareCards(this.cardsInPlay, randomCategory);
  setTimeout(() => {
    PubSub.publish('Game:message', `Player 2 has selected ${this.reverseKeyFormatter(randomCategory)}`);
  }, 2000)
  setTimeout(() => {
    PubSub.publish('Game:winner-determined', [this.winner, this.reverseKeyFormatter(randomCategory)]);
    PubSub.publish("Game:reveal-both-cards", {});
    PubSub.publish('Game:message', "");
  }, 4000);
};

Game.prototype.getCategories = function (object) {
  const categories = Object.keys(object);
  return categories.slice(1,categories.length);
}; //pass in this.hands[0][0]

Game.prototype.randomCategory = function (categories) {
  const randomNumber = this.getRandomNumber(categories.length);
  return categories[randomNumber];
};

Game.prototype.getRandomNumber = function (maximum) {
  return Math.floor(Math.random() * Math.floor(maximum));
};

Game.prototype.compareCards = function (cards, category) {
  console.log(category);
  const winnerCard = []
  for (card of cards) {
    if (winnerCard.length === 0) {
      winnerCard.push(card);
    }
    else if (card[category] > winnerCard[0][category]) {
      winnerCard.pop();
      winnerCard.push(card);
    }
    else if (card[category] === winnerCard[0][category]) {
      return 0;
    }
  };
  return cards.indexOf(winnerCard[0])+1;
};


Game.prototype.checkWinner = function () {
  if (this.deck.hands[0].length === 0 && this.deck.hands[1].length !== 0) {
    PubSub.publish('Game:game-winner-determined', 'Computer wins!');
  }
  else if (this.deck.hands[1].length === 0 && this.deck.hands[0].length !== 0) {
    PubSub.publish('Game:game-winner-determined', 'Player wins!');
  }
  else if (this.deck.hands[1].length === 0 && this.deck.hands[0].length === 0) {
    PubSub.publish('Game:game-winner-determined', 'Draw! What are the chances?! (astronomical!)');
  }
};

Game.prototype.switchTurns = function () {
  if (this.currentPlayer === 1) {
    this.currentPlayer = 2;
  }
  else if (this.currentPlayer === 2) {
    this.currentPlayer = 1;
    this.allowPlayerToChoose = true;
  }
  PubSub.publish('Game:current-player-turn', this.currentPlayer);
};

module.exports = Game;
