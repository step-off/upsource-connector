const UpsourceClient = require('./clients/UpsourceClient');
const ReviewsDBClient = require('./clients/ReviewsDBClient');
const TelegramClient = require('./clients/TelegramClient');
const ReviewsService = require('./services/ReviewsService');
const MessageService = require('./services/MessageService');
const ReviewTaskScheduler = require('./services/ReviewTaskScheduler');

const WORK_INTERVAL = 1000 * 60; // One minute
let isWorkerRunning = false;

module.exports = async function () {
  ReviewTaskScheduler.scheduleOutdatedReviewsCheck();

  // TODO: Use scheduler instead of setInterval
  setInterval(async () => {
    if (!isWorkerRunning) {
      isWorkerRunning = true;
    } else {
      return;
    }

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

    isWorkerRunning = false;
  }, WORK_INTERVAL);
};
