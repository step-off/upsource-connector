const ReviewsService = require('./ReviewsService');

class MessageService {
  /**
   * @param {reviews: ReviewDTO[], users: UserDTO[]}
   * @returns {string[]}
   */
  buildNewReviewsMessages({ reviews, users }) {
    return reviews.map((review) => {
      const reviewersUserIds = ReviewsService.getReviewersUserIds(review);
      const reviewUrl = ReviewsService.getReviewUrl(review);
      const reviewersToNotify = users
        .filter((i) => reviewersUserIds.includes(i.userId))
        .map((i) => i.telegramUsername)
        .filter(Boolean);
      const hasReviewers = reviewersToNotify.length > 0;
      const isSingleReviewer = reviewersToNotify.length === 1;

      return hasReviewers
        ? `${reviewersToNotify.join(', ')}, для ${isSingleReviewer ? 'тебя' : 'вас'} новое ревью: ${reviewUrl}`
        : '';
    });
  }

  /**
   * @param {reviews: ReviewDTO[], users: UserDTO[]}
   * @returns {string[]}
   */
  buildOutdatedReviewsMessages({ reviews, users }) {
    return reviews.map((review) => {
      const authorUserIds = ReviewsService.getReviewAuthorsUserIds(review);
      const reviewUrl = ReviewsService.getReviewUrl(review);
      const authorsToNotify = users
        .filter((i) => authorUserIds.includes(i.userId))
        .map((i) => i.telegramUsername)
        .filter(Boolean);
      const hasAuthors = authorsToNotify.length > 0;
      const isSingleAuthor = authorsToNotify.length === 1;

      return hasAuthors
        ? `${authorsToNotify.join(', ')}, ${isSingleAuthor ? 'твое' : 'ваше'} ревью протухает: ${reviewUrl}`
        : '';
    });
  }
}

const instance = new MessageService();

module.exports = instance;
