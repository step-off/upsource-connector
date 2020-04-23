const RoleInReviewEnum = {
  Author: 1,
  Reviewer: 2,
  Watcher: 3,
};

/**
 * Works with reviews DTOs. To see review DTO description, check out:
 * https://upsource.jetbrains.com/~api_doc/reference/Projects.html#messages.ReviewDescriptorDTO
 */
class ReviewsService {
  constructor() {
    this.upsourceHostUrl = 'https://upsource.skbkontur.ru';
    this.projectName = 'xcom';
    this.reviewEndpoint = 'review';
  }
  getObsoleteReviews({ fromApi, fromDb }) {
    const fromApiReviewsIds = fromApi.map((i) => i.reviewId.reviewId);
    return fromDb.filter((i) => !fromApiReviewsIds.includes(i.reviewId.reviewId));
  }

  getNewOpenedReviews({ fromApi, fromDb }) {
    const fromDbReviewsIds = fromDb.map((i) => i.reviewId.reviewId);
    return fromApi.filter((i) => this._hasAssignedReviewers(i) && !fromDbReviewsIds.includes(i.reviewId.reviewId));
  }

  getOutdatedReviews(reviews) {
    return reviews.filter((i) => !!i.deadline && i.deadline < Date.now());
  }

  getReviewersUserIds(review) {
    return review.participants.filter((i) => i.role === RoleInReviewEnum.Reviewer).map((i) => i.userId);
  }

  getReviewAuthorUserId(review) {
    const author = review.participants.find((i) => i.role === RoleInReviewEnum.Author);
    if (author) {
      return author.userId;
    }
  }

  getReviewUrl(review) {
    return [this.upsourceHostUrl, this.projectName, this.reviewEndpoint, review.reviewId.reviewId].join('/');
  }

  _hasAssignedReviewers(review) {
    return review.participants.some((i) => i.role === RoleInReviewEnum.Reviewer);
  }
}

const instance = new ReviewsService();

module.exports = instance;
