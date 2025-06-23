const axios = require('axios').defaults

export default class AxiosServices {
  post(url, data, isRequiredHeader = false, header) {
    return axios.post(url, data, isRequiredHeader && header)
  }
}
