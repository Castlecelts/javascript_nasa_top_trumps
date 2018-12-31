const PubSub = require('../helpers/pub_sub.js');

const WinnerView = function (container) {
  this.container = container;
};

WinnerView.prototype.render = function (winner) {
  this.container.innerHTML = '';
  const messageDiv = document.createElement("div");
  messageDiv.className = 'message';
  switch (winner[0]) {
    case 0:
      messageDiv.textContent = `Draw on ${winner[1]}!`;
      break;
    case 1:
      messageDiv.textContent = `Player 1 wins on ${winner[1]}!`;
      break;
    case 2:
      messageDiv.textContent = `Player 2 wins on ${winner[1]}!`;
      break;
  }
  this.container.appendChild(messageDiv);
};

WinnerView.prototype.bindEvents = function () {
  PubSub.subscribe("Game:winner-determined", (event) => {
    this.render(event.detail);
  })

  PubSub.subscribe("NextMatchButton:start-next-match", () => {
    this.container.textContent = '';
  })
};

module.exports = WinnerView;
