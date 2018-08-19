<template>
  <!DOCTYPE html>
  <div id="app">
    <header>
      <h1>Real-time chat Application</h1>
      <h2>ChatSam</h2>
    </header>
    <hr>
    <router-view/>
    <br/>
    <footer>
      <p>&copy; ChatSam</p>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

footer, header
{
  background-color: darkgrey;
  float: left;
  width: 100%;
}
</style>
