<template>
  <div class="container">
    <router-link :to="{ name: 'RadioheadGifs' }">Um</router-link>
    <router-link :to="{ name: 'RadioheadGifs' }">Like</router-link>
    <router-link :to="{ name: 'RadioheadGifs' }">Whatever</router-link>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  data() {
    return {
      msg: 'Welcome to Your Vue.js App',
    };
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.container {
}
</style>
