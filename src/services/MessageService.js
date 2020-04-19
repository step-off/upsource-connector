class MessageService {
  /**
   * @param reviews: ReviewDTO[]
   * @returns {string[]}
   */
  buildNewReviewsMsg(reviews) {
    // TODO: implement
    return [];
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
