const PubSub = require('../helpers/pub_sub.js');
const CardView = require('./card_view.js');

const CardGridView = function (container){
  this.container = container;
  this.currentMatchCards = [];
};

CardGridView.prototype.bindEvents = function () {
  PubSub.subscribe('Deck:drawn-cards', (event) => {
    this.clearGrid();
    this.renderCards(event.detail,1);
    this.currentMatchCards = event.detail;
  });
  PubSub.subscribe('Game:reveal-both-cards', (event) => {
    // reveal both cards
    this.clearGrid();
    this.revealCards(this.currentMatchCards);
  });
  PubSub.subscribe('Game:switch-to-player', (event) => {
    // we know who is next up. If it's player1,
    // hide player2 card, otherwise show both.
    const new_player = event.detail; // 1 or 2
    this.clearGrid();
    this.renderCards(this.currentMatchCards, new_player);
  });
};

CardGridView.prototype.clearGrid = function () {
  this.container.innerHTML = '';
};

CardGridView.prototype.revealCards = function (cards) {
  // show both cards
  cards.forEach((card) => {
    const cardItem = this.createCardItem(card);
    this.container.appendChild(cardItem);
  });
};

CardGridView.prototype.renderCards = function (cards, currentPlayer) {
  cards.forEach((card, index, array) => {
    const cardItem = this.createCardItem(card);
    // if card index (1=left,2=right) doesn't match current player
    // then mark card to be hidden
    if (index+1 != currentPlayer) {
      cardItem.classList.add("back");
    }
    this.container.appendChild(cardItem);
  });
};

CardGridView.prototype.createCardItem = function (card) {
  const cardView = new CardView();
  const cardItem = cardView.renderCardDetails(card);
  return cardItem;
};


module.exports = CardGridView;
