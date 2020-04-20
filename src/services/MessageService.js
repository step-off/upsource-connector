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

      return `${telegramUsersToNotify.join(', ')} новое ревью для вас: ${reviewUrl}`;
    });
  }

  /**
   * @param reviews: ReviewDTO[]
   * @returns {string[]}
   */
  buildOutdatedReviewsMsg(reviews) {
    // TODO: implement
    return [];
  }
}

const instance = new MessageService();

module.exports = instance;
