<template>
  <div>
    <h1>Get me some datez</h1>
    <div class="images-container">
      <p class="image" v-for="timelineResult in timelineResults">{{ timelineResult }}</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'radiohead-gifs',
  data() {
    return {
      timelineResults: [],
    };
  },
  created() {
    this.getTimeline();
  },
  methods: {
    getTimeline() {
      const apiServerBase = 'http://localhost:8000';
      const options = { crossdomain: true };
      const siteUrl = encodeURIComponent('radiohead.com/msgboard');
      const getTimelineEndpoint = '/api/wayback/web/timemap/link/';
      axios.get(`${apiServerBase}/api/wayback/available?url=${siteUrl}`, options);

      axios.get(`${apiServerBase}${getTimelineEndpoint}${siteUrl}`, options)
        .then(this.handleGetTimeline)
        .catch(this.handleGetTimelineError);
    },
    handleGetTimeline(timelineResults) {
      console.log('timelineResults', timelineResults);
      this.timelineResults = timelineResults.data;
    },
    handleGetTimelineError(error) {
      // eslint-disable-next-line
      console.error('oh noes, error getting timeline results :(', error);
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

  .image {
    flex: 0;
  }
</style>
