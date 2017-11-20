<template>
  <div>
    <h1>Ohhh</h1>
    <div class="images-container">
      <img v-for="image in images" :src="image" />
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
// eslint-disable-next-line
import VueFB from '../plugins/vue-fb';

export default {
  name: 'radiohead-gifs',
  data() {
    return {
      images: [],
    };
  },
  mounted() {
    window.addEventListener('fb-sdk-ready', this.handleFBLoaded);
  },
  beforeDestroy() {
    window.removeEventListener('fb-sdk-ready', this.handleFBLoaded);
  },
  created() {
    if (Vue.FB) {
      this.login();
    }
  },
  methods: {
    handleFBLoaded() {
      this.login();
    },
    login() {
      Vue.FB.login(this.fetchPosts);
    },
    fetchPosts() {
      Vue.FB.api(
        '/1658719094390640/feed?fields=id,type,link,created_time,message',
        'get',
        this.handlePostsFetched,
      );
    },
    handlePostsFetched(posts) {
      const { data } = posts;
      const images = data.map(({ link }) => link);

      this.images = images;
    },
  },
};
</script>

<style scoped>
  .images-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }
</style>
