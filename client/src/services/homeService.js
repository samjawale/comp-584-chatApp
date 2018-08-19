import Api from '@/services/api'

export default {
  fetchUserList (params) {
    return Api().post('getUserList', params)
  },
  fetchLastMsgs (params) {
    return Api().post('getLastMsgs', params)
  },
  fetchCurrentChat (params) {
    return Api().post('getCurrentChat', params)
  }
}
