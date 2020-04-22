const axios = require('axios');

class DataTransport {
  static async get(url, config) {
    let axiosResult;
    try {
      axiosResult = await axios.get(url, config);
    } catch (e) {
      console.error(`Error with GET request. Url: ${url}. Error: ${e}`);
      return null;
    }
    return axiosResult.data;
  }

  static async post(url, data, config) {
    let axiosResult;
    try {
      axiosResult = await axios.post(url, data, config);
    } catch (e) {
      console.error(`Error with POST request. Url: ${url}. Data: ${JSON.stringify(data)}. Error: ${e}`);
      return null;
    }
    return axiosResult.data;
  }
}

module.exports = DataTransport;
