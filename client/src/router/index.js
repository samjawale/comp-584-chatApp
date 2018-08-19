import Vue from 'vue'
import Router from 'vue-router'
import VueSession from 'vue-session'

import Welcome from '@/components/Welcome'
import Home from '@/components/Home'

Vue.use(Router)
Vue.use(VueSession)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Welcome',
      component: Welcome
    },
    {
      path: '/home',
      name: 'Home',
      component: Home
    }
  ]
})
