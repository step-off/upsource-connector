const CronJob = require('cron').CronJob;
const UpsourceClient = require('../clients/UpsourceClient');
const TelegramClient = require('../clients/TelegramClient');
const ReviewsDBClient = require('../clients/ReviewsDBClient');
const ReviewsService = require('./ReviewsService');
const MessageService = require('./MessageService');

class ReviewTaskScheduler {
  constructor() {
    this._checkOutdatedReviews = this._checkOutdatedReviews.bind(this);
    this._notifyAboutOutdatedReviews = this._notifyAboutOutdatedReviews.bind(this);
  }

  scheduleOutdatedReviewsCheck() {
    // NOTE: Schedules task to run every working day at 5AM GMT.
    new CronJob({
      cronTime: '0 5 * * 0-4',
      onTick: this._checkOutdatedReviews,
      start: true,
      timeZone: 'Etc/GMT',
    });
  }

  async _checkOutdatedReviews() {
    const openedReviews = await UpsourceClient.getOpenedReviews();
    const users = await ReviewsDBClient.getReviewsUsers();
    const outdatedReviews = ReviewsService.getOutdatedReviews(openedReviews);
    if (outdatedReviews.length > 0) {
      this._notifyAboutOutdatedReviews(outdatedReviews, users);
    }
  }

  _notifyAboutOutdatedReviews(reviews, users) {
    const messages = MessageService.buildOutdatedReviewsMsg({ reviews, users });
    TelegramClient.sendMessages(messages);
  }
}

const instance = new ReviewTaskScheduler();

module.exports = instance;
