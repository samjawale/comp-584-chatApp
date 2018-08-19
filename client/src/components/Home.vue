<template>
  <div class="home">
    <div id="info">
      <span>Logged in user: {{ loggedUser }}</span>
      <button @click="logout">Log Out</button>
    </div>
    <br />
    <div id="chat">
      <div id="chat_live">
        Chat with current user:
        <div id="chat_window">
          <p v-for="msg in currentChat" :key="msg.id">
            {{ msg.From }} | {{ msg.To }} | {{ msg.Message }} | {{ msg.Date }}
          </p>
        </div>
        <br />
        To:
        <select v-model="to_user" @click="fetchCurrentChat">
          <option disabled value="">Please select user</option>
          <option v-for="user in userList" :key="user.id">
            {{ user.email }}
          </option>
        </select>
        &nbsp;
        Message:<input v-model="msg" placeholder="type message here..." style="width:300px"/>
        <button @click="sendMsg">Send</button>
      </div>
      <div id="chat_history">
        Your Last 50 messages:
        <div id="history_window">
          <p v-for="msg in msgHistory" :key="msg.id">
            {{ msg.From }} | {{ msg.To }} | {{ msg.Message }} | {{ msg.Date }}
          </p>
        </div>
        <br />
        <button @click="fetchLastMsgs">Refresh Last 50 messages</button>
      </div>
    </div>
  </div>
</template>

<script>
import io from 'socket.io-client'
import HomeService from '@/services/homeService'

var socket = io('http://localhost:8081')

export default {
  name: 'Home',

  data () {
    return {
      loggedUser: '',
      to_user: '',
      msg: '',
      userList: [],
      currentChat: [],
      msgHistory: []
    }
  },

  beforeCreate () {
    if (!this.$session.exists()) {
      this.$router.push({ name: 'Welcome' })
    }
  },

  mounted () {
    this.loggedUser = this.$session.get('loggedUser')
    console.log(this.loggedUser)
    this.fetchUserList()
    this.fetchLastMsgs()
    this.chkMsg()
  },

  methods: {
    async chkMsg () {
      socket.on(this.loggedUser, function (data) {
        console.log('New msg...')
        var vJsonObj = {From: data.userFrom, To: this.loggedUser, Message: data.msg, Date: data.date}
        this.currentChat.push(vJsonObj)
        this.setScrollPos()
      }.bind(this))
    },

    async sendMsg () {
      if (this.to_user === null || this.to_user === '') {
        alert('Please select user first!')
      } else if (this.msg === null || this.msg === '') {
        alert('Blank message cannot be sent!')
      } else {
        var vDate = new Date()
        var vJsonObj = {From: this.loggedUser, To: this.to_user, Message: this.msg, Date: vDate}
        socket.emit('fromClient', vJsonObj)
        console.log('data sent...')
        this.currentChat.push(vJsonObj)
        this.setScrollPos()
      }
    },

    logout () {
      clearInterval(this.timer)
      socket.emit('disconnect')
      this.$session.destroy()
      this.$router.push({ name: 'Welcome' })
    },

    async fetchUserList () {
      const response = await HomeService.fetchUserList({
        userId: this.loggedUser
      })
      console.log('getting userlist... ')
      // console.log(response.data)
      if (response.data.msg === 'success') {
        this.userList = response.data.userList
      }
    },

    async fetchLastMsgs () {
      console.log('getting last msgs... ')
      const response = await HomeService.fetchLastMsgs({
        userId: this.loggedUser,
        limit: 50
      })
      // console.log('getting last msgs... ')
      // console.log(response.data)
      if (response.data.msg === 'success') {
        this.msgHistory = response.data.history
      }
    },

    async fetchCurrentChat () {
      if (this.to_user === '') {
        // console.log('No user selected!')
      } else {
        const response = await HomeService.fetchCurrentChat({
          userId: this.loggedUser,
          userFor: this.to_user
        })
        // console.log('getting live msgs... ')
        // console.log(response.data)
        if (response.data.msg === 'success') {
          this.currentChat = []
          for (var i = 0; i < response.data.todayChat.length; i++) {
            var vJsonObj = {From: response.data.todayChat[i].From, To: response.data.todayChat[i].To, Message: response.data.todayChat[i].Message, Date: response.data.todayChat[i].Date}
            this.currentChat.push(vJsonObj)
          }
          this.setScrollPos()
        }
      }
    },

    async setScrollPos () {
      // console.log('setting scroll positions')
      var objDiv = document.getElementById('chat_window')
      objDiv.scrollTop = objDiv.scrollHeight
    }
  },

  beforeDestroy () {
    // clearInterval(this.timer1)
    this.logout()
  }
}
</script>

<style>
#chat
{
  float: left;
  width: 100%;
}

#chat_live
{
  float: left;
  width: 49%;
}

#chat_history
{
  float: right;
  width: 49%;
}

#chat_window
{
  background-color: lightblue;
  height: 500px;
  width: 99%;
  overflow-y: auto;
}

#history_window
{
  background-color: lightblue;
  float: right;
  height: 500px;
  width: 99%;
  overflow-y: auto;
}
</style>
