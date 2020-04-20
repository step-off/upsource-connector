class TelegramClient {
  constructor(props) {
    this.botId = '';
  }

  async sendMessage(message) {
    // TODO: implement
    if (message) {
      console.log(message);
    }
  }

  /**
   *
   * @param messages: string[]
   */
  async sendBunchOfMessages(messages) {
    await Promise.all(messages.map(this.sendMessage));
  }
}

const instance = new TelegramClient();

module.exports = instance;
