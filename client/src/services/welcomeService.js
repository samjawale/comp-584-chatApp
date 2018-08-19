import Api from '@/services/api'

export default {
  authenticate (params) {
    return Api().post('signIn', params)
  },
  register (params) {
    return Api().post('signUp', params)
  }
}
