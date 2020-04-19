const MongoClient = require('mongodb').MongoClient;

class ReviewsDBClient {
  constructor() {
    this.client = new MongoClient(process.env.DB_CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    this.dbName = 'xcom_reviews';
    this._reviewsUsersCache = null;
    this._isConnected = false;
    this._setCleanupHandler();
  }

  async getOpenedReviews() {
    try {
      await this._connect();
    } catch (e) {
      console.error(`Unable to connect to database:`, e);
      return [];
    }
    const db = this.client.db(this.dbName);
    const reviewsCollection = db.collection('xcom_opened_reviews');
    return reviewsCollection.find({}).toArray();
  }

  async getReviewsUsers() {
    if (this._reviewsUsersCache && this._reviewsUsersCache.length > 0) {
      return this._reviewsUsersCache;
    }
    try {
      await this._connect();
    } catch (e) {
      return [];
    }
    const db = this.client.db(this.dbName);
    const usersCollection = db.collection('xcom_reviews_users');
    this._reviewsUsersCache = usersCollection.find({}).toArray();
    return this._reviewsUsersCache;
  }

  async removeObsoleteReviews(reviews) {
    if (reviews.length === 0) {
      return;
    }
    if (!this._isConnected) {
      console.error('Trying to remove obsolete reviews while connection is closed.');
    }

    const db = this.client.db(this.dbName);
    const reviewsCollection = db.collection('xcom_opened_reviews');
    try {
      await reviewsCollection.deleteMany({ _id: { $in: reviews.map((i) => i._id) } });
    } catch (e) {
      console.error(`Unable to remove reviews: ${reviews}`, e);
    }
  }

  async insertNewOpenedReviews(reviews) {
    if (reviews.length === 0) {
      return;
    }
    if (!this._isConnected) {
      console.error('Try to insert reviews while connection is closed.');
    }
    const db = this.client.db(this.dbName);
    const reviewsCollection = db.collection('xcom_opened_reviews');

    try {
      await reviewsCollection.insertMany(reviews);
    } catch (e) {
      console.error(`Unable to insert reviews: ${reviews}`, e);
    }
  }

  async _connect() {
    if (this._isConnected) {
      return;
    }
    try {
      await this.client.connect();
      this._isConnected = true;
    } catch (e) {
      console.log(`Could not to connect to database`);
      console.log(e);
    }
  }

  _setCleanupHandler() {
    process.on('exit', this._close);
    process.on('uncaughtException', this._close);
  }

  _close() {
    this.client.close(true);
  }
}

const instance = new ReviewsDBClient();

module.exports = instance;
