const RoleInReviewEnum = require('../constants').RoleInReviewEnum;

const testUserId1 = '1';
const testUserId2 = '2';
const testUser1TelegramName = '@testUser1';
const testUser2TelegramName = '@testUser2';
const testReviewId = 'testReviewId';
const testReviewWithSingleReviewer = {
  reviewId: {
    reviewId: testReviewId,
  },
  participants: [
    {
      role: RoleInReviewEnum.Reviewer,
      userId: testUserId1,
    },
  ],
};
const testReviewWithSingleAuthor = {
  reviewId: {
    reviewId: testReviewId,
  },
  participants: [
    {
      role: RoleInReviewEnum.Author,
      userId: testUserId1,
    },
  ],
};
const testReviewWithMultipleReviewers = {
  reviewId: {
    reviewId: testReviewId,
  },
  participants: [
    {
      role: RoleInReviewEnum.Reviewer,
      userId: testUserId1,
    },
    {
      role: RoleInReviewEnum.Reviewer,
      userId: testUserId2,
    },
  ],
};
const testReviewWithoutParticipants = {
  reviewId: {
    reviewId: testReviewId,
  },
  participants: [],
};
const testReviewWithMultipleAuthors = {
  reviewId: {
    reviewId: testReviewId,
  },
  participants: [
    {
      role: RoleInReviewEnum.Author,
      userId: testUserId1,
    },
    {
      role: RoleInReviewEnum.Author,
      userId: testUserId2,
    },
  ],
};
const testUser1 = {
  userId: testUserId1,
  telegramUsername: testUser1TelegramName,
};
const testUser2 = {
  userId: testUserId2,
  telegramUsername: testUser2TelegramName,
};
const testReviewUrl = `https://upsource.skbkontur.ru/xcom/review/${testReviewId}`;

module.exports = {
  testReviewWithSingleReviewer,
  testReviewWithSingleAuthor,
  testReviewWithMultipleReviewers,
  testReviewWithMultipleAuthors,
  testReviewWithoutParticipants,
  testUser1,
  testUser2,
  testReviewUrl,
};
