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
  }

  scheduleOutdatedReviewsCheck() {
    Logger.log('is about to schedule outdated reviews task');
    // NOTE: Schedules task to run every working day at 5AM GMT.
    Scheduler.scheduleJob({
      cronTime: '0 5 * * 0-6', // TODO: change days interval after testing
      onTick: this._checkOutdatedReviews,
    });
  }

  scheduleOpenedReviewsCheck() {
    Logger.log('is about to schedule opened reviews task');
    // NOTE: Schedules task to run every 3 minutes at working day.
    Scheduler.scheduleJob({
      cronTime: '*/3 * * * 0-6', // TODO: change days interval after testing
      onTick: this._checkOpenedReviews,
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

    const newReviewsMessages = MessageService.buildNewReviewsMsg({ reviews: newOpenedReviews, users });
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
    Logger.log(JSON.stringify(reviews));

    const messages = MessageService.buildOutdatedReviewsMsg({ reviews, users });
    TelegramClient.sendMessages(messages);
  }
}

const instance = new ReviewTaskScheduler();

module.exports = instance;
