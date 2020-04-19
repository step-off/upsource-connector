const DataTransport = require('../services/DataTransport');

class UpsourceClient {
  constructor() {
    this.limit = 100;
    this.projectId = 'xcom';
    this.upsourceApiBaseUrl = 'https://upsource.skbkontur.ru/~rpc';
    this.defaultParams = { limit: this.limit, projectId: this.projectId };
    this.openedReviews = [];
  }

  async getOpenedReviews() {
    const upsourceMethodName = 'getReviews';
    const openedReviewsUrl = this.buildApiMethodUrl(upsourceMethodName);
    const data = await DataTransport.post(
      openedReviewsUrl,
      {
        ...this.defaultParams,
        query: 'state:open',
      },
      {
        headers: this.buildApiCallHeaders(),
      }
    );
    const result = data.result;

    if (result && result.reviews) {
      this.openedReviews = result.reviews;
      return result.reviews;
    }

    return [];
  }

  buildApiMethodUrl(methodName) {
    return `${this.upsourceApiBaseUrl}/${methodName}`;
  }

  buildApiCallHeaders() {
    return {
      Authorization: `Bearer ${process.env.UPSOURCE_TOKEN}`,
      'Content-Type': 'application/json',
    };
  }
}

const instance = new UpsourceClient();

module.exports = instance;
