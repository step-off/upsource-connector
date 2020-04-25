const ReviewTaskScheduler = require('./services/ReviewTaskScheduler');

module.exports = function () {
  ReviewTaskScheduler.scheduleOpenedReviewsCheck();
  ReviewTaskScheduler.scheduleOutdatedReviewsCheck();
};
