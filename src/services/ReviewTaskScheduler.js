const UpsourceClient = require('../clients/UpsourceClient');
const TelegramClient = require('../clients/TelegramClient');
const ReviewsDBClient = require('../clients/ReviewsDBClient');
const ReviewsService = require('./ReviewsService');
const MessageService = require('./MessageService');
const Scheduler = require('./Scheduler');
const Logger = require('./Logger');

class ReviewTaskScheduler {
  constructor() {
    this._checkOutdatedReviews = this._checkOutdatedReviews.bind(this);
    this._checkOpenedReviews = this._checkOpenedReviews.bind(this);
    this._notifyAboutOutdatedReviews = this._notifyAboutOutdatedReviews.bind(this);
    this._filterOutMentionedReviews = this._filterOutMentionedReviews.bind(this);
  }

  scheduleOutdatedReviewsCheck() {
    Logger.log('is about to schedule outdated reviews task');
    Scheduler.scheduleJob({
      cronTime: process.env.OUTDATED_REVIEWS_CRONTIME,
      onTick: this._checkOutdatedReviews,
      skipOnHoliday: true,
    });
  }

  scheduleOpenedReviewsCheck() {
    Logger.log('is about to schedule opened reviews task');
    Scheduler.scheduleJob({
      cronTime: process.env.OPENED_REVIEWS_CRONTIME,
      onTick: this._checkOpenedReviews,
      skipOnHoliday: true,
    });
  }

  async _checkOpenedReviews() {
    Logger.log('start opened reviews check');
    const openedReviewsFromAPI = await UpsourceClient.getOpenedReviews();
    const openedReviewsFromDb = await ReviewsDBClient.getOpenedReviews();
    const users = await ReviewsDBClient.getReviewsUsers();
    const obsoleteReviews = ReviewsService.getObsoleteReviews({
      fromApi: openedReviewsFromAPI,
      fromDb: openedReviewsFromDb,
    });
    const newOpenedReviews = ReviewsService.getNewOpenedReviews({
      fromApi: openedReviewsFromAPI,
      fromDb: openedReviewsFromDb,
    });

    await ReviewsDBClient.insertNewOpenedReviews(newOpenedReviews);
    await ReviewsDBClient.removeObsoleteReviews(obsoleteReviews);
    const lastMessages = await TelegramClient.getLastMessages();
    const notMentionedNewOpenedReviews = this._filterOutMentionedReviews(newOpenedReviews, lastMessages);

    const newReviewsMessages = MessageService.buildNewReviewsMessages({ reviews: notMentionedNewOpenedReviews, users });
    await TelegramClient.sendMessages(newReviewsMessages);
  }

  async _checkOutdatedReviews() {
    Logger.log('start outdated reviews check');
    const openedReviews = await UpsourceClient.getOpenedReviews();
    const users = await ReviewsDBClient.getReviewsUsers();
    const outdatedReviews = ReviewsService.getOutdatedReviews(openedReviews);
    if (outdatedReviews.length > 0) {
      this._notifyAboutOutdatedReviews(outdatedReviews, users);
    }
  }

  _notifyAboutOutdatedReviews(reviews, users) {
    Logger.log('is about to notify about outdated reviews: ');
    Logger.log(JSON.stringify(reviews.map((i) => i.reviewId.reviewId)));

    const messages = MessageService.buildOutdatedReviewsMessages({ reviews, users });
    TelegramClient.sendMessages(messages);
  }

  _filterOutMentionedReviews(reviews, lastMessages) {
    return reviews.filter((i) => {
      const reviewId = i.reviewId.reviewId;
      const reviewWasMentioned = lastMessages.some(
        (text) => reviewId && text.toLowerCase().includes(reviewId.toLowerCase())
      );

      if (reviewWasMentioned) {
        Logger.log(`Skip review ${reviewId} as it was mentioned`);
      }

      return !reviewWasMentioned;
    });
  }
}

const instance = new ReviewTaskScheduler();

module.exports = instance;
