const MessageService = require('../MessageService');
const testUser1 = require('./mocks').testUser1;
const testUser2 = require('./mocks').testUser2;
const testReviewUrl = require('./mocks').testReviewUrl;
const testReviewWithSingleReviewer = require('./mocks').testReviewWithSingleReviewer;
const testReviewWithSingleAuthor = require('./mocks').testReviewWithSingleAuthor;
const testReviewWithMultipleReviewers = require('./mocks').testReviewWithMultipleReviewers;
const testReviewWithMultipleAuthors = require('./mocks').testReviewWithMultipleAuthors;
const testReviewWithoutParticipants = require('./mocks').testReviewWithoutParticipants;

const testUsers = [testUser1, testUser2];

describe('MessageService', () => {
  test('should build correct message about new review for single reviewer', () => {
    const expectedMessages = [`${testUser1.telegramUsername}, для тебя новое ревью: ${testReviewUrl}`];
    const actualMessages = MessageService.buildNewReviewsMsg({
      reviews: [testReviewWithSingleReviewer],
      users: testUsers,
    });

    expect(actualMessages).toEqual(expectedMessages);
  });

  test('should build correct message about new review for multiple reviewers', () => {
    const expectedMessages = [
      `${testUser1.telegramUsername}, ${testUser2.telegramUsername}, для вас новое ревью: ${testReviewUrl}`,
    ];
    const actualMessages = MessageService.buildNewReviewsMsg({
      reviews: [testReviewWithMultipleReviewers],
      users: testUsers,
    });

    expect(actualMessages).toEqual(expectedMessages);
  });

  test('should build empty message about new review without reviewers', () => {
    const expectedMessages = [''];
    const actualMessages = MessageService.buildNewReviewsMsg({
      reviews: [testReviewWithoutParticipants],
      users: testUsers,
    });

    expect(actualMessages).toEqual(expectedMessages);
  });

  test('should build correct message about outdated review for single author', () => {
    const expectedMessages = [`${testUser1.telegramUsername}, твое ревью протухает: ${testReviewUrl}`];
    const actualMessages = MessageService.buildOutdatedReviewsMsg({
      reviews: [testReviewWithSingleAuthor],
      users: testUsers,
    });

    expect(actualMessages).toEqual(expectedMessages);
  });

  test('should build correct message about outdated review for multiple reviewers', () => {
    const expectedMessages = [
      `${testUser1.telegramUsername}, ${testUser2.telegramUsername}, ваше ревью протухает: ${testReviewUrl}`,
    ];
    const actualMessages = MessageService.buildOutdatedReviewsMsg({
      reviews: [testReviewWithMultipleAuthors],
      users: testUsers,
    });

    expect(actualMessages).toEqual(expectedMessages);
  });

  test('should build empty message about outdated review without authors', () => {
    const expectedMessages = [''];
    const actualMessages = MessageService.buildOutdatedReviewsMsg({
      reviews: [testReviewWithoutParticipants],
      users: testUsers,
    });

    expect(actualMessages).toEqual(expectedMessages);
  });
});
