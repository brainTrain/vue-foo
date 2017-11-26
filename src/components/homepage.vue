<template>
  <div class="container">
    <router-link :to="{ name: 'RadioheadGifs' }">Um</router-link>
    <router-link :to="{ name: 'RadioheadGifs' }">Like</router-link>
    <router-link :to="{ name: 'RHMBTopics' }">Whatever</router-link>
  </div>
</template>

<script>
export default {
  name: 'Homepage',
};
</script>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: -5px;
}

a {
  margin-left: 5px;
}
</style>
