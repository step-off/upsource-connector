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
      const telegramUsersToNotify = users
        .filter((i) => reviewersUserIds.includes(i.userId))
        .map((i) => i.telegramUsername);
      const isSingleReviewer = telegramUsersToNotify.length === 1;

      return `${telegramUsersToNotify.join(', ')} новое ревью для ${isSingleReviewer ? 'тебя' : 'вас'}: ${reviewUrl}`;
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
