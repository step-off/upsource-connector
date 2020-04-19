const UpsourceClient = require('./clients/UpsourceClient');
const ReviewsDBClient = require('./clients/ReviewsDBClient');
const ReviewsService = require('./services/ReviewsService');

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

    isWorkerRunning = false;
  }, ONE_MINUTE_INTERVAL);
};
