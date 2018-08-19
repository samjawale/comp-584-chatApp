<template>
  <div id="welcome">
    <div id="sign_in_div">
      <fieldset>
        <legend><h2>Sign In</h2></legend>
        <input type="email" v-model="sign_in_email" placeholder="Enter email" />
        <br/>
        <input type="password" v-model="sign_in_pwd" placeholder="Enter password" />
        <br/>
        <button @click="auth">Sign In</button>
      </fieldset>
    </div>

    <div id="sign_up_div">
      <fieldset>
        <legend><h2>Sign Up</h2></legend>
        <input type="email" v-model="sign_up_email" placeholder="Enter email" />
        <br/>
        <input type="password" v-model="sign_up_pwd" placeholder="Enter password" />
        <br/>
        <button @click="register">Sign Up</button>
      </fieldset>
    </div>
  </div>
</template>

<script>
import WelcomeService from '@/services/welcomeService'

export default {
  name: 'Welcome',

  data () {
    return {
      sign_in_email: '',
      sign_in_pwd: '',
      sign_up_email: '',
      sign_up_pwd: ''
    }
  },

  beforeCreate: function () {
    if (this.$session.exists()) {
      this.$router.push({ name: 'Home' })
    }
  },

  methods: {
    async auth () {
      if (this.sign_in_email === '' || this.sign_in_pwd === '') {
        alert('Email-Id OR Password cannot be blank')
        return false
      }
      const response = await WelcomeService.authenticate({
        email: this.sign_in_email,
        pwd: this.sign_in_pwd
      })
      // console.log(response.data)
      // console.log(response.data.msg)
      var vMsg = ''
      if (response.data.msg === 'success') {
        console.log('SUCCESSFUL SIGN-IN!')
        this.$session.start()
        this.$session.set('loggedUser', this.sign_in_email)
        this.$router.push({ name: 'Home' })
        return true
      } else if (response.data.msg === 'invalid') {
        vMsg = 'Password is incorrect!'
        console.log(vMsg)
        alert(vMsg)
      } else if (response.data.msg === 'no data') {
        vMsg = 'Email ID is not registered!'
        console.log(vMsg)
        alert(vMsg)
      } else {
        vMsg = 'Some problem with Sign In! Please try again later.'
        console.log(vMsg)
        alert(vMsg)
      }
    },

    async register () {
      if (this.sign_up_email === '' || this.sign_up_pwd === '') {
        alert('Email-Id OR Password cannot be blank')
        return false
      }
      const response = await WelcomeService.register({
        email: this.sign_up_email,
        pwd: this.sign_up_pwd
      })
      // console.log(response.data)
      // console.log(response.data.msg)
      var vMsg = ''
      if (response.data.msg === 'success') {
        console.log('SUCCESSFUL SIGN-UP!')
        vMsg = 'You are successfully signed up!'
      } else if (response.data.msg === 'found') {
        vMsg = 'Email ID already exixts!'
        console.log(vMsg)
      } else {
        vMsg = 'Some problem with Sign Up! Please try again later.'
        console.log(vMsg)
      }
      alert(vMsg)
    }
  }
}
</script>

<style>
#sign_in_div
{
  float: left;
  width: 49%;
}

#sign_up_div
{
  float: right;
  width: 49%;
}
</style>
