const ReviewsService = require('./ReviewsService');

class MessageService {
  /**
   * @param {reviews: ReviewDTO[], users: UserDTO[]}
   * @returns {string[]}
   */
  buildNewReviewsMsg({ reviews, users }) {
    return reviews.map((review) => {
      const reviewersUserIds = ReviewsService.getReviewersUserIds(review);
      const reviewUrl = ReviewsService.getReviewUrl(review);
      const reviewersToNotify = users.filter((i) => reviewersUserIds.includes(i.userId)).map((i) => i.telegramUsername);
      const hasReviewers = reviewersToNotify.length > 0;
      const isSingleReviewer = reviewersToNotify.length === 1;

      return hasReviewers
        ? `${reviewersToNotify.join(', ')} для ${isSingleReviewer ? 'тебя' : 'вас'} новое ревью: ${reviewUrl}`
        : '';
    });
  }

  /**
   * @param {reviews: ReviewDTO[], users: UserDTO[]}
   * @returns {string[]}
   */
  buildOutdatedReviewsMsg({ reviews, users }) {
    return reviews
      .map((review) => {
        const authorUserId = ReviewsService.getReviewAuthorUserId(review);
        const reviewUrl = ReviewsService.getReviewUrl(review);
        const userToNotify = users.find((i) => i.userId === authorUserId);

        if (!userToNotify || !userToNotify.telegramUsername) {
          return null;
        }
        const telegramUserToNotify = userToNotify.telegramUsername;

        return `${telegramUserToNotify}, твое ревью протухло: ${reviewUrl}`;
      })
      .filter(Boolean);
  }
}

const instance = new MessageService();

module.exports = instance;
