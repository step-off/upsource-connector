const UpsourceClient = require('./clients/UpsourceClient');
const ReviewsDBClient = require('./clients/ReviewsDBClient');
const TelegramClient = require('./clients/TelegramClient');
const ReviewsService = require('./services/ReviewsService');
const MessageService = require('./services/MessageService');

const ONE_MINUTE_INTERVAL = 1000 * 60;
let isWorkerRunning = false;

module.exports = async function () {
  // TODO: set repeated task to check outdated reviews
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
    TelegramClient.sendBunchOfMessages(newReviewsMessages);

    isWorkerRunning = false;
  }, ONE_MINUTE_INTERVAL);
};
