<template>
  <div class="container">
    <router-link :to="{ name: 'RadioheadGifs' }">Um</router-link>
    <router-link :to="{ name: 'RadioheadGifs' }">Like</router-link>
    <router-link :to="{ name: 'RadioheadGifs' }">Whatever</router-link>
  </div>
</template>

<script>
export default {
  name: 'Homepage',
};
</script>

<style scoped>
.container {
}
</style>
