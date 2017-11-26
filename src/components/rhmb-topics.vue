<template>
  <div>
    <h1>Get me some datez</h1>
    <h3><b>Site:</b> {{ timelineUrl }}</h3>
    <h3><b>First Result:</b> {{ timelineFrom }}</h3>
    <h3><b>Wayback Query:</b> {{ timelineQuery }}</h3>
    <div class="links-container">
      <a
        target="_blank"
        v-for="timelineResult in timelineResults"
        :href="timelineResult.url"
      >
        {{ timelineResult.url }}
      </a>
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
      timelineFrom: '',
      timelineQuery: '',
      timelineUrl: '',
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
      const { results, from, query, url } = timelineResults.data;

      this.timelineResults = results;
      this.timelineFrom = from;
      this.timelineQuery = query;
      this.timelineUrl = url;
    },
    handleGetTimelineError(error) {
      // eslint-disable-next-line
      console.error('oh noes, error getting timeline results :(', error);
    },
  },
};
</script>

<style scoped>
  .links-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
</style>
