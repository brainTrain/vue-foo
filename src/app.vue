<template>
  <div id="app" class="app">
    <router-link class="logo" :to="{ name: 'Homepage' }">
      <img src="./assets/logo.svg">
    </router-link>

    <router-view/>
  </div>
</template>

<script>
import './main.css';

export default {
  name: 'app',
};
</script>

<style scoped>
.app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  min-height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.logo {
  display: inline-block;
}
</style>
