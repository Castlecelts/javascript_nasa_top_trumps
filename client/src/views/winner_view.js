const PubSub = require('../helpers/pub_sub.js');

const WinnerView = function (container) {
  this.container = container;
  this.selectedCategory = null;
};

WinnerView.prototype.bindEvents = function () {
  PubSub.subscribe("Game:winner-determined", (event) => {
    const winner = parseInt(event.detail);
    this.render(winner);
  })

  PubSub.subscribe('Game:winner-determined-category-detail', (event) => {
    this.selectedCategory = event.detail;
  })
};

WinnerView.prototype.render = function (winner) {
  this.container.innerHTML = '';
  const messageDiv = document.createElement("div");
  messageDiv.className = 'message';
  switch (winner) {
    case 0:
      messageDiv.textContent = `Draw on category ${this.selectedCategory}!`;
      break;
    case 1:
      messageDiv.textContent = `Player 1 Wins on category ${this.selectedCategory}!`;
      break;
    case 2:
      messageDiv.textContent = `Player 2 wins on category ${this.selectedCategory}!`;
      break;
  }
  this.container.appendChild(messageDiv);
};

module.exports = WinnerView;
