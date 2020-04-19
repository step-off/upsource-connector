class TelegramClient {
  constructor(props) {
    this.botId = '';
  }

  sendMessage(message) {
    // TODO: implement
    if (message) {
      console.log(message);
    }
  }
}

const instance = new TelegramClient();

module.exports = instance;
