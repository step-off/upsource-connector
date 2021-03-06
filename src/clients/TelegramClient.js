const ReviewsDBClient = require('./ReviewsDBClient');
const DataTransport = require('../services/DataTransport');
const Logger = require('../services/Logger');

class TelegramClient {
  constructor() {
    this.apiToken = process.env.TG_API_TOKEN;
    this.apiBaseUrl = `https://api.telegram.org/bot${this.apiToken}`;
    this.getUpdatesMethodName = `getUpdates`;
    this.sendMessageMethodName = `sendMessage`;
    this.startCommand = process.env.TG_BOT_START_COMMAND;
    this._processMessageSend = this._processMessageSend.bind(this);
    this._sendMessage = this._sendMessage.bind(this);
  }

  /**
   *
   * @param messages: string[]
   */
  async sendMessages(messages) {
    if (!messages || messages.length === 0) {
      return;
    }

    const updates = await this._getUpdates();
    const newChatsToNotify = this._getNewChatsToNotify(updates);
    await ReviewsDBClient.insertNewChatsToNotify(newChatsToNotify);

    await Promise.all(messages.map(this._sendMessage));
  }

  async _sendMessage(message) {
    if (!message) {
      return;
    }

    const chatsToNotify = await ReviewsDBClient.getChatsToNotify();
    return await Promise.all(chatsToNotify.map((chat) => this._processMessageSend(message, chat.id)));
  }

  /**
   * Gets bot updates from API. Updates are available in 24 hours.
   * To see Update contract, check out: https://core.telegram.org/bots/api#update
   * @returns {Promise<Update[]>}
   * @private
   */
  async _getUpdates() {
    const getUpdatesUrl = [this.apiBaseUrl, this.getUpdatesMethodName].join('/');
    try {
      const response = await DataTransport.get(getUpdatesUrl);
      return response.result;
    } catch (e) {
      Logger.error(`Error with getting bot updates: `, e);
    }
  }

  async getLastMessages() {
    const updates = await this._getUpdates();
    return updates.map((i) => (i.message ? i.message.text : '')).filter(Boolean);
  }

  /**
   * Returns new chats where start command where processed. To see Chat contract, check out:
   * https://core.telegram.org/bots/api#chat
   * @param updates
   * @returns {Chat[]}
   * @private
   */
  _getNewChatsToNotify(updates = []) {
    return updates
      .map((i) => {
        const messageText = i.message ? i.message.text : '';
        const isStartCommand = messageText === this.startCommand;
        return isStartCommand ? i.message.chat : null;
      })
      .filter(Boolean);
  }

  async _processMessageSend(message, chatId) {
    const sendMessageUrl = [this.apiBaseUrl, this.sendMessageMethodName].join('/');
    const sendMessageUrlWithParams = `${sendMessageUrl}`;

    try {
      await DataTransport.post(
        sendMessageUrlWithParams,
        {
          chat_id: chatId,
          text: message,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (e) {
      Logger.error(`Error with sending message: ${message}, chatId: ${chatId}. Error: `, e);
    }
  }
}

const instance = new TelegramClient();

module.exports = instance;
