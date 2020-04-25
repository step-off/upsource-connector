const MongoClient = require('mongodb').MongoClient;
const Logger = require('../services/Logger');

class ReviewsDBClient {
  constructor() {
    this.client = new MongoClient(process.env.DB_CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    this.dbName = 'xcom_reviews';
    this._openedReviewsCollectionName = 'xcom_opened_reviews';
    this._reviewsUsersCollectionName = 'xcom_reviews_users';
    this._notifyChatsCollectionName = 'notify_chats';
    this._reviewsUsersCache = null;
    this._isConnected = false;
    this._setCleanupHandler();
    this._connectionPromise = null;
    this._close = this._close.bind(this);
    this._connect();
  }

  async getOpenedReviews() {
    if (this._connectionPromise) {
      await this._connectionPromise;
    }
    if (!this._isConnected) {
      Logger.error(`Try to get opened reviews while there is no connection`);
      return [];
    }
    const db = this.client.db(this.dbName);
    const reviewsCollection = db.collection(this._openedReviewsCollectionName);
    return reviewsCollection.find({}).toArray();
  }

  async getReviewsUsers() {
    if (this._reviewsUsersCache && this._reviewsUsersCache.length > 0) {
      return this._reviewsUsersCache;
    }
    if (this._connectionPromise) {
      await this._connectionPromise;
    }
    if (!this._isConnected) {
      Logger.error(`Try to get reviews users while there is no connection`);
      return [];
    }

    const db = this.client.db(this.dbName);
    const usersCollection = db.collection(this._reviewsUsersCollectionName);
    this._reviewsUsersCache = usersCollection.find({}).toArray();
    return this._reviewsUsersCache;
  }

  async getChatsToNotify() {
    if (this._connectionPromise) {
      await this._connectionPromise;
    }
    if (!this._isConnected) {
      Logger.error(`Try to get chats while there is no connection`);
      return [];
    }

    const db = this.client.db(this.dbName);
    const notifyChatsCollection = db.collection(this._notifyChatsCollectionName);
    const chats = await notifyChatsCollection.find({}).toArray();
    return chats.filter((i) => !i.is_obsolete_for_review);
  }

  async insertNewChatsToNotify(chats) {
    if (this._isConnected && chats.length > 0) {
      const db = this.client.db(this.dbName);
      const chatsCollection = db.collection(this._notifyChatsCollectionName);
      const chatsInCollection = await chatsCollection.find({}).toArray();
      const existingChatsIds = chatsInCollection.map((i) => i.id);
      const newChats = chats.filter((i) => !existingChatsIds.includes(i.id));

      if (newChats.length === 0) {
        return;
      }

      try {
        await chatsCollection.insertMany(newChats);
      } catch (e) {
        Logger.error(`Unable to insert reviews: ${newChats}`, e);
      }
    }
  }

  async removeObsoleteReviews(reviews) {
    if (reviews.length === 0) {
      return;
    }
    if (!this._isConnected) {
      Logger.error('Trying to remove obsolete reviews while connection is closed.');
    }

    const db = this.client.db(this.dbName);
    const reviewsCollection = db.collection(this._openedReviewsCollectionName);
    try {
      await reviewsCollection.deleteMany({ _id: { $in: reviews.map((i) => i._id) } });
    } catch (e) {
      Logger.error(`Unable to remove reviews: ${reviews}`, e);
    }
  }

  async insertNewOpenedReviews(reviews) {
    if (reviews.length === 0) {
      return;
    }
    if (!this._isConnected) {
      Logger.error(`Unable to remove reviews: ${reviews}`);
    }
    const db = this.client.db(this.dbName);
    const reviewsCollection = db.collection(this._openedReviewsCollectionName);

    try {
      await reviewsCollection.insertMany(reviews);
    } catch (e) {
      Logger.error(`Unable to insert reviews: ${reviews}`);
    }
  }

  async _connect() {
    if (this._isConnected) {
      return;
    }
    try {
      Logger.log(`Connecting to database...`);

      this._connectionPromise = this.client.connect();
      await this._connectionPromise;
      this._isConnected = true;

      Logger.log(`Connected to database successfully!`);
    } catch (e) {
      Logger.error(`Could not to connect to database: `, e);
    } finally {
      this._connectionPromise = null;
    }
  }

  _setCleanupHandler() {
    process.on('exit', this._close);
    process.on('uncaughtException', this._close);
  }

  _close() {
    if (this.client) {
      this.client.close(true);
    }
  }
}

const instance = new ReviewsDBClient();

module.exports = instance;
